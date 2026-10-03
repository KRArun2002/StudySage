using System.Text.Json.Serialization;

namespace StudySage.Api.Models;

// Adding a new resource type: create a sealed record deriving from Resource and add a JsonDerivedType entry.
[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(YoutubeVideoResource), "youtube_video")]
[JsonDerivedType(typeof(YoutubePlaylistResource), "youtube_playlist")]
[JsonDerivedType(typeof(DocumentResource), "document")]
[JsonDerivedType(typeof(ExternalLinkResource), "external_link")]
public abstract record Resource(string Id, string Title, string? Description);

public sealed record YoutubeVideoResource(string Id, string Title, string? Description, string VideoId)
    : Resource(Id, Title, Description);

public sealed record YoutubePlaylistResource(string Id, string Title, string? Description, string PlaylistId)
    : Resource(Id, Title, Description);

public sealed record DocumentResource(string Id, string Title, string? Description, string Url)
    : Resource(Id, Title, Description);

public sealed record ExternalLinkResource(string Id, string Title, string? Description, string Url)
    : Resource(Id, Title, Description);
