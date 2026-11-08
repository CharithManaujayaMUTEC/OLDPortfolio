import { useEffect, useState } from 'react'
import { getWithFallback } from './api'

/** Load data from the backend; falls back to bundled mock data automatically. */
export function useApi(path) {
  const [state, setState] = useState({ data: null, filters: null, loading: true, error: null, offline: false })
  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true, error: null }))
    getWithFallback(path)
      .then((r) => alive && setState({ data: r.data, filters: r.filters, loading: false, error: null, offline: r.offline }))
      .catch((e) => alive && setState({ data: null, filters: null, loading: false, error: e, offline: false }))
    return () => { alive = false }
  }, [path])
  return state
}