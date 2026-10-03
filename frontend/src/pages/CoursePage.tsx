import { useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { CourseSummary, Resource } from '../api/types'
import { Navbar } from '../components/Navbar'
import { ResourceSidebar, type SelectedKey } from '../components/ResourceSidebar'
import { ResourceViewer } from '../components/ResourceViewer'
import { useFetch } from '../hooks/useFetch'
import './CoursePage.css'

async function loadCoursePage(courseId: string) {
  const [course, resources, topics] = await Promise.all([
    api.getCourse(courseId),
    api.getCourseResources(courseId),
    api.getTopics(),
  ])
  const topicTitle = topics.find((topic) => topic.id === course.topicId)?.title ?? 'topics'
  return { course, resources, topicTitle }
}

export function CoursePage() {
  const { courseId = '' } = useParams<{ courseId: string }>()
  const { data, error, loading } = useFetch(() => loadCoursePage(courseId), [courseId])

  if (loading) {
    return <CourseShell><p className="course-page__status">Loading course…</p></CourseShell>
  }

  if (error || !data) {
    const notFound = error instanceof ApiError && error.status === 404
    return (
      <CourseShell>
        <h1>{notFound ? 'Course not found' : 'Could not load this course'}</h1>
        <Link to="/">← Back to home</Link>
      </CourseShell>
    )
  }

  return (
    <CoursePageContent
      key={data.course.id}
      course={data.course}
      topicTitle={data.topicTitle}
      resources={data.resources}
    />
  )
}

function CourseShell({ children }: { children: ReactNode }) {
  return (
    <div className="course-page">
      <Navbar />
      <div className="course-page__not-found">{children}</div>
    </div>
  )
}

interface CoursePageContentProps {
  course: CourseSummary
  topicTitle: string
  resources: Resource[]
}

function CoursePageContent({ course, topicTitle, resources }: CoursePageContentProps) {
  const [selectedKey, setSelectedKey] = useState<SelectedKey>(
    resources.length > 0 ? resources[0].id : 'interactive',
  )

  const selectedResource = useMemo(
    () => resources.find((resource) => resource.id === selectedKey),
    [resources, selectedKey],
  )

  return (
    <div className="course-page">
      <Navbar />
      <div className="course-page__banner">
        <div className="course-page__banner-content">
          <Link to="/" className="course-page__back">
            ← Back to {topicTitle}
          </Link>
          <h1 className="course-page__title">{course.title}</h1>
          <p className="course-page__description">{course.description}</p>
        </div>
      </div>

      <div className="course-page__body">
        <ResourceSidebar resources={resources} selectedKey={selectedKey} onSelect={setSelectedKey} />

        <div className="course-page__main">
          {selectedKey === 'interactive' ? (
            <div className="course-page__interactive-placeholder">
              <h2>Interactive Exercise</h2>
              <p>An AI-powered interactive learning element for this course will appear here. Coming soon.</p>
            </div>
          ) : selectedResource ? (
            <ResourceViewer resource={selectedResource} />
          ) : (
            <div className="course-page__interactive-placeholder">
              <h2>No resources yet</h2>
              <p>Resources for this course will appear here once they are added.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
