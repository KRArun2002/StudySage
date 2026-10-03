import { useEffect, useState } from 'react'

interface FetchState<T> {
  data: T | undefined
  error: Error | undefined
  loading: boolean
}

export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[]): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ data: undefined, error: undefined, loading: true })

  useEffect(() => {
    let cancelled = false
    setState({ data: undefined, error: undefined, loading: true })

    fetcher().then(
      (data) => {
        if (!cancelled) setState({ data, error: undefined, loading: false })
      },
      (error: unknown) => {
        if (!cancelled) {
          setState({ data: undefined, error: error instanceof Error ? error : new Error(String(error)), loading: false })
        }
      },
    )

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
