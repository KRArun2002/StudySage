import type { PracticeProblem } from '../../api/types'
import './ProblemSet.css'

interface ProblemSetProps {
  title: string
  problems: PracticeProblem[]
  solved: ReadonlySet<string>
  onToggle: (problemId: string) => void
  /** Total before filtering, so progress still reflects the whole set when a filter hides some problems. */
  progress?: { solved: number; total: number }
}

/** A checklist of practice problems with per-set progress. Reusable for any topic. */
export function ProblemSet({ title, problems, solved, onToggle, progress }: ProblemSetProps) {
  const solvedCount = progress?.solved ?? problems.filter((problem) => solved.has(problem.id)).length
  const total = progress?.total ?? problems.length
  const percent = total === 0 ? 0 : Math.round((solvedCount / total) * 100)

  return (
    <section className="problem-set">
      <header className="problem-set__header">
        <h3 className="problem-set__title">{title}</h3>
        <span className="problem-set__count">
          {solvedCount}/{total} solved
        </span>
      </header>
      <div
        className="problem-set__bar"
        role="progressbar"
        aria-label={`${title} progress`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={solvedCount}
      >
        <div className="problem-set__bar-fill" style={{ width: `${percent}%` }} />
      </div>

      {problems.length === 0 ? (
        <p className="problem-set__empty">No problems match this filter.</p>
      ) : (
        <ul className="problem-set__list">
          {problems.map((problem) => {
            const isSolved = solved.has(problem.id)
            return (
              <li key={problem.id} className={`problem-set__row${isSolved ? ' problem-set__row--solved' : ''}`}>
                <label className="problem-set__check">
                  <input type="checkbox" checked={isSolved} onChange={() => onToggle(problem.id)} />
                  <span className="visually-hidden">Mark {problem.title} as solved</span>
                </label>
                <a className="problem-set__name" href={problem.url} target="_blank" rel="noreferrer">
                  {problem.title}
                  <span className="problem-set__external" aria-hidden>
                    ↗
                  </span>
                </a>
                <span className={`problem-set__difficulty problem-set__difficulty--${problem.difficulty.toLowerCase()}`}>
                  {problem.difficulty}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
