import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { post } from '../lib/api'
import { REG_TOKEN } from '../lib/regToken'
import { Btn } from '../components/Bits'
import { NotFound } from './Misc'

const EP = '/internal-registration' // standalone endpoints – not linked to any existing student/booking data

function Field({ label, error, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <em className="field-error">{error}</em>}
    </label>
  )
}

function Form() {
  const [f, setF] = useState({ name: '', cls: '', mobile: '' })
  const [otp, setOtp] = useState('')
  const [stage, setStage] = useState('details') // details -> otp -> verified -> done
  const [verifyToken, setVerifyToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')
  const [errors, setErrors] = useState({})
  const [cool, setCool] = useState(0)

  useEffect(() => {
    document.title = 'Registration'
    const m = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex,nofollow,noarchive' })
    document.head.appendChild(m)
    return () => m.remove()
  }, [])
  useEffect(() => { if (cool > 0) { const t = setTimeout(() => setCool(cool - 1), 1000); return () => clearTimeout(t) } }, [cool])

  const set = (k) => (e) => { setF((s) => ({ ...s, [k]: e.target.value })); if (k === 'mobile' && stage !== 'details') { setStage('details'); setOtp(''); setVerifyToken('') } }
  const mobile = f.mobile.replace(/[^\d+]/g, '')

  const run = async (fn) => {
    setBusy(true); setErr(''); setInfo('')
    try { await fn() } catch (ex) { setErr(ex.errors ? Object.values(ex.errors).flat()[0] : ex.message || 'Something went wrong. Please try again.') } finally { setBusy(false) }
  }

  const validate = () => {
    const e = {}
    if (!f.name.trim()) e.name = 'Name is required'
    if (!f.cls.trim()) e.cls = 'Class is required'
    if (mobile.replace(/\D/g, '').length < 9) e.mobile = 'Enter a valid mobile number'
    setErrors(e)
    return !Object.keys(e).length
  }

  const sendOtp = () => validate() && run(async () => {
    await post(`${EP}/otp`, { mobile })
    setStage('otp'); setCool(30); setInfo(`A 6-digit code was sent to ${mobile}.`)
  })
  const verify = () => run(async () => {
    const r = await post(`${EP}/verify`, { mobile, code: otp.trim() })
    setVerifyToken(r.token || r.data?.token || ''); setStage('verified')
  })
  const submit = (e) => {
    e.preventDefault()
    if (stage !== 'verified' || !validate()) return
    run(async () => { await post(`${EP}/submit`, { name: f.name.trim(), class: f.cls.trim(), mobile, token: verifyToken }); setStage('done') })
  }

  if (stage === 'done') {
    return (
      <main className="wrap" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '40px 0' }}>
        <div style={{ maxWidth: 520, width: '100%' }}>
          <p className="eyebrow">Registration</p>
          <h1 className="display" style={{ fontSize: 'clamp(26px,5vw,40px)', marginBottom: 16 }}>You're registered</h1>
          <p className="notice ok">Thank you, {f.name}. Your details have been received.</p>
        </div>
      </main>
    )
  }

  const locked = stage !== 'details'
  return (
    <main className="wrap" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '40px 0' }}>
      <form onSubmit={submit} style={{ maxWidth: 520, width: '100%', display: 'grid', gap: 18 }} noValidate>
        <div>
          <p className="eyebrow">Internal · Private</p>
          <h1 className="display" style={{ fontSize: 'clamp(26px,5vw,40px)' }}>Student Registration form</h1>
        </div>
        <Field label="Name" error={errors.name}><input value={f.name} onChange={set('name')} autoComplete="name" /></Field>
        <Field label="Class" error={errors.cls}><input value={f.cls} onChange={set('cls')} /></Field>
        <Field label="Mobile number (OTP verification required)" error={errors.mobile}>
          <input value={f.mobile} onChange={set('mobile')} inputMode="tel" autoComplete="tel" placeholder="07X XXX XXXX" />
        </Field>

        {stage === 'details' && <Btn type="button" onClick={sendOtp} disabled={busy}>{busy ? 'Sending…' : 'Send OTP'}</Btn>}

        {stage === 'otp' && (
          <>
            <Field label="Enter 6-digit OTP"><input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" /></Field>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Btn type="button" onClick={verify} disabled={busy || otp.length !== 6}>{busy ? 'Verifying…' : 'Verify'}</Btn>
              <button type="button" className="btn btn-ghost" onClick={sendOtp} disabled={busy || cool > 0}>{cool > 0 ? `Resend in ${cool}s` : 'Resend OTP'}</button>
            </div>
          </>
        )}

        {stage === 'verified' && (
          <>
            <p className="notice ok">Mobile number verified ✓</p>
            <Btn type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit registration'}</Btn>
          </>
        )}

        {info && !err && <p className="notice">{info}</p>}
        {err && <p className="notice err">{err}</p>}
        {locked && stage !== 'verified' && <small className="muted">Wrong number? Edit it above to start again.</small>}
      </form>
    </main>
  )
}

export default function StudentRegistration() {
  const { token } = useParams()
  return token === REG_TOKEN ? <Form /> : <NotFound />
}
