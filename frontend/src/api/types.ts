export interface TopicSummary {
  id: string
  title: string
}

export interface CourseSummary {
  id: string
  topicId: string
  title: string
  description: string
  accentGradient: string
  resourceCount: number
  /** Reserved for a future AI-powered interactive exercise. Always null for now. */
  interactiveElement: unknown | null
}

export type ResourceType = 'youtube_video' | 'youtube_playlist' | 'document' | 'external_link'

interface ResourceBase {
  id: string
  type: ResourceType
  title: string
  description?: string | null
}

export interface YoutubeVideoResource extends ResourceBase {
  type: 'youtube_video'
  videoId: string
}

export interface YoutubePlaylistResource extends ResourceBase {
  type: 'youtube_playlist'
  playlistId: string
}

export interface DocumentResource extends ResourceBase {
  type: 'document'
  url: string
}

export interface ExternalLinkResource extends ResourceBase {
  type: 'external_link'
  url: string
}

export type Resource =
  | YoutubeVideoResource
  | YoutubePlaylistResource
  | DocumentResource
  | ExternalLinkResource
