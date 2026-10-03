import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { CourseSummary } from '../api/types'
import './CourseCard.css'

const HOVER_DESCRIPTION_MAX_CHARS = 60

interface CourseCardProps {
  course: CourseSummary
}

function posterStyle(course: CourseSummary): CSSProperties {
  if (!course.imageUrl) {
    return { background: course.accentGradient }
  }
  return {
    backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.1) 60%), url("${course.imageUrl}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
}

function shortenAtWord(text: string, maxChars: number): { text: string; truncated: boolean } {
  if (text.length <= maxChars) {
    return { text, truncated: false }
  }
  const cut = text.slice(0, maxChars)
  const lastSpace = cut.lastIndexOf(' ')
  const shortened = (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,.;:\s]+$/, '')
  return { text: shortened, truncated: true }
}

export function CourseCard({ course }: CourseCardProps) {
  const { resourceCount } = course
  const description = shortenAtWord(course.description, HOVER_DESCRIPTION_MAX_CHARS)

  return (
    <div className="course-card">
      <div className="course-card__poster" style={posterStyle(course)}>
        <span className="course-card__poster-title">{course.title}</span>
        <div className="course-card__overlay">
          <h3 className="course-card__title">{course.title}</h3>
          <p className="course-card__description">
            {description.text}
            {description.truncated && (
              <>
                {' '}
                <Link to={`/course/${course.id}`} className="course-card__read-more">
                  Read&nbsp;more&nbsp;→
                </Link>
              </>
            )}
          </p>
          <span className="course-card__meta">
            {resourceCount > 0 ? `${resourceCount} resource${resourceCount === 1 ? '' : 's'}` : 'Coming soon'}
          </span>
        </div>
        {/* {imageCredit && (
          <a className="course-card__credit" href={imageCredit.url} target="_blank" rel="noreferrer">
            Photo: {imageCredit.name} · {imageCredit.license}
          </a>
        )} */}
      </div>
      <Link to={`/course/${course.id}`} className="course-card__link" aria-label={course.title} />
    </div>
  )
}
