import Markdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import './StudyGuide.css'

interface StudyGuideProps {
  courseId: string
  resourceId: string
}

// Guides link out to YouTube and LeetCode; open those without leaving the course page.
const components: Components = {
  a: ({ href, children }) => {
    const external = href?.startsWith('http')
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
        {children}
      </a>
    )
  },
  table: ({ children }) => (
    <div className="study-guide__table">
      <table>{children}</table>
    </div>
  ),
}

export function StudyGuide({ courseId, resourceId }: StudyGuideProps) {
  const { data, error, loading } = useFetch(() => api.getStudyGuide(courseId, resourceId), [courseId, resourceId])

  if (loading) return <p className="study-guide__status">Loading notes…</p>
  if (error || data === undefined) return <p className="study-guide__status">Couldn't load these notes. Try again later.</p>

  return (
    <article className="study-guide">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {data}
      </Markdown>
    </article>
  )
}
