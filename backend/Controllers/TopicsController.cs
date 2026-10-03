using Microsoft.AspNetCore.Mvc;
using StudySage.Api.Dtos;
using StudySage.Api.Services;

namespace StudySage.Api.Controllers;

[ApiController]
[Route("api/topics")]
public sealed class TopicsController(IContentRepository content) : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyList<TopicDto>> GetTopics() => Ok(content.GetTopics());

    [HttpGet("{topicId}/courses")]
    public ActionResult<IReadOnlyList<CourseDto>> GetTopicCourses(string topicId)
    {
        if (!content.TopicExists(topicId))
        {
            return NotFound();
        }

        return Ok(content.GetCourses(topicId));
    }
}
