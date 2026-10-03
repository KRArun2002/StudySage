using Microsoft.AspNetCore.Mvc;
using StudySage.Api.Dtos;
using StudySage.Api.Models;
using StudySage.Api.Services;

namespace StudySage.Api.Controllers;

[ApiController]
[Route("api/courses")]
public sealed class CoursesController(IContentRepository content) : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyList<CourseDto>> GetCourses([FromQuery] string? topicId)
    {
        if (topicId is not null && !content.TopicExists(topicId))
        {
            return NotFound();
        }

        return Ok(content.GetCourses(topicId));
    }

    [HttpGet("{courseId}")]
    public ActionResult<CourseDto> GetCourse(string courseId)
    {
        var course = content.GetCourse(courseId);
        return course is null ? NotFound() : Ok(course);
    }

    [HttpGet("{courseId}/resources")]
    public ActionResult<IReadOnlyList<Resource>> GetCourseResources(string courseId)
    {
        var resources = content.GetCourseResources(courseId);
        return resources is null ? NotFound() : Ok(resources);
    }

    [HttpGet("{courseId}/subtopics")]
    public ActionResult<IReadOnlyList<SubtopicDto>> GetCourseSubtopics(string courseId)
    {
        var subtopics = content.GetCourseSubtopics(courseId);
        return subtopics is null ? NotFound() : Ok(subtopics);
    }
}
