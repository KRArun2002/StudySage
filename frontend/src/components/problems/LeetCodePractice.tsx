import { useState } from 'react'
import type { Difficulty, Subtopic } from '../../api/types'
import { useSolvedProblems } from '../../hooks/useSolvedProblems'
import { ProblemSet } from './ProblemSet'
import './LeetCodePractice.css'

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard']

interface LeetCodePracticeProps {
  subtopics: Subtopic[]
}

export function LeetCodePractice({ subtopics }: LeetCodePracticeProps) {
  const { solved, toggle } = useSolvedProblems()
  const [difficulty, setDifficulty] = useState<Difficulty | 'All'>('All')
  const [hideSolved, setHideSolved] = useState(false)

  const withProblems = subtopics.filter((subtopic) => subtopic.problems.length > 0)
  const allProblems = withProblems.flatMap((subtopic) => subtopic.problems)
  const solvedTotal = allProblems.filter((problem) => solved.has(problem.id)).length
  const presentDifficulties = DIFFICULTIES.filter((level) => allProblems.some((problem) => problem.difficulty === level))

  return (
    <div className="leetcode">
      <div className="leetcode__summary">
        <div>
          <h2 className="leetcode__title">LeetCode Practice</h2>
          <p className="leetcode__subtitle">
            Solve these on LeetCode, then tick them off here. Progress is saved in this browser.
          </p>
        </div>
        <div className="leetcode__stats">
          <div className="leetcode__stat leetcode__stat--total">
            <strong>
              {solvedTotal}/{allProblems.length}
            </strong>
            <span>solved</span>
          </div>
          {presentDifficulties.map((level) => {
            const problems = allProblems.filter((problem) => problem.difficulty === level)
            return (
              <div key={level} className={`leetcode__stat leetcode__stat--${level.toLowerCase()}`}>
                <strong>
                  {problems.filter((problem) => solved.has(problem.id)).length}/{problems.length}
                </strong>
                <span>{level}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="leetcode__filters">
        <div className="leetcode__segmented" role="radiogroup" aria-label="Filter by difficulty">
          {(['All', ...presentDifficulties] as const).map((level) => (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={difficulty === level}
              className={difficulty === level ? 'leetcode__segment--active' : undefined}
              onClick={() => setDifficulty(level)}
            >
              {level}
            </button>
          ))}
        </div>
        <label className="leetcode__toggle">
          <input type="checkbox" checked={hideSolved} onChange={(event) => setHideSolved(event.target.checked)} />
          Hide solved
        </label>
      </div>

      <div className="leetcode__sets">
        {withProblems.map((subtopic) => (
          <ProblemSet
            key={subtopic.id}
            title={subtopic.title}
            problems={subtopic.problems.filter(
              (problem) =>
                (difficulty === 'All' || problem.difficulty === difficulty) && !(hideSolved && solved.has(problem.id)),
            )}
            progress={{
              solved: subtopic.problems.filter((problem) => solved.has(problem.id)).length,
              total: subtopic.problems.length,
            }}
            solved={solved}
            onToggle={toggle}
          />
        ))}
      </div>
    </div>
  )
}
