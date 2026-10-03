using System.Text.Json;
using StudySage.Api.Dtos;
using StudySage.Api.Models;

namespace StudySage.Api.Services;

public sealed class JsonContentRepository : IContentRepository
{
    private readonly IReadOnlyList<TopicDto> _topics;
    private readonly IReadOnlyDictionary<string, IReadOnlyList<CourseDto>> _coursesByTopic;
    private readonly IReadOnlyList<CourseDto> _allCourses;
    private readonly IReadOnlyDictionary<string, CourseEntry> _coursesById;
    private readonly IReadOnlySet<string> _playlistIds;

    private sealed record CourseEntry(CourseDto Course, IReadOnlyList<Resource> Resources, IReadOnlyList<SubtopicDto> Subtopics);

    public JsonContentRepository()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "Data", "content.json");
        var json = File.ReadAllText(path);
        var file = JsonSerializer.Deserialize<ContentFile>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web))
            ?? throw new InvalidOperationException($"Could not read content from {path}.");

        var topics = new List<TopicDto>();
        var coursesByTopic = new Dictionary<string, IReadOnlyList<CourseDto>>();
        var allCourses = new List<CourseDto>();
        var coursesById = new Dictionary<string, CourseEntry>();
        var playlistIds = new HashSet<string>();

        // Dictionary.Add throws on duplicate ids, so content mistakes fail fast at startup.
        foreach (var topic in file.Topics)
        {
            topics.Add(new TopicDto(topic.Id, topic.Title));

            var topicCourses = new List<CourseDto>();
            foreach (var course in topic.Courses)
            {
                var subtopics = BuildSubtopics(course);
                foreach (var subtopic in subtopics)
                {
                    playlistIds.UnionWith(subtopic.Playlists.Select(playlist => playlist.PlaylistId));
                }
                playlistIds.UnionWith(course.Resources.OfType<YoutubePlaylistResource>().Select(resource => resource.PlaylistId));

                var dto = new CourseDto(
                    course.Id,
                    topic.Id,
                    course.Title,
                    course.Description,
                    course.AccentGradient,
                    course.ImageUrl,
                    course.ImageCredit,
                    course.Resources.Count,
                    subtopics.Count,
                    course.InteractiveElement);

                topicCourses.Add(dto);
                allCourses.Add(dto);
                coursesById.Add(course.Id, new CourseEntry(dto, course.Resources, subtopics));
            }

            coursesByTopic.Add(topic.Id, topicCourses);
        }

        _topics = topics;
        _coursesByTopic = coursesByTopic;
        _allCourses = allCourses;
        _coursesById = coursesById;
        _playlistIds = playlistIds;
    }

    // Tab keys the course page uses for its built-in tabs (see CoursePage.tsx).
    private static readonly HashSet<string> ReservedTabIds = ["leetcode", "visualizer", "resources"];

    private static List<SubtopicDto> BuildSubtopics(Course course)
    {
        var subtopics = (course.Subtopics ?? [])
            .Select(subtopic => new SubtopicDto(
                subtopic.Id,
                subtopic.Title,
                subtopic.Description,
                subtopic.Playlists ?? [],
                subtopic.Problems ?? []))
            .ToList();

        // Ids drive tab keys and saved progress, so duplicates are content mistakes worth failing on.
        EnsureUnique(subtopics.Select(subtopic => subtopic.Id), $"subtopic id in course '{course.Id}'");
        if (subtopics.FirstOrDefault(subtopic => ReservedTabIds.Contains(subtopic.Id)) is { } reserved)
        {
            throw new InvalidOperationException(
                $"Subtopic id '{reserved.Id}' in course '{course.Id}' clashes with a built-in course tab; choose another id.");
        }
        foreach (var subtopic in subtopics)
        {
            EnsureUnique(subtopic.Playlists.Select(playlist => playlist.Id), $"playlist id in '{course.Id}/{subtopic.Id}'");
            EnsureUnique(subtopic.Problems.Select(problem => problem.Id), $"problem id in '{course.Id}/{subtopic.Id}'");
        }

        return subtopics;
    }

    private static void EnsureUnique(IEnumerable<string> ids, string what)
    {
        var duplicate = ids.GroupBy(id => id).FirstOrDefault(group => group.Count() > 1);
        if (duplicate is not null)
        {
            throw new InvalidOperationException($"Duplicate {what}: '{duplicate.Key}'.");
        }
    }

    public IReadOnlyList<TopicDto> GetTopics() => _topics;

    public bool TopicExists(string topicId) => _coursesByTopic.ContainsKey(topicId);

    public IReadOnlyList<CourseDto> GetCourses(string? topicId = null) =>
        topicId is null ? _allCourses : _coursesByTopic.GetValueOrDefault(topicId) ?? [];

    public CourseDto? GetCourse(string courseId) =>
        _coursesById.TryGetValue(courseId, out var entry) ? entry.Course : null;

    public IReadOnlyList<Resource>? GetCourseResources(string courseId) =>
        _coursesById.TryGetValue(courseId, out var entry) ? entry.Resources : null;

    public IReadOnlyList<SubtopicDto>? GetCourseSubtopics(string courseId) =>
        _coursesById.TryGetValue(courseId, out var entry) ? entry.Subtopics : null;

    public bool IsKnownPlaylist(string playlistId) => _playlistIds.Contains(playlistId);
}
