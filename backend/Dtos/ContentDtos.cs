using StudySage.Api.Models;

namespace StudySage.Api.Dtos;

public sealed record TopicDto(string Id, string Title);

public sealed record CourseDto(
    string Id,
    string TopicId,
    string Title,
    string Description,
    string AccentGradient,
    int ResourceCount,
    int SubtopicCount,
    object? InteractiveElement);

public sealed record SubtopicDto(
    string Id,
    string Title,
    string? Description,
    IReadOnlyList<PlaylistRef> Playlists,
    IReadOnlyList<PracticeProblem> Problems);

public sealed record PlaylistVideoDto(string VideoId, string Title, string ThumbnailUrl);

/// <param name="IsComplete">False when only the first page of a longer playlist could be loaded.</param>
public sealed record PlaylistVideosDto(string PlaylistId, string? Title, IReadOnlyList<PlaylistVideoDto> Videos, bool IsComplete);
