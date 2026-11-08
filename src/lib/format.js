export const money = (n, site) => {
  const sym = site?.general?.currency_symbol || 'Rs.'
  return `${sym} ${Number(n || 0).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`
}
export const fmtDate = (iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', opts) : ''
export const fmtTime = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }) : '')
export const dd = (iso) => (iso ? String(new Date(iso).getDate()).padStart(2, '0') : '')
export const mon = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase() : '')
export const shortDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.') : '')
export const levelLabel = (l) => ({ beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', all_levels: 'All levels' }[l] || l)
export const typeLabel = (t) => ({ physical: 'In studio', online: 'Online', hybrid: 'Hybrid' }[t] || t)
export const pad = (n) => String(n).padStart(2, '0')
export const youtubeId = (url) => (url || '').match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1]
export const waLink = (num, text = '') => `https://wa.me/${(num || '').replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`