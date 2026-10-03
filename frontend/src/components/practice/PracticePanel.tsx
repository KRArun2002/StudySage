import { useState, type ComponentType } from 'react'
import type { VisualizerModule } from '../../api/types'
import { SpeedContext } from './animation'
import { ArrayVisualizer } from './ArrayVisualizer'
import { GraphVisualizer } from './GraphVisualizer'
import { LinkedListVisualizer } from './LinkedListVisualizer'
import { QueueVisualizer } from './QueueVisualizer'
import { StackVisualizer } from './StackVisualizer'
import { TreeVisualizer } from './TreeVisualizer'
import './PracticePanel.css'

const MODULES: Record<VisualizerModule, { label: string; component: ComponentType }> = {
  array: { label: 'Array', component: ArrayVisualizer },
  'linked-list': { label: 'Linked List', component: LinkedListVisualizer },
  stack: { label: 'Stack', component: StackVisualizer },
  queue: { label: 'Queue', component: QueueVisualizer },
  tree: { label: 'Binary Search Tree', component: TreeVisualizer },
  graph: { label: 'Graph', component: GraphVisualizer },
}

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3]
const DEFAULT_SPEED_INDEX = SPEEDS.indexOf(1)

interface PracticePanelProps {
  modules: VisualizerModule[]
}

export function PracticePanel({ modules }: PracticePanelProps) {
  const available = modules.filter((module) => module in MODULES)
  const [active, setActive] = useState<VisualizerModule>(available[0])
  const [speedIndex, setSpeedIndex] = useState(DEFAULT_SPEED_INDEX)
  const speed = SPEEDS[speedIndex]

  if (available.length === 0) return null
  const Active = MODULES[active].component

  return (
    <div className="practice">
      <div className="practice__header">
        <div>
          <h2 className="practice__title">Interactive Practice</h2>
          <p className="practice__subtitle">Run operations step by step and watch how the structure changes.</p>
        </div>
        {/* Takes effect immediately, even in the middle of a running animation. */}
        <div className="practice__speed" role="group" aria-label="Animation speed">
          <span className="practice__speed-label">Animation speed</span>
          <button
            type="button"
            className="practice__speed-btn"
            onClick={() => setSpeedIndex((index) => Math.max(index - 1, 0))}
            disabled={speedIndex === 0}
          >
            − Slower
          </button>
          <button
            type="button"
            className="practice__speed-value"
            onClick={() => setSpeedIndex(DEFAULT_SPEED_INDEX)}
            title="Reset to 1×"
            aria-live="polite"
          >
            {speed}×
          </button>
          <button
            type="button"
            className="practice__speed-btn"
            onClick={() => setSpeedIndex((index) => Math.min(index + 1, SPEEDS.length - 1))}
            disabled={speedIndex === SPEEDS.length - 1}
          >
            Faster +
          </button>
        </div>
      </div>

      {available.length > 1 && (
        <div className="practice__tabs" role="tablist">
          {available.map((module) => (
            <button
              key={module}
              type="button"
              role="tab"
              aria-selected={module === active}
              className={`practice__tab${module === active ? ' practice__tab--active' : ''}`}
              onClick={() => setActive(module)}
            >
              {MODULES[module].label}
            </button>
          ))}
        </div>
      )}

      <SpeedContext.Provider value={speed}>
        {/* Keyed so switching tabs cancels any running animation and starts fresh. */}
        <Active key={active} />
      </SpeedContext.Provider>
    </div>
  )
}
