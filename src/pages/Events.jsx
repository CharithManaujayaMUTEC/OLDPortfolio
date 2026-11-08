import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSite } from '../context/SiteContext'
import { useApi } from '../lib/useApi'
import { fmtDate, fmtTime, money, youtubeId } from '../lib/format'
import Photo from '../components/Photo'
import Reveal from '../components/Reveal'
import BookingModal from '../components/BookingModal'
import { Btn, Empty, Eyebrow, Loader, Prose, TextLink } from '../components/Bits'
import { EventCard } from '../components/Cards'
import { PageHead } from './Classes'
import { NotFound } from './Misc'

export default function Events() {
  const { data, loading, filters } = useApi('/events')
  const [tab, setTab] = useState('upcoming')
  const [cat, setCat] = useState('')
  const all = data || []
  const cats = filters?.categories?.length ? filters.categories : [...new Set(all.map((e) => e.category).filter(Boolean))]
  const upcoming = all.filter((e) => !e.is_past).sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
  const past = all.filter((e) => e.is_past).sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at))
  const list = (tab === 'upcoming' ? upcoming : past).filter((e) => !cat || e.category === cat)
  return (
    <>
      <PageHead eyebrow="Events" title="Shows, workshops & battles" text="Reserve tickets for upcoming shows and masterclasses, or relive the nights you missed." />
      <section className="wrap block">
        <div className="tabs">
          <button className={tab === 'upcoming' ? 'on' : ''} onClick={() => setTab('upcoming')}>Upcoming <sup>{upcoming.length}</sup></button>
          <button className={tab === 'past' ? 'on' : ''} onClick={() => setTab('past')}>Past <sup>{past.length}</sup></button>
        </div>
        {cats.length > 1 && (
          <div className="chips">
            <button className={!cat ? 'on' : ''} onClick={() => setCat('')}>All</button>
            {cats.map((c) => <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}
          </div>
        )}
        {loading ? <Loader /> : list.length === 0 ? <Empty>{tab === 'upcoming' ? 'No upcoming events right now — follow us for announcements.' : 'No past events to show.'}</Empty> : (
          <div className="grid3">{list.map((e, i) => <Reveal key={e.id} delay={(i % 3) * 80}><EventCard e={e} i={i} /></Reveal>)}</div>
        )}
      </section>
    </>
  )
}

export function EventDetail() {
  const { slug } = useParams()
  const { site } = useSite()
  const { data: e, loading, error } = useApi(`/events/${slug}`)
  const [open, setOpen] = useState(false)
  if (loading) return <Loader />
  if (error || !e) return <NotFound />
  const yt = youtubeId(e.video_url)
  const canBook = site.booking.allow_event_booking && e.registration_open && e.ticket_types.some((t) => !t.sold_out)
  return (
    <>
      <section className="detail-hero">
        <Photo src={e.poster} alt={e.title} pose={4} tone="warm" className="detail-cover" />
        <div className="detail-hero-copy wrap">
          <Eyebrow>{e.category || 'Event'}</Eyebrow>
          <h1 className="display h1">{e.title}</h1>
          <p className="lead">{fmtDate(e.starts_at, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {fmtTime(e.starts_at)}</p>
        </div>
      </section>
      <section className="wrap block detail-grid">
        <div>
          {e.summary && <p className="lead">{e.summary}</p>}
          <Prose html={e.description} />
          {yt && <div className="video"><iframe src={`https://www.youtube.com/embed/${yt}`} title="Event video" allowFullScreen loading="lazy" /></div>}
          {e.gallery?.length > 0 && <div className="mini-gallery">{e.gallery.map((g, i) => <Photo key={g} src={g} pose={i} alt="" />)}</div>}
        </div>
        <aside className="panel sticky">
          <dl className="facts">
            <div><dt>Date</dt><dd>{fmtDate(e.starts_at)}</dd></div>
            <div><dt>Time</dt><dd>{fmtTime(e.starts_at)}{e.ends_at ? ` – ${fmtTime(e.ends_at)}` : ''}</dd></div>
            <div><dt>Venue</dt><dd>{e.venue?.name || e.location_text || 'To be announced'}{e.venue?.district ? `, ${e.venue.district}` : ''}{e.venue?.address && <><br /><small className="muted">{e.venue.address}</small></>}</dd></div>
          </dl>
          <ul className="fee-list">
            {e.ticket_types.map((t) => (
              <li key={t.name}><span>{t.name}{t.sold_out && ' · sold out'}{t.remaining != null && !t.sold_out && t.remaining < 20 ? ` · ${t.remaining} left` : ''}</span><b className="price">{t.price === 0 ? 'Free' : money(t.price, site)}</b></li>
            ))}
          </ul>
          {e.external_ticket_url
            ? <Btn to={e.external_ticket_url}>Get tickets</Btn>
            : canBook ? <Btn onClick={() => setOpen(true)}>Book tickets</Btn>
            : <p className="notice">{e.is_past ? 'This event has ended.' : 'Booking is closed or sold out.'}</p>}
          {e.venue?.map_url && <TextLink to={e.venue.map_url}>Open in maps</TextLink>}
        </aside>
      </section>
      {open && <BookingModal type="event" item={e} onClose={() => setOpen(false)} />}
    </>
  )
}
