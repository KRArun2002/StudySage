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

    private sealed record CourseEntry(CourseDto Course, IReadOnlyList<Resource> Resources);

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

        // Dictionary.Add throws on duplicate ids, so content mistakes fail fast at startup.
        foreach (var topic in file.Topics)
        {
            topics.Add(new TopicDto(topic.Id, topic.Title));

            var topicCourses = new List<CourseDto>();
            foreach (var course in topic.Courses)
            {
                var dto = new CourseDto(
                    course.Id,
                    topic.Id,
                    course.Title,
                    course.Description,
                    course.AccentGradient,
                    course.Resources.Count,
                    course.InteractiveElement);

                topicCourses.Add(dto);
                allCourses.Add(dto);
                coursesById.Add(course.Id, new CourseEntry(dto, course.Resources));
            }

            coursesByTopic.Add(topic.Id, topicCourses);
        }

        _topics = topics;
        _coursesByTopic = coursesByTopic;
        _allCourses = allCourses;
        _coursesById = coursesById;
    }

    public IReadOnlyList<TopicDto> GetTopics() => _topics;

    public bool TopicExists(string topicId) => _coursesByTopic.ContainsKey(topicId);

    public IReadOnlyList<CourseDto> GetCourses(string? topicId = null) =>
        topicId is null ? _allCourses : _coursesByTopic.GetValueOrDefault(topicId) ?? [];

    public CourseDto? GetCourse(string courseId) =>
        _coursesById.TryGetValue(courseId, out var entry) ? entry.Course : null;

    public IReadOnlyList<Resource>? GetCourseResources(string courseId) =>
        _coursesById.TryGetValue(courseId, out var entry) ? entry.Resources : null;
}
