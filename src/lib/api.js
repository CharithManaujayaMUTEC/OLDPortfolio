import { mockFor } from './mockData'

export const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '')

let offlineListeners = new Set()
let offline = false
export const onOfflineChange = (fn) => { offlineListeners.add(fn); return () => offlineListeners.delete(fn) }
const setOffline = (v) => { if (offline !== v) { offline = v; offlineListeners.forEach((f) => f(v)) } }

async function request(path, options = {}, timeout = 7000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: ctrl.signal,
      headers: { Accept: 'application/json', ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      const err = new Error(json.message || `Request failed (${res.status})`)
      err.status = res.status
      err.errors = json.errors
      throw err
    }
    return json
  } finally {
    clearTimeout(timer)
  }
}

/** GET with automatic fallback to bundled mock data if the backend can't be reached. */
export async function getWithFallback(path) {
  try {
    const json = await request(path)
    setOffline(false)
    return { ...json, offline: false }
  } catch (e) {
    if (e.status && e.status < 500) throw e // real API answer (e.g. 404) – not a connectivity problem
    setOffline(true)
    const data = mockFor(path)
    if (data === undefined || data === null) throw e
    const filters = path.startsWith('/classes') && Array.isArray(data)
      ? { districts: [...new Set(data.map((c) => c.district))].sort(), styles: [] }
      : path.startsWith('/events') ? { categories: [...new Set((Array.isArray(data) ? data : []).map((x) => x.category))] }
      : path.startsWith('/gallery') ? { categories: [...new Set((Array.isArray(data) ? data : []).map((x) => x.category))] } : undefined
    return { data, filters, offline: true }
  }
}

export const post = (path, body) => request(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }, 15000)
export const get = (path) => request(path)
