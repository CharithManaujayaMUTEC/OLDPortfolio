import { createContext, useContext, useEffect, useState } from 'react'
import { getWithFallback, onOfflineChange } from '../lib/api'
import { mockSite } from '../lib/mockData'

const SiteContext = createContext({ site: mockSite, offline: false, ready: false })
export const useSite = () => useContext(SiteContext)

const merge = (base, over) => {
  if (Array.isArray(over)) return over
  if (over && typeof over === 'object') {
    const out = { ...(base && typeof base === 'object' && !Array.isArray(base) ? base : {}) }
    for (const k of Object.keys(over)) out[k] = merge(out[k], over[k])
    return out
  }
  return over === null || over === undefined ? base : over
}

const loadedFonts = new Set()
export function loadFont(name) {
  if (!name || loadedFonts.has(name)) return
  loadedFonts.add(name)
  const l = document.createElement('link')
  l.rel = 'stylesheet'
  l.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g, '+')}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,700;1,800&display=swap`
  document.head.appendChild(l)
}

function applyTheme(site) {
  const t = site.theme
  const r = document.documentElement
  const set = (k, v) => v && r.style.setProperty(k, v)
  set('--primary', t.primary); set('--accent', t.accent); set('--bg', t.background)
  set('--surface', t.surface); set('--text', t.text); set('--muted', t.muted)
  r.style.setProperty('--radius', `${t.radius ?? 2}px`)
  r.style.setProperty('--font-display', `'${t.font_display}', 'Archivo Black', sans-serif`)
  r.style.setProperty('--font-body', `'${t.font_body}', system-ui, sans-serif`)
  loadFont(t.font_display); loadFont(t.font_body)
  r.classList.toggle('no-duotone', !t.duotone)
  r.classList.toggle('no-grain', !t.grain)
  r.classList.toggle('no-glitch', !t.glitch)
  document.title = site.general.seo?.title || site.general.site_name
  const desc = document.querySelector('meta[name=description]')
  if (desc) desc.content = site.general.seo?.description || ''
  if (site.general.favicon) {
    let icon = document.querySelector('link[rel=icon]')
    if (!icon) { icon = document.createElement('link'); icon.rel = 'icon'; document.head.appendChild(icon) }
    icon.href = site.general.favicon
  }
}

export function SiteProvider({ children }) {
  const [site, setSite] = useState(mockSite)
  const [offline, setOffline] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => { applyTheme(mockSite) }, [])
  useEffect(() => onOfflineChange(setOffline), [])
  useEffect(() => {
    getWithFallback('/site')
      .then((r) => { const s = merge(mockSite, r.data); setSite(s); applyTheme(s) })
      .finally(() => setReady(true))
  }, [])

  return <SiteContext.Provider value={{ site, offline, ready }}>{children}</SiteContext.Provider>
}