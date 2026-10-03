import { useState, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { CourseSummary, Resource, Subtopic } from '../api/types'
import { CourseTabs, type CourseTab } from '../components/CourseTabs'
import { Navbar } from '../components/Navbar'
import { ResourceSidebar } from '../components/ResourceSidebar'
import { ResourceViewer } from '../components/ResourceViewer'
import { TopicLesson } from '../components/TopicLesson'
import { PracticePanel } from '../components/practice/PracticePanel'
import { LeetCodePractice } from '../components/problems/LeetCodePractice'
import { useFetch } from '../hooks/useFetch'
import { useSolvedProblems } from '../hooks/useSolvedProblems'
import './CoursePage.css'

// Fixed tabs that follow the course's topic tabs. Subtopic ids in content.json must not reuse these.
const LEETCODE_TAB = 'leetcode'
const VISUALIZER_TAB = 'visualizer'
const RESOURCES_TAB = 'resources'

async function loadCoursePage(courseId: string) {
  const [course, resources, subtopics, topics] = await Promise.all([
    api.getCourse(courseId),
    api.getCourseResources(courseId),
    api.getCourseSubtopics(courseId),
    api.getTopics(),
  ])
  const topicTitle = topics.find((topic) => topic.id === course.topicId)?.title ?? 'topics'
  return { course, resources, subtopics, topicTitle }
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
      subtopics={data.subtopics}
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
  subtopics: Subtopic[]
}

function CoursePageContent({ course, topicTitle, resources, subtopics }: CoursePageContentProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedResourceId, setSelectedResourceId] = useState(resources[0]?.id)
  const { solved } = useSolvedProblems()

  const problems = subtopics.flatMap((subtopic) => subtopic.problems)
  const tabs: CourseTab[] = [
    ...subtopics.map((subtopic) => ({ key: subtopic.id, label: subtopic.title, group: 'topic' as const })),
    ...(problems.length > 0
      ? [{
          key: LEETCODE_TAB,
          label: 'LeetCode Practice',
          group: 'tool' as const,
          badge: `${problems.filter((problem) => solved.has(problem.id)).length}/${problems.length}`,
        }]
      : []),
    ...(course.interactiveElement ? [{ key: VISUALIZER_TAB, label: 'Interactive Visualizer', group: 'tool' as const }] : []),
    ...(resources.length > 0 ? [{ key: RESOURCES_TAB, label: 'Resources', group: 'tool' as const }] : []),
  ]

  const requestedTab = searchParams.get('tab')
  const activeKey = tabs.find((tab) => tab.key === requestedTab)?.key ?? tabs[0]?.key
  const selectTab = (key: string) => setSearchParams({ tab: key }, { replace: true })

  const activeSubtopic = subtopics.find((subtopic) => subtopic.id === activeKey)
  const selectedResource = resources.find((resource) => resource.id === selectedResourceId) ?? resources[0]

  return (
    <div className="course-page">
      <Navbar />
      <div className="course-page__banner" style={{ background: course.accentGradient }}>
        <div className="course-page__banner-content">
          <Link to="/" className="course-page__back">
            ← Back to {topicTitle}
          </Link>
          <h1 className="course-page__title">{course.title}</h1>
          <p className="course-page__description">{course.description}</p>
        </div>
      </div>

      <div className="course-page__body">
        {tabs.length > 0 && <CourseTabs tabs={tabs} activeKey={activeKey} onSelect={selectTab} />}

        <div className="course-page__panel" role="tabpanel">
          {activeSubtopic ? (
            <TopicLesson key={activeSubtopic.id} subtopic={activeSubtopic} onPractice={() => selectTab(LEETCODE_TAB)} />
          ) : activeKey === LEETCODE_TAB ? (
            <LeetCodePractice subtopics={subtopics} />
          ) : activeKey === VISUALIZER_TAB && course.interactiveElement?.type === 'ds-visualizer' ? (
            <PracticePanel modules={course.interactiveElement.modules} />
          ) : activeKey === RESOURCES_TAB && selectedResource ? (
            <div className="course-page__resources">
              <ResourceSidebar resources={resources} selectedId={selectedResource.id} onSelect={setSelectedResourceId} />
              <div className="course-page__main">
                <ResourceViewer resource={selectedResource} />
              </div>
            </div>
          ) : (
            <div className="course-page__interactive-placeholder">
              <h2>Content coming soon</h2>
              <p>Videos, practice problems, and resources for this course will appear here once they are added.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
