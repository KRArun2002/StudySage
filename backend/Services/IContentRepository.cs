using StudySage.Api.Dtos;
using StudySage.Api.Models;

namespace StudySage.Api.Services;

public interface IContentRepository
{
    IReadOnlyList<TopicDto> GetTopics();

    bool TopicExists(string topicId);

    /// <summary>Returns all courses, or only those belonging to <paramref name="topicId"/> when provided.</summary>
    IReadOnlyList<CourseDto> GetCourses(string? topicId = null);

    CourseDto? GetCourse(string courseId);

    IReadOnlyList<Resource>? GetCourseResources(string courseId);

    IReadOnlyList<SubtopicDto>? GetCourseSubtopics(string courseId);

    /// <summary>The Markdown text of a study guide resource, or null if the course has no such guide.</summary>
    string? GetStudyGuide(string courseId, string resourceId);

    /// <summary>True when some course references this YouTube playlist, so the API only proxies known playlists.</summary>
    bool IsKnownPlaylist(string playlistId);
}
