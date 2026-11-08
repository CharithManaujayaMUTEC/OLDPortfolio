import { Link } from 'react-router-dom'
import Photo from './Photo'
import { useSite } from '../context/SiteContext'
import { dd, levelLabel, mon, money, typeLabel, fmtTime } from '../lib/format'

export function ClassCard({ c, i = 0 }) {
  const { site } = useSite()
  const from = c.fees?.per_class ?? c.fees?.monthly ?? c.fees?.admission
  return (
    <Link to={`/classes/${c.slug}`} className="card class-card">
      <Photo src={c.image} alt={c.title} pose={i + 1} flip={i % 2 === 1} className="card-photo">
        <span className="chip">{levelLabel(c.level)}</span>
        {c.seats_left === 0 && <span className="chip chip-warm">Full</span>}
      </Photo>
      <div className="card-body">
        <p className="eyebrow">{c.style?.name || 'Dance'} · {c.district || typeLabel(c.type)}</p>
        <h3>{c.title}</h3>
        <p className="muted small">{c.schedule_days}{c.schedule_time ? ` · ${c.schedule_time}` : ''}</p>
        <div className="card-foot">
          <span className="price">{from != null ? <>From {money(from, site)}</> : 'Contact us'}</span>
          <span className="text-link"><span>Details</span> <b>+</b></span>
        </div>
      </div>
    </Link>
  )
}

export function EventCard({ e, i = 0 }) {
  const { site } = useSite()
  const min = e.ticket_types?.length ? Math.min(...e.ticket_types.map((t) => t.price)) : null
  return (
    <Link to={`/events/${e.slug}`} className={`card event-card ${e.is_past ? 'past' : ''}`}>
      <Photo src={e.poster} alt={e.title} pose={i + 2} flip={i % 2 === 0} tone={i % 2 ? 'warm' : 'blue'} className="card-photo">
        <div className="date-tag"><b>{dd(e.starts_at)}</b><span>{mon(e.starts_at)}</span></div>
        {e.category && <span className="chip">{e.category}</span>}
      </Photo>
      <div className="card-body">
        <h3>{e.title}</h3>
        <p className="muted small">{fmtTime(e.starts_at)} · {e.venue?.name || e.location_text || 'Sri Lanka'}{e.venue?.district ? `, ${e.venue.district}` : ''}</p>
        <div className="card-foot">
          <span className="price">{e.is_past ? 'Past event' : min === null ? 'Details' : min === 0 ? 'Free entry' : <>From {money(min, site)}</>}</span>
          <span className="text-link"><span>{e.is_past ? 'Recap' : 'Tickets'}</span> <b>+</b></span>
        </div>
      </div>
    </Link>
  )
}