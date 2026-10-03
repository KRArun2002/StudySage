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
  imageUrl: string | null
  imageCredit: { name: string; url: string; license: string } | null
  resourceCount: number
  /** Number of topic tabs (e.g. Arrays, Linked Lists), each with its own playlists and practice problems. */
  subtopicCount: number
  /** The practice element for this course, or null when the course has none yet. */
  interactiveElement: InteractiveElement | null
}

export type VisualizerModule = 'array' | 'linked-list' | 'stack' | 'queue' | 'tree' | 'graph'

export interface DataStructureVisualizerElement {
  type: 'ds-visualizer'
  modules: VisualizerModule[]
}

export type InteractiveElement = DataStructureVisualizerElement

export type ResourceType = 'youtube_video' | 'youtube_playlist' | 'document' | 'external_link' | 'study_guide'

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

/** Markdown notes written for the course; the text is fetched separately from the resource list. */
export interface StudyGuideResource extends ResourceBase {
  type: 'study_guide'
}

export type Resource =
  | YoutubeVideoResource
  | YoutubePlaylistResource
  | DocumentResource
  | ExternalLinkResource
  | StudyGuideResource

export interface PlaylistRef {
  id: string
  title: string
  description?: string | null
  playlistId: string
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface PracticeProblem {
  /** The LeetCode slug; also the key used to remember whether the problem is solved. */
  id: string
  title: string
  difficulty: Difficulty
  url: string
}

export interface Subtopic {
  id: string
  title: string
  description?: string | null
  playlists: PlaylistRef[]
  problems: PracticeProblem[]
}

export interface PlaylistVideo {
  videoId: string
  title: string
  thumbnailUrl: string
}

export interface PlaylistVideos {
  playlistId: string
  title: string | null
  videos: PlaylistVideo[]
  /** False when only the first part of a longer playlist could be loaded. */
  isComplete: boolean
}
