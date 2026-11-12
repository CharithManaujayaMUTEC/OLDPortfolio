import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useApi } from '../lib/useApi'
import { del, getWithFallback, post } from '../lib/api'
import { fmtDate, fmtTime, dd, mon } from '../lib/format'
import { loadFont } from '../context/SiteContext'
import Photo from '../components/Photo'
import Reveal from '../components/Reveal'
import { Btn, Eyebrow, Loader, Prose, SectionHead, TextLink } from '../components/Bits'
import { PageHead } from './Classes'
import { NotFound } from './Misc'

/* ------------------------------------------------------------------ helpers */
const themeStyle = (d = {}) => ({
  '--tk-bg': d.bg_color, '--tk-card': d.card_color, '--tk-text': d.text_color, '--tk-muted': d.muted_color,
  '--tk-accent': d.accent_color, '--tk-primary': d.primary_color, '--tk-radius': `${d.radius ?? 14}px`,
  '--tk-display': `'${d.font_display}', 'Archivo Black', sans-serif`, '--tk-body': `'${d.font_body}', system-ui, sans-serif`,
})
const useTicketFonts = (d) => useEffect(() => { if (d) { loadFont(d.font_display); loadFont(d.font_body) } }, [d])

const statusLabel = { issued: 'Valid', pending: 'Awaiting approval', checked_in: 'Checked in', cancelled: 'Cancelled' }

function icsFor(event) {
  const f = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Oshan Liyanage//Family Events//EN', 'BEGIN:VEVENT', `UID:${event.slug}@oshan`, `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(event.starts_at)}`, `DTEND:${f(event.ends_at || new Date(new Date(event.starts_at).getTime() + 3 * 3600e3))}`, `SUMMARY:${event.title}`,
    `LOCATION:${[event.venue?.name, event.venue?.address].filter(Boolean).join(', ')}`, 'END:VEVENT', 'END:VCALENDAR']
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `${event.slug}.ics` })
  a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* ------------------------------------------------------- strip on the Events page */
export function FamilyEventsStrip() {
  const { data } = useApi('/family-events')
  if (!data?.length) return null
  return (
    <section className="wrap block family-strip">
      <SectionHead eyebrow="Closed events" title="For our dance family" />
      <p className="muted" style={{ marginTop: -20, marginBottom: 28, maxWidth: '60ch' }}>Invitation-only events for class students and their relatives. Students can register tickets for the whole family.</p>
      <div className="grid3">
        {data.map((e, i) => (
          <Reveal key={e.id} delay={i * 80}>
            <Link to={`/family/${e.slug}`} className="card event-card">
              <Photo src={e.cover} alt={e.title} pose={i + 4} tone="warm" className="card-photo">
                <div className="date-tag"><b>{dd(e.starts_at)}</b><span>{mon(e.starts_at)}</span></div>
                <span className="chip">Invite only</span>
              </Photo>
              <div className="card-body">
                <h3>{e.title}</h3>
                <p className="muted small">{fmtTime(e.starts_at)} · {e.venue?.name || 'To be announced'}</p>
                <div className="card-foot"><span className="price">{e.registration_open ? 'Registration open' : 'Registration closed'}</span><span className="text-link"><span>Get tickets</span> <b>+</b></span></div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- event page */
export function FamilyEventDetail() {
  const { slug } = useParams()
  const { data: e, page, loading, error } = useApi(`/family-events/${slug}`)
  const [mobile, setMobile] = useState('')
  const [st, setSt] = useState({ busy: false, msg: '', err: '' })
  if (loading) return <Loader />
  if (error || !e) return <NotFound />
  const p = page || {}

  const submit = async (ev) => {
    ev.preventDefault()
    setSt({ busy: true, msg: '', err: '' })
    try { const r = await post(`/family-events/${slug}/request-invite`, { mobile }); setSt({ busy: false, msg: r.message || p.request_sent, err: '' }) }
    catch (ex) { setSt({ busy: false, msg: '', err: ex.errors?.mobile?.[0] || (ex.status === 429 ? 'Too many tries — please wait a minute.' : ex.status ? ex.message : 'We could not reach the server. Please try again shortly.') }) }
  }

  return (
    <>
      <section className="detail-hero">
        <Photo src={e.cover} alt={e.title} pose={4} tone="warm" className="detail-cover" />
        <div className="detail-hero-copy wrap">
          <Eyebrow>Invitation only · class students & families</Eyebrow>
          <h1 className="display h1">{e.title}</h1>
          <p className="lead">{fmtDate(e.starts_at, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {fmtTime(e.starts_at)}</p>
        </div>
      </section>
      <section className="wrap block detail-grid">
        <div>
          {e.summary && <p className="lead">{e.summary}</p>}
          <Prose html={e.description} />
        </div>
        <aside className="panel sticky">
          <dl className="facts">
            <div><dt>Date</dt><dd>{fmtDate(e.starts_at)}</dd></div>
            <div><dt>Time</dt><dd>{fmtTime(e.starts_at)}{e.ends_at ? ` – ${fmtTime(e.ends_at)}` : ''}</dd></div>
            <div><dt>Venue</dt><dd>{e.venue?.name || 'To be announced'}{e.venue?.address && <><br /><small className="muted">{e.venue.address}</small></>}</dd></div>
            {e.seats_left != null && <div><dt>Seats left</dt><dd>{e.seats_left}</dd></div>}
          </dl>

          {e.registration_open && e.allow_self_request ? (
            <form onSubmit={submit} className="form" style={{ padding: 0, border: 0, background: 'none' }}>
              <h3 className="h3" style={{ margin: 0 }}>{p.request_title}</h3>
              <p className="muted small">{p.request_text}</p>
              <label className="field"><span>Registered mobile number</span>
                <input inputMode="tel" autoComplete="tel" placeholder="07X XXX XXXX" value={mobile} onChange={(x) => setMobile(x.target.value)} required />
              </label>
              {st.msg && <p className="notice ok">{st.msg}</p>}
              {st.err && <p className="notice err">{st.err}</p>}
              <Btn type="submit" disabled={st.busy}>{st.busy ? 'Sending…' : 'Send me my link'}</Btn>
              <p className="muted small">Your link is sent only to the number registered with your class. Not receiving it? Ask your coach to check your number.</p>
            </form>
          ) : (
            <p className="notice">{e.registration_open ? 'Your personal invitation link is sent to you directly by our team. Open it from your SMS or WhatsApp.' : (p.closed_text || 'Ticket registration is closed.')}</p>
          )}
          {e.venue?.map_url && <TextLink to={e.venue.map_url}>Open in maps</TextLink>}
        </aside>
      </section>
    </>
  )
}

/* ------------------------------------------------------------- family tickets */
const emptyRow = (over = {}) => ({ holder_name: '', relationship: 'mother', remark: '', holder_phone: '', ...over })

function MiniTicket({ t, design, onCancel, canCancel }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/t/${t.code}`
  return (
    <div className={`mini-ticket st-${t.status}`}>
      <div className="mini-qr"><QRCodeSVG value={t.qr_value || url} size={104} fgColor={design.qr_fg} bgColor={design.qr_bg} level="M" /></div>
      <div className="mini-info">
        <b>{t.holder_name}</b>
        <span>{t.relationship_label}{t.remark ? ` · ${t.remark}` : ''}</span>
        <em className={`tk-status s-${t.status}`}>{statusLabel[t.status] || t.status}</em>
        <div className="mini-actions">
          <Link to={`/t/${t.code}`}>Open ticket</Link>
          <button type="button" onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>{copied ? 'Copied' : 'Copy link'}</button>
          {canCancel && ['issued', 'pending'].includes(t.status) && <button type="button" className="danger" onClick={() => onCancel(t)}>Remove</button>}
        </div>
      </div>
    </div>
  )
}

export function InvitePage() {
  const { token } = useParams()
  const [inv, setInv] = useState(null)
  const [load, setLoad] = useState({ loading: true, error: null })
  const [rows, setRows] = useState([])
  const [busy, setBusy] = useState(false)
  const [errs, setErrs] = useState({ general: '', rows: {} })
  const [done, setDone] = useState(false)

  useEffect(() => {
    let alive = true
    getWithFallback(`/invitations/${token}`)
      .then((r) => { if (!alive) return; setInv(r.data); setRows(r.data.used === 0 ? [emptyRow({ holder_name: r.data.student.name, relationship: 'student' })] : [emptyRow()]); setLoad({ loading: false, error: null }) })
      .catch((e) => alive && setLoad({ loading: false, error: e }))
    return () => { alive = false }
  }, [token])

  const d = inv?.design
  useTicketFonts(d)
  const style = useMemo(() => themeStyle(d), [d])

  if (load.loading) return <Loader />
  if (load.error || !inv) return (
    <section className="page-head center"><div className="wrap"><h1 className="display h2">Link not found</h1><p className="lead" style={{ margin: '16px auto' }}>This invitation link is not valid{load.error?.status ? '.' : ', or we could not reach the server. Please try again shortly.'}</p><Btn to="/events">See events</Btn></div></section>
  )

  const e = inv.event
  const p = inv.page || {}
  const setRow = (i, k, v) => setRows((rs) => rs.map((r, x) => (x === i ? { ...r, [k]: v } : r)))
  const canAdd = rows.length < inv.remaining

  const submit = async (ev) => {
    ev.preventDefault()
    setErrs({ general: '', rows: {} }); setDone(false)
    const bad = {}
    rows.forEach((r, i) => {
      if (!r.holder_name.trim()) bad[i] = { ...bad[i], holder_name: 'Enter a name' }
      if (r.relationship === 'other' && !r.remark.trim()) bad[i] = { ...bad[i], remark: 'Tell us how they are connected' }
    })
    if (Object.keys(bad).length) return setErrs({ general: '', rows: bad })
    setBusy(true)
    try {
      const res = await post(`/invitations/${token}/tickets`, { tickets: rows.map((r) => ({ ...r, holder_phone: r.holder_phone || null, remark: r.remark || null })) })
      setInv(res.data); setRows([]); setDone(true)
      setTimeout(() => document.getElementById('my-tickets')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (ex) {
      const rowErr = {}
      Object.entries(ex.errors || {}).forEach(([k, v]) => { const m = k.match(/^tickets\.(\d+)\.(\w+)$/); if (m) rowErr[m[1]] = { ...rowErr[m[1]], [m[2]]: v[0] } })
      setErrs({ general: ex.errors?.tickets?.[0] || (Object.keys(rowErr).length ? '' : (ex.status ? ex.message : 'We could not reach the server. Please try again.')), rows: rowErr })
    } finally { setBusy(false) }
  }

  const cancel = async (t) => {
    if (!window.confirm(`Remove the ticket for ${t.holder_name}?`)) return
    try { const res = await del(`/invitations/${token}/tickets/${t.code}`); setInv(res.data); if (rows.length === 0) setRows([emptyRow()]) }
    catch (ex) { setErrs({ general: ex.message, rows: {} }) }
  }

  return (
    <div className="tk-page" style={style}>
      <div className="tk-hero">
        <Photo src={d.banner_image || e.cover} alt={e.title} pose={4} tone="warm" className={`tk-hero-photo ${d.duotone ? '' : 'plain'}`} />
        <div className="tk-hero-copy wrap narrow">
          <small>{inv.demo ? 'SAMPLE · ' : ''}Family tickets</small>
          <h1>{e.title}</h1>
          <p>{fmtDate(e.starts_at, { weekday: 'long', day: 'numeric', month: 'long' })} · {fmtTime(e.starts_at)} · {e.venue?.name}</p>
        </div>
      </div>

      <div className="wrap narrow tk-content">
        <div className="tk-hello">
          <h2>Hi {inv.student.first_name}!</h2>
          <p>{p.invite_intro}</p>
          <div className="allowance">
            <div className="pips">{Array.from({ length: inv.allowance }).map((_, i) => <i key={i} className={i < inv.used ? 'on' : ''} />)}</div>
            <span><b>{inv.used}</b> of <b>{inv.allowance}</b> tickets registered{inv.remaining > 0 ? ` · ${inv.remaining} left` : ''}</span>
          </div>
        </div>

        {done && <p className="notice ok">{inv.requires_approval ? p.pending_text : p.success_text}</p>}

        {inv.can_register && rows.length > 0 && (
          <form onSubmit={submit} className="tk-form">
            <h3>Who is coming?</h3>
            {rows.map((r, i) => (
              <div className="tk-row" key={i}>
                <div className="tk-row-head"><b>Guest {inv.used + i + 1}</b>{rows.length > 1 && <button type="button" onClick={() => setRows((rs) => rs.filter((_, x) => x !== i))}>Remove</button>}</div>
                <div className="tk-grid">
                  <label><span>Full name</span><input value={r.holder_name} onChange={(x) => setRow(i, 'holder_name', x.target.value)} />{errs.rows[i]?.holder_name && <em>{errs.rows[i].holder_name}</em>}</label>
                  <label><span>Relationship</span>
                    <select value={r.relationship} onChange={(x) => setRow(i, 'relationship', x.target.value)}>
                      {inv.relationships.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </label>
                  <label><span>Remark {r.relationship === 'other' ? '(required)' : '(optional)'}</span>
                    <input value={r.remark} placeholder={r.relationship === 'other' ? 'e.g. Family friend' : 'e.g. Aunty Kamani'} onChange={(x) => setRow(i, 'remark', x.target.value)} />
                    {errs.rows[i]?.remark && <em>{errs.rows[i].remark}</em>}
                  </label>
                  <label><span>Their mobile (optional)</span><input inputMode="tel" placeholder="We'll send their ticket too" value={r.holder_phone} onChange={(x) => setRow(i, 'holder_phone', x.target.value)} /></label>
                </div>
              </div>
            ))}
            {canAdd && <button type="button" className="tk-add" onClick={() => setRows((rs) => [...rs, emptyRow()])}>+ Add another guest ({inv.remaining - rows.length} more allowed)</button>}
            {errs.general && <p className="notice err">{errs.general}</p>}
            <button type="submit" className="tk-btn" disabled={busy}>{busy ? 'Creating tickets…' : `Get ${rows.length} ticket${rows.length > 1 ? 's' : ''}`}</button>
            {inv.mobile_hint && <p className="tk-note">Ticket links are sent to {inv.mobile_hint}.</p>}
          </form>
        )}

        {!inv.can_register && inv.remaining > 0 && <p className="notice">{p.closed_text}</p>}
        {inv.remaining === 0 && inv.used > 0 && !done && <p className="notice">You have registered all {inv.allowance} tickets. You can remove a ticket below to give the seat to someone else.</p>}

        {inv.tickets.length > 0 && (
          <div id="my-tickets" className="tk-list">
            <h3>Your tickets</h3>
            <p className="tk-note">Each person shows their own QR code at the entrance. Open a ticket to save or print it, or forward the link.</p>
            {inv.tickets.map((t) => <MiniTicket key={t.code} t={t} design={d} canCancel={!inv.demo && new Date(e.starts_at) > new Date()} onCancel={cancel} />)}
          </div>
        )}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- ticket page */
export function TicketPage() {
  const { code } = useParams()
  const { data: t, loading, error } = useApi(`/tickets/${code}`)
  const d = t?.design
  useTicketFonts(d)
  const style = useMemo(() => themeStyle(d), [d])
  if (loading) return <Loader />
  if (error || !t) return <NotFound />
  const e = t.event
  const dead = t.status === 'cancelled'

  return (
    <div className={`tk-page tk-solo ${d.duotone ? '' : 'plain'}`} style={style}>
      <div className="wrap narrow">
        {t.demo && <p className="tk-demo">Sample ticket: this is how every ticket looks with your current design settings.</p>}
        <article className={`tk st-${t.status}`}>
          <header className="tk-banner">
            <Photo src={d.banner_image || e.cover} alt="" pose={4} tone="warm" />
            <div className="tk-banner-shade" />
            <div className="tk-banner-top">
              {d.logo ? <img src={d.logo} alt="" className="tk-logo" /> : <span />}
              <span className="tk-admit">{d.header_text}</span>
            </div>
          </header>

          <div className="tk-main">
            <h1>{e.title}</h1>
            <div className="tk-meta">
              <div><small>Date</small><b>{fmtDate(e.starts_at, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</b></div>
              <div><small>Time</small><b>{fmtTime(e.starts_at)}</b></div>
              {d.show_venue && e.venue?.name && <div><small>Venue</small><b>{e.venue.name}</b></div>}
            </div>
            <div className="tk-guest">
              <small>Guest</small>
              <b>{t.holder_name}</b>
              {d.show_relationship && <span>{t.relationship_label}{t.remark ? ` · ${t.remark}` : ''}</span>}
              {t.student_name && <span className="tk-by">Invited by {t.student_name}</span>}
            </div>
          </div>

          <div className="tk-perf"><i /><hr /><i /></div>

          <div className="tk-stub">
            <div className={`tk-qrwrap ${dead ? 'dead' : ''}`}>
              <QRCodeSVG value={t.qr_value} size={210} fgColor={d.qr_fg} bgColor={d.qr_bg} level="M" marginSize={2} />
              {t.status !== 'issued' && <div className={`tk-stamp s-${t.status}`}>{statusLabel[t.status]}</div>}
            </div>
            <code className="tk-code">{t.display_code}</code>
            <p className="tk-footer">{d.footer_text}</p>
            <p className="tk-terms">{d.terms_text}</p>
          </div>
        </article>

        <div className="tk-actions">
          <button type="button" className="tk-btn" onClick={() => window.print()}>Save / print ticket</button>
          <button type="button" className="tk-btn ghost" onClick={() => icsFor(e)}>Add to calendar</button>
          {e.venue?.map_url && <a className="tk-btn ghost" href={e.venue.map_url} target="_blank" rel="noreferrer">Directions</a>}
        </div>
      </div>
    </div>
  )
}
