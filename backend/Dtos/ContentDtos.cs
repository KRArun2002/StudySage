using StudySage.Api.Models;

namespace StudySage.Api.Dtos;

public sealed record TopicDto(string Id, string Title);

public sealed record CourseDto(
    string Id,
    string TopicId,
    string Title,
    string Description,
    string AccentGradient,
    string? ImageUrl,
    ImageCredit? ImageCredit,
    int ResourceCount,
    object? InteractiveElement);
