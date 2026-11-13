import { useCallback, useEffect, useRef, useState } from 'react'

type ResourceState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: Error }

export function useApiResource<T>(load: () => Promise<T>) {
  const loadRef = useRef(load)
  const requestRef = useRef<{ attempt: number; promise: Promise<T> } | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<ResourceState<T>>({
    status: 'loading',
    data: null,
    error: null,
  })

  loadRef.current = load

  useEffect(() => {
    let active = true
    setState({ status: 'loading', data: null, error: null })
    if (!requestRef.current || requestRef.current.attempt !== attempt) {
      requestRef.current = { attempt, promise: loadRef.current() }
    }
    requestRef.current.promise
      .then((data) => {
        if (active) setState({ status: 'success', data, error: null })
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            status: 'error',
            data: null,
            error: error instanceof Error ? error : new Error('Unable to load data.'),
          })
        }
      })
    return () => {
      active = false
    }
  }, [attempt])

  const reload = useCallback(() => setAttempt((value) => value + 1), [])
  return { ...state, reload }
}
