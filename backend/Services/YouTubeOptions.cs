namespace StudySage.Api.Services;

/// <summary>
/// Bound from the "YouTube" config section. Keep the key out of source control: set it with
/// <c>dotnet user-secrets set "YouTube:ApiKey" "..."</c> or the <c>YouTube__ApiKey</c> environment variable.
/// </summary>
public sealed class YouTubeOptions
{
    public string? ApiKey { get; set; }

    /// <summary>Upper bound on videos fetched per playlist through the Data API (50 per request).</summary>
    public int MaxVideos { get; set; } = 200;
}
