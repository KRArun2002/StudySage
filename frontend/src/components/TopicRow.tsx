import type { CourseSummary, TopicSummary } from '../api/types'
import { CourseCard } from './CourseCard'
import './TopicRow.css'

interface TopicRowProps {
  topic: TopicSummary
  courses: CourseSummary[]
}

export function TopicRow({ topic, courses }: TopicRowProps) {
  return (
    <section className="topic-row">
      <h2 className="topic-row__title">{topic.title}</h2>
      <div className="topic-row__track">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  )
}
