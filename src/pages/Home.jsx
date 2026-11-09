import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSite } from '../context/SiteContext'
import { useApi } from '../lib/useApi'
import { post } from '../lib/api'
import { money, pad, shortDate } from '../lib/format'
import Photo from '../components/Photo'
import Reveal from '../components/Reveal'
import { Anchor, Btn, Eyebrow, SectionHead, TextLink } from '../components/Bits'
import { EventCard } from '../components/Cards'

function Hero() {
  const { site } = useSite()
  const h = site.hero
  return (
    <section className="hero">
      {h.video_url ? (
        <div className="hero-media duo"><video src={h.video_url} autoPlay muted loop playsInline /></div>
      ) : (
        <Photo src={h.image} alt={site.general.site_name} pose={3} className="hero-media" />
      )}
      <div className="hero-shade" />
      <div className="hero-title">
        <h1 className="display hero-word" aria-label={`${h.title} ${h.subtitle}`}>
          <span className="glitch" data-text={h.title}>{h.title}</span>
        </h1>
        <p className="hero-sub">{h.subtitle}</p>
        <p className="hero-tag">{h.tagline}</p>
        <div className="hero-cta">
          {h.cta_primary_label && <Btn to={h.cta_primary_href}>{h.cta_primary_label}</Btn>}
          {h.cta_secondary_label && <Btn to={h.cta_secondary_href} variant="ghost">{h.cta_secondary_label}</Btn>}
        </div>
      </div>
      <div className="hero-scroll"><span>{h.scroll_text}</span><i /></div>
    </section>
  )
}

function Manifesto() {
  const { site } = useSite()
  const m = site.manifesto
  return (
    <section className="manifesto">
      <Reveal className="manifesto-img"><Photo src={m.image} alt="" pose={0} flip tone="blue" /></Reveal>
      <Reveal className="manifesto-copy" delay={120}>
        <h2 className="display h2">{m.title}</h2>
        <p className="lead">{m.text}</p>
        <TextLink to={m.link_href}>{m.link_label}</TextLink>
      </Reveal>
    </section>
  )
}

function Stats() {
  const { site } = useSite()
  if (!site.stats.show) return null
  return (
    <section className="stats wrap">
      {site.stats.items.map((s, i) => (
        <Reveal key={s.label} delay={i * 80} className="stat"><b className="display">{s.value}</b><span>{s.label}</span></Reveal>
      ))}
    </section>
  )
}

function Styles({ styles }) {
  const { site } = useSite()
  const s = site.styles_section
  return (
    <section className="styles-section">
      <div className="wrap"><SectionHead eyebrow={s.eyebrow} title={s.title} /></div>
      <div className="styles-grid">
        {styles.map((st, i) => (
          <Reveal key={st.id} delay={i * 90}>
            <Link to={`/classes?style=${st.slug}`} className="style-tile">
              <Photo src={st.image} alt={st.name} pose={i} flip={i % 2 === 1} tone={i === 1 ? 'warm' : 'blue'} />
              <div className="style-label"><span className="display">{st.name}</span><small>{st.tagline}</small><i>→</i></div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Programme({ classes }) {
  const { site } = useSite()
  const p = site.programme
  if (!p.show) return null
  return (
    <section className="programme">
      <Reveal className="programme-title">
        <Eyebrow>{p.eyebrow}</Eyebrow>
        <h2 className="display h2" style={{ whiteSpace: 'pre-line' }}>{p.title}</h2>
        <TextLink to={p.link_href}>{p.link_label}</TextLink>
      </Reveal>
      <Reveal className="programme-figure" delay={100}>
        <Photo src={p.image} alt="" pose={1} tone="blue" />
        {p.callouts.map((c, i) => <span key={i} className={`callout c${i + 1}`}><em>{c.label}</em><i /></span>)}
      </Reveal>
      <Reveal className="programme-list" delay={200}>
        {classes.map((c, i) => (
          <Link key={c.id} to={`/classes/${c.slug}`} className="plist-item">
            <Photo src={c.image} alt={c.title} pose={i + 1} flip={i % 2 === 1} />
            <div><b>{c.title}</b><span className="price">{c.fees?.per_class != null ? `${money(c.fees.per_class, site)} / class` : c.fees?.monthly != null ? `${money(c.fees.monthly, site)} / month` : c.district}</span></div>
          </Link>
        ))}
        <TextLink to={p.link_href}>{p.link_label}</TextLink>
      </Reveal>
    </section>
  )
}

function Events({ events }) {
  const { site } = useSite()
  const s = site.events_section
  if (!s.show || !events.length) return null
  return (
    <section className="wrap block">
      <SectionHead eyebrow={s.eyebrow} title={s.title} linkLabel={s.link_label} linkHref="/events" />
      <div className="grid3">{events.slice(0, 3).map((e, i) => <Reveal key={e.id} delay={i * 90}><EventCard e={e} i={i} /></Reveal>)}</div>
    </section>
  )
}

function Banner({ gallery }) {
  const { site } = useSite()
  const b = site.banner
  if (!b.show) return null
  const imgs = [...(b.images || [])]
  const fallbackItems = gallery.filter((g) => g.image).map((g) => g.image)
  const slots = [0, 1, 2, 3].map((i) => imgs[i] || fallbackItems[i] || null)
  return (
    <section className="banner">
      <div className="banner-strip">{slots.map((src, i) => <Photo key={i} src={src} alt="" pose={i} flip={i % 2 === 1} tone={i === 1 ? 'warm' : 'blue'} />)}</div>
      <div className="banner-copy">
        <h2 className="display" style={{ whiteSpace: 'pre-line' }}>{b.text}</h2>
        {b.link_label && <TextLink to={b.link_href}>{b.link_label}</TextLink>}
      </div>
    </section>
  )
}

function Testimonials({ items }) {
  const { site } = useSite()
  const s = site.testimonials_section
  const [i, setI] = useState(0)
  if (!s.show || !items.length) return null
  const t = items[i % items.length]
  return (
    <section className="wrap block testimonials">
      <SectionHead eyebrow={s.eyebrow} title={s.title} />
      <figure className="quote" key={t.id}>
        <blockquote className="display">“{t.quote}”</blockquote>
        <figcaption>
          <Photo src={t.avatar} alt={t.name} pose={i} className="avatar" />
          <span><b>{t.name}</b><small>{t.role}</small></span>
        </figcaption>
      </figure>
      <div className="quote-nav">
        {items.map((x, k) => <button key={x.id} className={k === i % items.length ? 'on' : ''} onClick={() => setI(k)} aria-label={`Testimonial ${k + 1}`} />)}
      </div>
    </section>
  )
}

function Journal({ posts }) {
  const { site } = useSite()
  const s = site.journal_section
  if (!s.show || !posts.length) return null
  return (
    <section className="journal">
      <div className="journal-label"><b>{pad(posts.length)}</b><span>{s.title}</span></div>
      <div className="journal-row">
        {posts.map((p, i) => (
          <Link key={p.id} to={`/journal/${p.slug}`} className="journal-card">
            <Photo src={p.cover} alt={p.title} pose={i + 2} flip={i % 2 === 0} />
            <div><small>{p.category}</small><b>{p.title}</b><time>{shortDate(p.published_at)}</time></div>
          </Link>
        ))}
      </div>
      <div className="journal-more"><TextLink to="/journal">{s.link_label}</TextLink></div>
    </section>
  )
}

export function Newsletter() {
  const { site } = useSite()
  const n = site.newsletter
  const [email, setEmail] = useState('')
  const [state, setState] = useState({ busy: false, msg: '', ok: false })
  if (!n.show) return null
  const submit = async (e) => {
    e.preventDefault()
    setState({ busy: true, msg: '', ok: false })
    try { const r = await post('/subscribe', { email }); setState({ busy: false, ok: true, msg: r.message || n.success }); setEmail('') }
    catch (ex) { setState({ busy: false, ok: false, msg: ex.errors?.email?.[0] || (ex.status ? ex.message : 'Could not reach the server — please try again shortly.') }) }
  }
  return (
    <section className="newsletter">
      <div className="wrap newsletter-in">
        <div><h2 className="display h2">{n.title}</h2><p className="muted">{n.text}</p></div>
        <form onSubmit={submit}>
          <input type="email" required placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
          <Btn type="submit" disabled={state.busy}>{state.busy ? '…' : n.button}</Btn>
          {state.msg && <p className={`notice ${state.ok ? 'ok' : 'err'}`}>{state.msg}</p>}
        </form>
      </div>
    </section>
  )
}

export default function Home() {
  const { data, loading } = useApi('/home')
  const d = data || { styles: [], featured_classes: [], upcoming_events: [], testimonials: [], gallery: [], posts: [] }
  return (
    <>
      <Hero />
      <Manifesto />
      <Stats />
      {!loading && <Styles styles={d.styles} />}
      {!loading && <Programme classes={d.featured_classes} />}
      {!loading && <Events events={d.upcoming_events} />}
      <Banner gallery={d.gallery} />
      <Testimonials items={d.testimonials} />
      <Journal posts={d.posts} />
      <Newsletter />
    </>
  )
}
