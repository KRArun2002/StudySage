using StudySage.Api.Dtos;

namespace StudySage.Api.Services;

public interface IPlaylistService
{
    /// <summary>Loads the videos of a YouTube playlist. Throws <see cref="PlaylistUnavailableException"/> if YouTube can't be reached.</summary>
    Task<PlaylistVideosDto> GetVideosAsync(string playlistId, CancellationToken cancellationToken);
}

public sealed class PlaylistUnavailableException(string message, Exception? inner = null) : Exception(message, inner);
