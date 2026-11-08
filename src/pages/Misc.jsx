import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useSite } from '../context/SiteContext'
import { useApi } from '../lib/useApi'
import { get, post } from '../lib/api'
import { fmtDate, money, youtubeId, waLink } from '../lib/format'
import Photo from '../components/Photo'
import Reveal from '../components/Reveal'
import { PaymentPanel } from '../components/BookingModal'
import { Btn, Empty, Eyebrow, Loader, Prose } from '../components/Bits'
import { PageHead } from './Classes'
import { Newsletter } from './Home'

export function NotFound() {
  return (
    <section className="page-head center">
      <div className="wrap">
        <p className="display huge">404</p>
        <p className="lead">That page moved on without us.</p>
        <Btn to="/">Back home</Btn>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ Gallery */
export function Gallery() {
  const { data, loading, filters } = useApi('/gallery')
  const [cat, setCat] = useState('')
  const [lb, setLb] = useState(null)
  const items = (data || []).filter((g) => !cat || g.category === cat)
  const cats = filters?.categories?.length ? filters.categories : [...new Set((data || []).map((g) => g.category).filter(Boolean))]
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && setLb(null)
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [])
  return (
    <>
      <PageHead eyebrow="Gallery" title="Movement, captured" text="Photos and films from classes, stages and the road." />
      <section className="wrap block">
        {cats.length > 1 && (
          <div className="chips">
            <button className={!cat ? 'on' : ''} onClick={() => setCat('')}>All</button>
            {cats.map((c) => <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}
          </div>
        )}
        {loading ? <Loader /> : items.length === 0 ? <Empty>Nothing here yet.</Empty> : (
          <div className="masonry">
            {items.map((g, i) => (
              <Reveal key={g.id} delay={(i % 4) * 60}>
                <button className={`gal-item ${g.type === 'video' ? 'is-video' : ''} h${i % 3}`} onClick={() => setLb(g)} aria-label={g.title || 'Open'}>
                  <Photo src={g.image || (youtubeId(g.video_url) ? `https://img.youtube.com/vi/${youtubeId(g.video_url)}/hqdefault.jpg` : null)} alt={g.title || ''} pose={i} flip={i % 2 === 1} tone={i % 5 === 1 ? 'warm' : 'blue'} />
                  {g.type === 'video' && <span className="play">▶</span>}
                  {g.title && <span className="gal-cap">{g.title}</span>}
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </section>
      {lb && (
        <div className="lightbox" onClick={() => setLb(null)}>
          <button className="modal-x" aria-label="Close">×</button>
          <div onClick={(e) => e.stopPropagation()}>
            {lb.type === 'video' && youtubeId(lb.video_url)
              ? <div className="video"><iframe src={`https://www.youtube.com/embed/${youtubeId(lb.video_url)}?autoplay=1`} title={lb.title || 'Video'} allow="autoplay; fullscreen" allowFullScreen /></div>
              : <Photo src={lb.image} alt={lb.title || ''} pose={2} className="lb-photo" />}
            {lb.title && <p className="lb-cap">{lb.title}</p>}
          </div>
        </div>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ Journal */
export function Journal() {
  const { data, loading } = useApi('/posts')
  return (
    <>
      <PageHead eyebrow="Journal" title="Stories from the studio" text="Interviews, tutorials and behind-the-scenes." />
      <section className="wrap block">
        {loading ? <Loader /> : !data?.length ? <Empty>No articles yet.</Empty> : (
          <div className="grid3">
            {data.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 80}>
                <Link to={`/journal/${p.slug}`} className="card">
                  <Photo src={p.cover} alt={p.title} pose={i + 1} flip={i % 2 === 0} className="card-photo" />
                  <div className="card-body"><p className="eyebrow">{p.category} · {fmtDate(p.published_at)}</p><h3>{p.title}</h3><p className="muted small">{p.excerpt}</p></div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export function PostDetail() {
  const { slug } = useParams()
  const { data: p, loading, error } = useApi(`/posts/${slug}`)
  if (loading) return <Loader />
  if (error || !p) return <NotFound />
  return (
    <>
      <PageHead eyebrow={`${p.category || 'Journal'} · ${fmtDate(p.published_at)}`} title={p.title} />
      <article className="wrap narrow block">
        <Photo src={p.cover} alt={p.title} pose={3} className="post-cover" />
        <Prose html={p.body} />
        <Link className="text-link" to="/journal"><span>← All articles</span></Link>
      </article>
    </>
  )
}

/* -------------------------------------------------------------------- About */
export function About() {
  const { site } = useSite()
  const a = site.about
  const { data: achievements } = useApi('/achievements')
  const { data: faqs } = useApi('/faqs')
  const [open, setOpen] = useState(0)
  return (
    <>
      <PageHead eyebrow={a.eyebrow} title={a.title} />
      <section className="wrap block about-grid">
        <Reveal><Photo src={a.image} alt={site.general.owner_name} pose={1} className="about-photo" /></Reveal>
        <Reveal delay={120}><p className="lead">{a.intro}</p><Prose text={a.body} /></Reveal>
      </section>
      <section className="wrap block">
        <h2 className="display h2">{a.philosophy_title}</h2>
        <div className="grid3 pillars">{a.philosophy.map((p, i) => <Reveal key={p.title} delay={i * 90} className="pillar"><b className="display">0{i + 1}</b><h3>{p.title}</h3><p className="muted">{p.text}</p></Reveal>)}</div>
      </section>
      {achievements?.length > 0 && (
        <section className="wrap block">
          <h2 className="display h2">{a.timeline_title}</h2>
          <ol className="timeline">{achievements.map((m) => <li key={m.id}><b className="display">{m.year}</b><div><h3>{m.title}</h3><p className="muted">{m.description}</p></div></li>)}</ol>
        </section>
      )}
      {faqs?.length > 0 && (
        <section className="wrap narrow block">
          <h2 className="display h2">FAQ</h2>
          {faqs.map((f, i) => (
            <div key={f.id} className={`faq ${open === i ? 'open' : ''}`}>
              <button onClick={() => setOpen(open === i ? -1 : i)}><span>{f.question}</span><i>+</i></button>
              <div className="faq-a"><p className="muted">{f.answer}</p></div>
            </div>
          ))}
        </section>
      )}
      <Newsletter />
    </>
  )
}

/* ------------------------------------------------------------------ Contact */
export function Contact() {
  const { site } = useSite()
  const c = site.contact
  const g = site.general
  const [f, setF] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [st, setSt] = useState({ busy: false, ok: false, msg: '', errors: {} })
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const submit = async (e) => {
    e.preventDefault()
    setSt({ busy: true, ok: false, msg: '', errors: {} })
    try {
      const r = await post('/inquiries', f)
      setSt({ busy: false, ok: true, msg: r.message || c.success, errors: {} }); setF({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (ex) {
      setSt({ busy: false, ok: false, errors: ex.errors || {}, msg: ex.errors ? 'Please check the highlighted fields.' : ex.status ? ex.message : 'We could not reach the server. Please try WhatsApp or email instead.' })
    }
  }
  const err = (k) => st.errors[k]?.[0]
  return (
    <>
      <PageHead eyebrow={c.eyebrow} title={c.title} text={c.text} />
      <section className="wrap block contact-grid">
        <form onSubmit={submit} className="panel form">
          <div className="grid2">
            <label className="field"><span>Name</span><input value={f.name} onChange={set('name')} required />{err('name') && <em className="field-error">{err('name')}</em>}</label>
            <label className="field"><span>Email</span><input type="email" value={f.email} onChange={set('email')} required />{err('email') && <em className="field-error">{err('email')}</em>}</label>
            <label className="field"><span>Phone</span><input value={f.phone} onChange={set('phone')} /></label>
            <label className="field"><span>Subject</span><input value={f.subject} onChange={set('subject')} /></label>
          </div>
          <label className="field"><span>Message</span><textarea rows="6" value={f.message} onChange={set('message')} required />{err('message') && <em className="field-error">{err('message')}</em>}</label>
          {st.msg && <p className={`notice ${st.ok ? 'ok' : 'err'}`}>{st.msg}</p>}
          <Btn type="submit" disabled={st.busy}>{st.busy ? 'Sending…' : 'Send message'}</Btn>
        </form>
        <aside className="contact-info">
          <dl className="facts">
            {g.email && <div><dt>Email</dt><dd><a href={`mailto:${g.email}`}>{g.email}</a></dd></div>}
            {g.phone && <div><dt>Phone</dt><dd><a href={`tel:${g.phone.replace(/\s/g, '')}`}>{g.phone}</a></dd></div>}
            {g.address && <div><dt>Base</dt><dd>{g.address}</dd></div>}
            {c.hours && <div><dt>Hours</dt><dd>{c.hours}</dd></div>}
          </dl>
          {g.whatsapp && <Btn to={waLink(g.whatsapp, 'Hi Oshan!')}>Chat on WhatsApp</Btn>}
          {c.map_embed && <iframe className="map" src={c.map_embed} title="Map" loading="lazy" />}
        </aside>
      </section>
    </>
  )
}

/* ------------------------------------------------------------ Track booking */
export function TrackBooking() {
  const { site } = useSite()
  const [params] = useSearchParams()
  const [ref, setRef] = useState(params.get('ref') || '')
  const [email, setEmail] = useState(params.get('email') || '')
  const [st, setSt] = useState({ busy: false, err: '', res: null })
  const lookup = async (e) => {
    e?.preventDefault()
    setSt({ busy: true, err: '', res: null })
    try { setSt({ busy: false, err: '', res: await get(`/bookings/${encodeURIComponent(ref.trim())}?email=${encodeURIComponent(email.trim())}`) }) }
    catch (ex) { setSt({ busy: false, res: null, err: ex.status === 404 ? 'No booking found for that reference and email.' : ex.status ? ex.message : 'Could not reach the server. Please try again shortly.' }) }
  }
  useEffect(() => { if (params.get('ref') && params.get('email')) lookup() }, []) // eslint-disable-line
  const b = st.res?.data
  const badge = (s) => <span className={`status s-${s}`}>{s.replace('_', ' ')}</span>
  return (
    <>
      <PageHead eyebrow="Booking" title="Track your booking" text="Enter your reference and the email you booked with." />
      <section className="wrap narrow block">
        <form onSubmit={lookup} className="panel form">
          <div className="grid2">
            <label className="field"><span>Reference</span><input value={ref} onChange={(e) => setRef(e.target.value)} placeholder={`${site.booking.booking_prefix}-XXXXXX`} required /></label>
            <label className="field"><span>Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          </div>
          {st.err && <p className="notice err">{st.err}</p>}
          <Btn type="submit" disabled={st.busy}>{st.busy ? 'Looking…' : 'Find booking'}</Btn>
        </form>
        {b && (
          <div className="panel result">
            <div className="ref-box"><small>Booking reference</small><b>{b.reference}</b><span>{b.item}</span></div>
            <dl className="facts">
              <div><dt>Name</dt><dd>{b.name}</dd></div>
              <div><dt>Option</dt><dd>{b.ticket_type} × {b.quantity}</dd></div>
              <div><dt>Total</dt><dd>{money(b.amount, site)}</dd></div>
              <div><dt>Booking</dt><dd>{badge(b.status)}</dd></div>
              <div><dt>Payment</dt><dd>{badge(b.payment_status)}</dd></div>
            </dl>
            {b.payment_status !== 'paid' && b.status !== 'cancelled' && <PaymentPanel booking={b} payment={st.res.payment} />}
          </div>
        )}
      </section>
    </>
  )
}
