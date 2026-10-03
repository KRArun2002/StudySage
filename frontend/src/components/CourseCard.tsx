import { Link } from 'react-router-dom'
import type { CourseSummary } from '../api/types'
import './CourseCard.css'

interface CourseCardProps {
  course: CourseSummary
}

export function CourseCard({ course }: CourseCardProps) {
  const { resourceCount, subtopicCount } = course
  const meta = [
    subtopicCount > 0 && `${subtopicCount} topic${subtopicCount === 1 ? '' : 's'}`,
    resourceCount > 0 && `${resourceCount} resource${resourceCount === 1 ? '' : 's'}`,
  ].filter(Boolean)

  return (
    <Link to={`/course/${course.id}`} className="course-card">
      <div className="course-card__poster" style={{ background: course.accentGradient }}>
        <span className="course-card__poster-title">{course.title}</span>
      </div>
      <div className="course-card__details">
        <h3 className="course-card__title">{course.title}</h3>
        <p className="course-card__description">{course.description}</p>
        <span className="course-card__meta">
          {meta.length > 0 ? meta.join(' · ') : 'Coming soon'}
        </span>
      </div>
    </Link>
  )
}
