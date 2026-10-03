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
}
