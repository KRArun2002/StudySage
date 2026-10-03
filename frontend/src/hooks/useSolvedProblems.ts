import { useCallback, useSyncExternalStore } from 'react'

// Progress lives in the browser until StudySage has user accounts. Keyed by LeetCode slug, so solving a
// problem in one course also checks it off anywhere else it appears.
const STORAGE_KEY = 'studysage.solvedProblems'

const listeners = new Set<() => void>()
let snapshot: { raw: string | null; solved: ReadonlySet<string> } = { raw: null, solved: new Set() }

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return snapshot.raw
  }
}

function parse(raw: string | null): ReadonlySet<string> {
  try {
    const value: unknown = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [])
  } catch {
    return new Set()
  }
}

function getSnapshot(): ReadonlySet<string> {
  const raw = readRaw()
  if (raw !== snapshot.raw) snapshot = { raw, solved: parse(raw) }
  return snapshot.solved
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Keeps other open tabs in sync.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function setSolved(problemId: string, solved: boolean) {
  const next = new Set(getSnapshot())
  if (solved) next.add(problemId)
  else next.delete(problemId)

  const raw = JSON.stringify([...next])
  try {
    localStorage.setItem(STORAGE_KEY, raw)
  } catch {
    // Storage blocked (e.g. private mode): progress still works for this visit.
  }
  snapshot = { raw: readRaw() === raw ? raw : snapshot.raw, solved: next }
  listeners.forEach((listener) => listener())
}

export function useSolvedProblems() {
  const solved = useSyncExternalStore(subscribe, getSnapshot)
  const toggle = useCallback((problemId: string) => setSolved(problemId, !getSnapshot().has(problemId)), [])
  return { solved, toggle }
}
