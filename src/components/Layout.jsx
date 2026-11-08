import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useSite } from '../context/SiteContext'
import { Anchor, Btn } from './Bits'
import { waLink } from '../lib/format'

function Brand({ site }) {
  const g = site.general
  return (
    <Link to="/" className="brand" aria-label={g.site_name}>
      {g.logo ? <img src={g.logo} alt={g.site_name} /> : (
        <>
          <span className="brand-main">{g.site_name.toUpperCase()}</span>
          <span className="brand-sub">DANCE · ARTIST</span>
        </>
      )}
    </Link>
  )
}

function Header() {
  const { site } = useSite()
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    const f = () => setSolid(window.scrollY > 40)
    f(); window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  const { items, cta_label, cta_href } = site.nav
  return (
    <header className={`header ${solid || pathname !== '/' ? 'solid' : ''} ${open ? 'open' : ''}`}>
      <Brand site={site} />
      <nav className="nav" aria-label="Main">
        {items.map((i) => (
          <NavLink key={i.href + i.label} to={i.href} className={({ isActive }) => (isActive ? 'active' : '')}>{i.label}</NavLink>
        ))}
      </nav>
      <div className="header-right">
        {cta_label && <Anchor to={cta_href} className="header-cta">{cta_label}</Anchor>}
        <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}><i /><i /></button>
      </div>
      <div className="mobile-menu">
        {items.map((i) => <Anchor key={i.href + i.label} to={i.href}>{i.label}</Anchor>)}
        {cta_label && <Btn to={cta_href}>{cta_label}</Btn>}
      </div>
    </header>
  )
}

function Footer() {
  const { site } = useSite()
  const g = site.general
  const f = site.footer
  const socials = Object.entries(g.socials || {}).filter(([, v]) => v)
  return (
    <footer className="footer">
      <div className="footer-top wrap">
        <div>
          <Brand site={site} />
          <p className="muted footer-text">{f.text}</p>
          <div className="socials">
            {socials.map(([k, v]) => <a key={k} href={v} target="_blank" rel="noreferrer">{k}</a>)}
          </div>
        </div>
        <div>
          <p className="eyebrow">Explore</p>
          <ul>{f.links.map((l) => <li key={l.label}><Anchor to={l.href}>{l.label}</Anchor></li>)}</ul>
        </div>
        <div>
          <p className="eyebrow">Contact</p>
          <ul className="muted">
            {g.email && <li><a href={`mailto:${g.email}`}>{g.email}</a></li>}
            {g.phone && <li><a href={`tel:${g.phone.replace(/\s/g, '')}`}>{g.phone}</a></li>}
            {g.address && <li>{g.address}</li>}
            {g.island_wide_note && <li>{g.island_wide_note}</li>}
          </ul>
        </div>
      </div>
      <div className="footer-bottom wrap">
        <span>{(f.copyright || '').replace('{year}', new Date().getFullYear())}</span>
        <span>{g.tagline}</span>
      </div>
    </footer>
  )
}

export default function Layout() {
  const { site, offline } = useSite()
  const { pathname } = useLocation()
  const [hideBadge, setHideBadge] = useState(false)
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  const wa = site.general.whatsapp
  return (
    <>
      <div className="grain" aria-hidden />
      <Header />
      <main key={pathname} className="page-enter"><Outlet /></main>
      <Footer />
      {wa && <a className="wa-fab" href={waLink(wa, `Hi ${site.general.owner_name}!`)} target="_blank" rel="noreferrer" aria-label="WhatsApp">WA</a>}
      {offline && !hideBadge && (
        <div className="offline-badge" role="status">
          <span>Demo content — can't reach the server</span>
          <button onClick={() => setHideBadge(true)} aria-label="Dismiss">×</button>
        </div>
      )}
    </>
  )
}