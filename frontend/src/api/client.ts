import type { CourseSummary, PlaylistVideos, Resource, Subtopic, TopicSummary } from './types'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function get(path: string): Promise<Response> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new ApiError(response.status, `Request to ${path} failed with status ${response.status}`)
  }
  return response
}

async function getJson<T>(path: string): Promise<T> {
  const data: T = await (await get(path)).json()
  return data
}

export const api = {
  getTopics: () => getJson<TopicSummary[]>('/api/topics'),

  getTopicCourses: (topicId: string) =>
    getJson<CourseSummary[]>(`/api/topics/${encodeURIComponent(topicId)}/courses`),

  getCourse: (courseId: string) => getJson<CourseSummary>(`/api/courses/${encodeURIComponent(courseId)}`),

  getCourseResources: (courseId: string) =>
    getJson<Resource[]>(`/api/courses/${encodeURIComponent(courseId)}/resources`),

  getStudyGuide: (courseId: string, resourceId: string) =>
    get(`/api/courses/${encodeURIComponent(courseId)}/resources/${encodeURIComponent(resourceId)}/content`).then(
      (response) => response.text(),
    ),

  getCourseSubtopics: (courseId: string) =>
    getJson<Subtopic[]>(`/api/courses/${encodeURIComponent(courseId)}/subtopics`),

  getPlaylistVideos: (playlistId: string) =>
    getJson<PlaylistVideos>(`/api/playlists/${encodeURIComponent(playlistId)}/videos`),
}
