import { Navbar } from '../components/Navbar'
import { TopicRow } from '../components/TopicRow'
import { api } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import './HomePage.css'

async function loadTopicRows() {
  const topics = await api.getTopics()
  const courseLists = await Promise.all(topics.map((topic) => api.getTopicCourses(topic.id)))
  return topics.map((topic, index) => ({ topic, courses: courseLists[index] }))
}

export function HomePage() {
  const { data: rows, error, loading } = useFetch(loadTopicRows, [])

  return (
    <div className="home-page">
      <Navbar />
      <div className="home-page__hero">
        <h1 className="home-page__hero-title">Discover something worth learning.</h1>
        <p className="home-page__hero-subtitle">
          Browse topics, start a course, and watch, read, and practice — all in one place.
        </p>
      </div>
      <main className="home-page__rows">
        {loading && <p className="home-page__status">Loading topics…</p>}
        {error && <p className="home-page__status">Could not load topics. Is the backend running?</p>}
        {rows?.map(({ topic, courses }) => (
          <TopicRow key={topic.id} topic={topic} courses={courses} />
        ))}
      </main>
    </div>
  )
}
