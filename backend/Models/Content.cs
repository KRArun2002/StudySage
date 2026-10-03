using System.Text.Json.Serialization;

namespace StudySage.Api.Models;

// Mirrors the nested shape of Data/content.json (Topic -> Courses -> Resources / Subtopics).
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
    object? InteractiveElement = null,
    List<Subtopic>? Subtopics = null);

/// <summary>One tab inside a course (e.g. "Arrays"), with its own playlists and practice problems.</summary>
public sealed record Subtopic(
    string Id,
    string Title,
    string? Description,
    List<PlaylistRef>? Playlists,
    List<PracticeProblem>? Problems);

public sealed record PlaylistRef(string Id, string Title, string? Description, string PlaylistId);

public sealed record PracticeProblem(string Id, string Title, ProblemDifficulty Difficulty, string Url);

[JsonConverter(typeof(JsonStringEnumConverter<ProblemDifficulty>))]
public enum ProblemDifficulty
{
    Easy,
    Medium,
    Hard,
}
