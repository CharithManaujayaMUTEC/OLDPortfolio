import { Link } from 'react-router-dom'

export const Eyebrow = ({ children }) => <p className="eyebrow">{children}</p>

export const SectionHead = ({ eyebrow, title, linkLabel, linkHref }) => (
  <div className="section-head">
    <div>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="display h2">{title}</h2>
    </div>
    {linkLabel && linkHref && <TextLink to={linkHref}>{linkLabel}</TextLink>}
  </div>
)

export const isExternal = (h = '') => /^(https?:|mailto:|tel:)/.test(h)

/** Internal -> router Link, external -> anchor. */
export function Anchor({ to, children, ...rest }) {
  if (isExternal(to)) return <a href={to} target={to.startsWith('http') ? '_blank' : undefined} rel="noreferrer" {...rest}>{children}</a>
  return <Link to={to || '/'} {...rest}>{children}</Link>
}

export const TextLink = ({ to, children }) => (
  <Anchor to={to} className="text-link">
    <span>{children}</span> <b>+</b>
  </Anchor>
)

export const Btn = ({ to, onClick, children, variant = 'solid', type = 'button', disabled, ...rest }) => {
  const cls = `btn btn-${variant}`
  if (to) return <Anchor to={to} className={cls} {...rest}>{children}</Anchor>
  return <button type={type} onClick={onClick} disabled={disabled} className={cls} {...rest}>{children}</button>
}

export const Loader = () => <div className="loader"><span /><span /><span /></div>

export const Empty = ({ children }) => <p className="empty">{children}</p>

export const Prose = ({ html, text }) =>
  html ? <div className="prose" dangerouslySetInnerHTML={{ __html: html }} /> :
  <div className="prose">{(text || '').split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div>