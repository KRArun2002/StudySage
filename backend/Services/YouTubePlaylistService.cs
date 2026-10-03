using System.Text.Json;
using System.Xml.Linq;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using StudySage.Api.Dtos;

namespace StudySage.Api.Services;

/// <summary>
/// Uses the YouTube Data API when an API key is configured (full playlists). Without a key it falls back to the
/// public playlist RSS feed, which needs no credentials but only lists the first 15 videos.
/// </summary>
public sealed class YouTubePlaylistService(
    HttpClient http,
    IMemoryCache cache,
    IOptions<YouTubeOptions> options,
    ILogger<YouTubePlaylistService> logger) : IPlaylistService
{
    private const int FeedPageSize = 15;
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(1);

    private static readonly XNamespace Atom = "http://www.w3.org/2005/Atom";
    private static readonly XNamespace Yt = "http://www.youtube.com/xml/schemas/2015";

    public async Task<PlaylistVideosDto> GetVideosAsync(string playlistId, CancellationToken cancellationToken)
    {
        var cacheKey = $"playlist:{playlistId}";
        if (cache.TryGetValue(cacheKey, out PlaylistVideosDto? cached) && cached is not null)
        {
            return cached;
        }

        var result = await LoadAsync(playlistId, cancellationToken);
        cache.Set(cacheKey, result, CacheDuration);
        return result;
    }

    private async Task<PlaylistVideosDto> LoadAsync(string playlistId, CancellationToken cancellationToken)
    {
        var apiKey = options.Value.ApiKey;
        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            try
            {
                return await LoadFromDataApiAsync(playlistId, apiKey, cancellationToken);
            }
            catch (Exception ex) when (ex is HttpRequestException or JsonException or KeyNotFoundException)
            {
                logger.LogWarning(ex, "YouTube Data API failed for playlist {PlaylistId}; falling back to the RSS feed.", playlistId);
            }
        }

        try
        {
            return await LoadFromFeedAsync(playlistId, cancellationToken);
        }
        catch (Exception ex) when (ex is HttpRequestException or System.Xml.XmlException)
        {
            throw new PlaylistUnavailableException($"Could not load playlist {playlistId} from YouTube.", ex);
        }
    }

    private async Task<PlaylistVideosDto> LoadFromFeedAsync(string playlistId, CancellationToken cancellationToken)
    {
        var url = $"https://www.youtube.com/feeds/videos.xml?playlist_id={Uri.EscapeDataString(playlistId)}";
        await using var stream = await http.GetStreamAsync(url, cancellationToken);
        var feed = await XDocument.LoadAsync(stream, LoadOptions.None, cancellationToken);

        var videos = feed.Root!.Elements(Atom + "entry")
            .Select(entry => (string?)entry.Element(Yt + "videoId") is { } videoId
                ? new PlaylistVideoDto(videoId, (string?)entry.Element(Atom + "title") ?? "Untitled video", ThumbnailUrl(videoId))
                : null)
            .OfType<PlaylistVideoDto>()
            .ToList();

        var title = (string?)feed.Root.Element(Atom + "title");
        // The feed is capped, so a full page means there may be more videos than we can see.
        return new PlaylistVideosDto(playlistId, title, videos, IsComplete: videos.Count < FeedPageSize);
    }

    private async Task<PlaylistVideosDto> LoadFromDataApiAsync(string playlistId, string apiKey, CancellationToken cancellationToken)
    {
        var videos = new List<PlaylistVideoDto>();
        string? pageToken = null;
        var maxVideos = options.Value.MaxVideos;

        do
        {
            var url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50"
                + $"&playlistId={Uri.EscapeDataString(playlistId)}&key={Uri.EscapeDataString(apiKey)}"
                + (pageToken is null ? "" : $"&pageToken={Uri.EscapeDataString(pageToken)}");

            using var response = await http.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();
            using var json = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(cancellationToken), cancellationToken: cancellationToken);

            foreach (var item in json.RootElement.GetProperty("items").EnumerateArray())
            {
                var snippet = item.GetProperty("snippet");
                var videoId = snippet.GetProperty("resourceId").GetProperty("videoId").GetString();
                var title = snippet.GetProperty("title").GetString() ?? "Untitled video";
                // Private and deleted videos stay in playlists as placeholders without thumbnails.
                if (videoId is null || !snippet.TryGetProperty("thumbnails", out var thumbnails) || !thumbnails.EnumerateObject().Any())
                {
                    continue;
                }
                videos.Add(new PlaylistVideoDto(videoId, title, ThumbnailUrl(videoId)));
            }

            pageToken = json.RootElement.TryGetProperty("nextPageToken", out var next) ? next.GetString() : null;
        }
        while (pageToken is not null && videos.Count < maxVideos);

        return new PlaylistVideosDto(playlistId, Title: null, videos, IsComplete: pageToken is null);
    }

    private static string ThumbnailUrl(string videoId) => $"https://i.ytimg.com/vi/{videoId}/mqdefault.jpg";
}
