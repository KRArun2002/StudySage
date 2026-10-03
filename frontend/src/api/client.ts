import type { CourseSummary, PlaylistVideos, Resource, Subtopic, TopicSummary } from './types'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new ApiError(response.status, `Request to ${path} failed with status ${response.status}`)
  }
  const data: T = await response.json()
  return data
}

export const api = {
  getTopics: () => getJson<TopicSummary[]>('/api/topics'),

  getTopicCourses: (topicId: string) =>
    getJson<CourseSummary[]>(`/api/topics/${encodeURIComponent(topicId)}/courses`),

  getCourse: (courseId: string) => getJson<CourseSummary>(`/api/courses/${encodeURIComponent(courseId)}`),

  getCourseResources: (courseId: string) =>
    getJson<Resource[]>(`/api/courses/${encodeURIComponent(courseId)}/resources`),

  getCourseSubtopics: (courseId: string) =>
    getJson<Subtopic[]>(`/api/courses/${encodeURIComponent(courseId)}/subtopics`),

  getPlaylistVideos: (playlistId: string) =>
    getJson<PlaylistVideos>(`/api/playlists/${encodeURIComponent(playlistId)}/videos`),
}
