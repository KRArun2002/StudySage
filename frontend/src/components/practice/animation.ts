import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

/** Playback speed multiplier shared by every visualizer on the practice panel. */
export const SpeedContext = createContext(1)

/** Base delay between animation steps at 1× speed. */
const BASE_STEP_MS = 700

/** Extra delay factor for multi-step walkthroughs (list reversal, tree and graph traversals) so each step can be followed. */
export const WALKTHROUGH_PACE = 2

class AnimationCancelled extends Error {}

export type Step = (delayFactor?: number) => Promise<void>

/**
 * Runs one animation at a time. The task receives `step()`, which pauses between frames and
 * rejects once the component unmounts or another animation is cancelled, so stale timers never
 * write into state.
 */
export function useAnimator() {
  const speed = useContext(SpeedContext)
  const speedRef = useRef(speed)
  const tokenRef = useRef(0)
  const busyRef = useRef(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  useEffect(
    () => () => {
      tokenRef.current++
    },
    [],
  )

  const run = useCallback(async (task: (step: Step) => Promise<void>) => {
    if (busyRef.current) return
    const token = ++tokenRef.current
    busyRef.current = true
    setBusy(true)

    const step: Step = (delayFactor = 1) =>
      new Promise((resolve, reject) => {
        setTimeout(
          () => (token === tokenRef.current ? resolve() : reject(new AnimationCancelled())),
          (BASE_STEP_MS * delayFactor) / speedRef.current,
        )
      })

    try {
      await task(step)
    } catch (error) {
      if (!(error instanceof AnimationCancelled)) throw error
    } finally {
      if (token === tokenRef.current) {
        busyRef.current = false
        setBusy(false)
      }
    }
  }, [])

  return { busy, run }
}

export type Tone = 'info' | 'success' | 'error'

export interface Status {
  text: string
  tone: Tone
  complexity?: string
}

/** Parses "3, 7 1" into numbers; returns null when any token is not an integer in range. */
export function parseNumberList(text: string): number[] | null {
  const tokens = text.split(/[\s,]+/).filter(Boolean)
  const values = tokens.map(Number)
  return values.every(isValidValue) ? values : null
}

export function parseValue(text: string): number | null {
  if (text.trim() === '') return null
  const value = Number(text)
  return isValidValue(value) ? value : null
}

export function parseIndex(text: string): number | null {
  if (text.trim() === '') return null
  const value = Number(text)
  return Number.isInteger(value) && value >= 0 ? value : null
}

function isValidValue(value: number) {
  return Number.isInteger(value) && Math.abs(value) <= 999
}

export function randomValues(count: number, max = 99): number[] {
  const values = new Set<number>()
  while (values.size < count) values.add(Math.floor(Math.random() * max) + 1)
  return [...values]
}

let nextId = 1
/** Stable ids so React can keep track of an element as it moves around. */
export function newId() {
  return nextId++
}
