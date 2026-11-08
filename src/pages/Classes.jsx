import { useMemo, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useSite } from '../context/SiteContext'
import { useApi } from '../lib/useApi'
import { levelLabel, money, typeLabel, youtubeId, waLink } from '../lib/format'
import Photo from '../components/Photo'
import Reveal from '../components/Reveal'
import BookingModal from '../components/BookingModal'
import { Btn, Empty, Eyebrow, Loader, Prose, TextLink } from '../components/Bits'
import { ClassCard } from '../components/Cards'
import { NotFound } from './Misc'

export function PageHead({ eyebrow, title, text }) {
  return (
    <section className="page-head">
      <div className="wrap">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="display h1">{title}</h1>
        {text && <p className="lead">{text}</p>}
      </div>
    </section>
  )
}

export default function Classes() {
  const { site } = useSite()
  const { data, loading, filters } = useApi('/classes')
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const district = params.get('district') || ''
  const style = params.get('style') || ''
  const level = params.get('level') || ''
  const type = params.get('type') || ''
  const set = (k, v) => { const p = new URLSearchParams(params); v ? p.set(k, v) : p.delete(k); setParams(p, { replace: true }) }

  const styles = useMemo(() => {
    const m = new Map()
    ;(data || []).forEach((c) => c.style && m.set(c.style.slug, c.style.name))
    return [...m.entries()]
  }, [data])
  const districts = filters?.districts?.length ? filters.districts : [...new Set((data || []).map((c) => c.district).filter(Boolean))].sort()

  const list = (data || []).filter((c) =>
    (!district || c.district === district) && (!style || c.style?.slug === style) && (!level || c.level === level) && (!type || c.type === type) &&
    (!q || `${c.title} ${c.district} ${c.style?.name}`.toLowerCase().includes(q.toLowerCase())))

  return (
    <>
      <PageHead eyebrow="Classes" title="Find a class near you" text={site.general.island_wide_note + ' — pick your district, style and level, then register online in a minute.'} />
      <section className="wrap block">
        <div className="filters">
          <input className="search" placeholder="Search classes…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={district} onChange={(e) => set('district', e.target.value)}>
            <option value="">All districts</option>{districts.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={level} onChange={(e) => set('level', e.target.value)}>
            <option value="">All levels</option>{['beginner', 'intermediate', 'advanced', 'all_levels'].map((l) => <option key={l} value={l}>{levelLabel(l)}</option>)}
          </select>
          <select value={type} onChange={(e) => set('type', e.target.value)}>
            <option value="">Studio & online</option>{['physical', 'online', 'hybrid'].map((t) => <option key={t} value={t}>{typeLabel(t)}</option>)}
          </select>
        </div>
        <div className="chips">
          <button className={!style ? 'on' : ''} onClick={() => set('style', '')}>All styles</button>
          {styles.map(([slug, name]) => <button key={slug} className={style === slug ? 'on' : ''} onClick={() => set('style', slug)}>{name}</button>)}
        </div>
        {loading ? <Loader /> : list.length === 0 ? <Empty>No classes match those filters yet. Try another district or <Link to="/contact">ask us</Link> about opening one.</Empty> : (
          <div className="grid3">{list.map((c, i) => <Reveal key={c.id} delay={(i % 3) * 80}><ClassCard c={c} i={i} /></Reveal>)}</div>
        )}
      </section>
    </>
  )
}

export function ClassDetail() {
  const { slug } = useParams()
  const { site } = useSite()
  const { data: c, loading, error } = useApi(`/classes/${slug}`)
  const [open, setOpen] = useState(false)
  if (loading) return <Loader />
  if (error || !c) return <NotFound />
  const fees = [['Admission (one-time)', c.fees.admission], ['Per class', c.fees.per_class], ['Monthly', c.fees.monthly]].filter(([, v]) => v != null)
  const yt = youtubeId(c.video_url)
  const canBook = site.booking.allow_class_registration && c.allow_online_registration && c.seats_left !== 0
  return (
    <>
      <section className="detail-hero">
        <Photo src={c.image} alt={c.title} pose={2} className="detail-cover" />
        <div className="detail-hero-copy wrap">
          <Eyebrow>{c.style?.name} · {levelLabel(c.level)} · {typeLabel(c.type)}</Eyebrow>
          <h1 className="display h1">{c.title}</h1>
          {c.motto && <p className="lead">{c.motto}</p>}
        </div>
      </section>
      <section className="wrap block detail-grid">
        <div>
          <Prose html={c.description} />
          {c.prerequisites && <><h3 className="h3">Before you join</h3><p className="muted">{c.prerequisites}</p></>}
          {yt && <div className="video"><iframe src={`https://www.youtube.com/embed/${yt}`} title="Intro video" allowFullScreen loading="lazy" /></div>}
          {c.gallery?.length > 0 && <div className="mini-gallery">{c.gallery.map((g, i) => <Photo key={g} src={g} pose={i} alt="" />)}</div>}
        </div>
        <aside className="panel sticky">
          <dl className="facts">
            <div><dt>Where</dt><dd>{c.venue_name || '—'}{c.district ? `, ${c.district}` : ''}</dd></div>
            <div><dt>When</dt><dd>{c.schedule_days}<br />{c.schedule_time}</dd></div>
            {c.age_range && <div><dt>Ages</dt><dd>{c.age_range}</dd></div>}
            {c.seats_left != null && <div><dt>Spots left</dt><dd>{c.seats_left}</dd></div>}
          </dl>
          <ul className="fee-list">{fees.map(([l, v]) => <li key={l}><span>{l}</span><b className="price">{money(v, site)}</b></li>)}</ul>
          {canBook ? <Btn onClick={() => setOpen(true)}>Register now</Btn> : <p className="notice">{c.seats_left === 0 ? 'This class is full.' : 'Online registration is closed.'} Contact us to join the waitlist.</p>}
          {site.general.whatsapp && <Btn variant="ghost" to={waLink(site.general.whatsapp, `Hi, I have a question about ${c.title}`)}>Ask on WhatsApp</Btn>}
          {c.map_url && <TextLink to={c.map_url}>Open in maps</TextLink>}
        </aside>
      </section>
      {open && <BookingModal type="class" item={c} onClose={() => setOpen(false)} />}
    </>
  )
}
