import { useState } from 'react'
import type { Subtopic } from '../api/types'
import { useSolvedProblems } from '../hooks/useSolvedProblems'
import { PlaylistPlayer } from './PlaylistPlayer'
import './TopicLesson.css'

interface TopicLessonProps {
  subtopic: Subtopic
  onPractice: () => void
}

export function TopicLesson({ subtopic, onPractice }: TopicLessonProps) {
  const [playlistId, setPlaylistId] = useState(subtopic.playlists[0]?.id)
  const { solved } = useSolvedProblems()
  const playlist = subtopic.playlists.find((item) => item.id === playlistId) ?? subtopic.playlists[0]
  const solvedCount = subtopic.problems.filter((problem) => solved.has(problem.id)).length

  return (
    <div className="topic-lesson">
      <div className="topic-lesson__header">
        <div>
          <h2 className="topic-lesson__title">{subtopic.title}</h2>
          {subtopic.description && <p className="topic-lesson__description">{subtopic.description}</p>}
        </div>
        {subtopic.problems.length > 0 && (
          <button type="button" className="topic-lesson__practice" onClick={onPractice}>
            <span>
              {solvedCount}/{subtopic.problems.length} problems solved
            </span>
            <strong>Practice on LeetCode →</strong>
          </button>
        )}
      </div>

      {subtopic.playlists.length > 1 && (
        <div className="topic-lesson__playlists" role="radiogroup" aria-label="Choose a playlist">
          {subtopic.playlists.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={item.id === playlist?.id}
              className={`topic-lesson__chip${item.id === playlist?.id ? ' topic-lesson__chip--active' : ''}`}
              onClick={() => setPlaylistId(item.id)}
            >
              {item.title}
            </button>
          ))}
        </div>
      )}

      {playlist ? (
        // Keyed so switching playlists starts again from the first video.
        <PlaylistPlayer key={playlist.id} playlist={playlist} />
      ) : (
        <p className="topic-lesson__empty">No playlist has been added for {subtopic.title} yet.</p>
      )}
    </div>
  )
}
