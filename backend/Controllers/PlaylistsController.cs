using Microsoft.AspNetCore.Mvc;
using StudySage.Api.Dtos;
using StudySage.Api.Services;

namespace StudySage.Api.Controllers;

[ApiController]
[Route("api/playlists")]
public sealed class PlaylistsController(IContentRepository content, IPlaylistService playlists) : ControllerBase
{
    [HttpGet("{playlistId}/videos")]
    public async Task<ActionResult<PlaylistVideosDto>> GetVideos(string playlistId, CancellationToken cancellationToken)
    {
        // Only playlists referenced in content.json, so this endpoint can't be used as an open YouTube proxy.
        if (!content.IsKnownPlaylist(playlistId))
        {
            return NotFound();
        }

        try
        {
            return Ok(await playlists.GetVideosAsync(playlistId, cancellationToken));
        }
        catch (PlaylistUnavailableException ex)
        {
            return Problem(ex.Message, statusCode: StatusCodes.Status502BadGateway);
        }
    }
}
