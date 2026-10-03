namespace StudySage.Api.Models;

// Mirrors the nested shape of Data/content.json (Topic -> Courses -> Resources).
public sealed record ContentFile(List<Topic> Topics);

public sealed record Topic(string Id, string Title, List<Course> Courses);

public sealed record Course(
    string Id,
    string Title,
    string Description,
    string AccentGradient,
    List<Resource> Resources,
    object? InteractiveElement = null);
