namespace StudySage.Api.Models;

// Mirrors the nested shape of Data/content.json (Topic -> Courses -> Resources).
public sealed record ContentFile(List<Topic> Topics);

public sealed record Topic(string Id, string Title, List<Course> Courses);

public sealed record ImageCredit(string Name, string Url, string License);

public sealed record Course(
    string Id,
    string Title,
    string Description,
    string AccentGradient,
    List<Resource> Resources,
    string? ImageUrl = null,
    ImageCredit? ImageCredit = null,
    object? InteractiveElement = null);
