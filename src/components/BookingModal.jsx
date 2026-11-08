import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSite } from '../context/SiteContext'
import { useApi } from '../lib/useApi'
import { post } from '../lib/api'
import { money, waLink } from '../lib/format'
import { Btn } from './Bits'

const BILLING = { monthly: 'Monthly fee', per_class: 'Single class', admission: 'Admission only' }

function Field({ label, error, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <em className="field-error">{Array.isArray(error) ? error[0] : error}</em>}
    </label>
  )
}

function Receipt({ booking, onDone }) {
  const [file, setFile] = useState(null)
  const [ref, setRef] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [sent, setSent] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    if (!file) return setErr('Please choose your payment slip (image or PDF).')
    setBusy(true); setErr('')
    const fd = new FormData()
    fd.append('email', booking.email); fd.append('receipt', file); if (ref) fd.append('payment_reference', ref)
    try { await post(`/bookings/${booking.reference}/receipt`, fd); setSent(true); onDone?.() }
    catch (ex) { setErr(ex.errors?.receipt?.[0] || ex.message || 'Upload failed. Please try again.') }
    finally { setBusy(false) }
  }
  if (sent) return <p className="notice ok">Receipt received — we will verify it and confirm your booking shortly.</p>
  return (
    <form onSubmit={submit} className="receipt-form">
      <h4>Upload your payment slip</h4>
      <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <input type="text" placeholder="Bank reference (optional)" value={ref} onChange={(e) => setRef(e.target.value)} />
      {err && <p className="notice err">{err}</p>}
      <Btn type="submit" disabled={busy}>{busy ? 'Uploading…' : 'Send receipt'}</Btn>
    </form>
  )
}

export function PaymentPanel({ booking, payment }) {
  const payRef = useRef(null)
  const [paid, setPaid] = useState(booking.payment_status === 'paid')
  if (!payment) return null
  return (
    <div className="pay-panel">
      <h4>{payment.name}</h4>
      {payment.type === 'bank_transfer' && payment.bank && (
        <dl className="bank">
          <div><dt>Bank</dt><dd>{payment.bank.bank_name}</dd></div>
          <div><dt>Account name</dt><dd>{payment.bank.account_name}</dd></div>
          <div><dt>Account no.</dt><dd>{payment.bank.account_number}</dd></div>
          <div><dt>Branch</dt><dd>{payment.bank.branch}</dd></div>
          <div><dt>Reference</dt><dd>{booking.reference}</dd></div>
        </dl>
      )}
      {payment.instructions && <div className="prose small" dangerouslySetInnerHTML={{ __html: payment.instructions }} />}
      {payment.type === 'bank_transfer' && !paid && booking.payment_status !== 'awaiting_verification' && <Receipt booking={booking} onDone={() => {}} />}
      {payment.payhere && (
        <form ref={payRef} method="post" action={payment.payhere.action}>
          {Object.entries(payment.payhere.fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
          <Btn type="submit">Pay {money(booking.amount)} securely</Btn>
        </form>
      )}
      {payment.link && <Btn to={payment.link}>Open payment page</Btn>}
    </div>
  )
}

export default function BookingModal({ type, item, onClose }) {
  const { site } = useSite()
  const isClass = type === 'class'
  const { data: methods } = useApi('/payment-methods')
  const options = useMemo(() => (isClass
    ? Object.entries(BILLING).filter(([k]) => item.fees?.[k] != null).map(([k, label]) => ({ key: k, label, price: item.fees[k] }))
    : (item.ticket_types || []).filter((t) => !t.sold_out).map((t) => ({ key: t.name, label: t.name, price: t.price, note: t.description, remaining: t.remaining }))),
  [item, isClass])

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '', age: '', quantity: 1, notes: '' })
  const [option, setOption] = useState(options[0]?.key)
  const [admission, setAdmission] = useState(false)
  const [methodId, setMethodId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null)

  useEffect(() => { document.body.classList.add('modal-open'); const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => { document.body.classList.remove('modal-open'); window.removeEventListener('keydown', k) } }, [onClose])
  useEffect(() => { if (methods?.length && !methodId) setMethodId(methods[0].id) }, [methods, methodId])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const opt = options.find((o) => o.key === option)
  const method = methods?.find((m) => m.id === methodId)
  const maxQty = Math.min(site.booking.max_tickets_per_booking || 10, opt?.remaining ?? 99, !isClass ? 99 : (item.seats_left ?? 99))

  const subtotal = ((opt?.price || 0) + (isClass && admission && option !== 'admission' ? item.fees.admission || 0 : 0)) * form.quantity
  const fee = subtotal * ((method?.fee_percent || 0) / 100)
  const tax = subtotal * ((site.payments?.tax_percent || 0) / 100)
  const total = subtotal + fee + tax

  const validateDetails = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Your name is required'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email'
    if (form.phone.replace(/\D/g, '').length < 7) e.phone = 'Enter a valid phone number'
    if (!opt) e.option = 'Nothing available to book'
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = async () => {
    setBusy(true); setError(''); setErrors({})
    try {
      const body = {
        type, name: form.name, email: form.email, phone: form.phone, age: form.age || null, quantity: Number(form.quantity),
        notes: form.notes || null, payment_method_id: methodId, return_url: window.location.origin,
        ...(isClass ? { class_id: item.id, billing: option, include_admission: admission } : { event_id: item.id, ticket_type: option }),
      }
      const res = await post('/bookings', body)
      setResult(res); setStep(3)
    } catch (ex) {
      if (ex.errors) { setErrors(ex.errors); setStep(1); setError(ex.message) }
      else if (ex.status) setError(ex.message)
      else setError('We could not reach the server. Please try again in a moment, or contact us directly on WhatsApp.')
    } finally { setBusy(false) }
  }

  const title = isClass ? item.title : item.title
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={`Book ${title}`}>
        <button className="modal-x" onClick={onClose} aria-label="Close">×</button>
        {step < 3 && (
          <>
            <p className="eyebrow">{isClass ? 'Class registration' : 'Event tickets'} · Step {step} of 2</p>
            <h3 className="display modal-title">{title}</h3>
          </>
        )}

        {step === 1 && (
          <div className="modal-body">
            {options.length === 0 ? <p className="notice err">Booking is not available right now.</p> : (
              <>
                <div className="options">
                  {options.map((o) => (
                    <button type="button" key={o.key} className={`option ${o.key === option ? 'on' : ''}`} onClick={() => setOption(o.key)}>
                      <b>{o.label}</b>
                      <span>{o.price === 0 ? 'Free' : money(o.price, site)}</span>
                      {o.note && <small>{o.note}</small>}
                    </button>
                  ))}
                </div>
                {isClass && option !== 'admission' && item.fees?.admission != null && (
                  <label className="check"><input type="checkbox" checked={admission} onChange={(e) => setAdmission(e.target.checked)} /> Add one-time admission fee ({money(item.fees.admission, site)})</label>
                )}
                <div className="grid2">
                  <Field label="Full name" error={errors.name}><input value={form.name} onChange={set('name')} autoComplete="name" /></Field>
                  <Field label="Email" error={errors.email}><input type="email" value={form.email} onChange={set('email')} autoComplete="email" /></Field>
                  <Field label="Phone / WhatsApp" error={errors.phone}><input value={form.phone} onChange={set('phone')} autoComplete="tel" /></Field>
                  <Field label={isClass ? 'Student age' : 'Tickets'} error={errors.quantity}>
                    {isClass
                      ? <input value={form.age} onChange={set('age')} placeholder="e.g. 14" />
                      : <input type="number" min="1" max={maxQty} value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: Math.max(1, Math.min(maxQty, Number(e.target.value) || 1)) }))} />}
                  </Field>
                </div>
                <Field label="Notes (optional)"><textarea rows="2" value={form.notes} onChange={set('notes')} /></Field>
                {error && <p className="notice err">{error}</p>}
                <div className="modal-foot">
                  <div className="total"><small>Subtotal</small><b>{money(subtotal, site)}</b></div>
                  <Btn onClick={() => validateDetails() && setStep(2)}>Continue to payment</Btn>
                </div>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="modal-body">
            <div className="methods">
              {(methods || []).map((m) => (
                <button type="button" key={m.id} className={`option method ${m.id === methodId ? 'on' : ''}`} onClick={() => setMethodId(m.id)}>
                  <b>{m.name}</b>{m.description && <small>{m.description}</small>}
                  {m.fee_percent > 0 && <small>+{m.fee_percent}% fee</small>}
                </button>
              ))}
              {!methods?.length && <p className="notice">No payment methods are available right now — please contact us to complete your booking.</p>}
            </div>
            <dl className="summary">
              <div><dt>{opt?.label} × {form.quantity}</dt><dd>{money(subtotal, site)}</dd></div>
              {fee > 0 && <div><dt>Payment fee</dt><dd>{money(fee, site)}</dd></div>}
              {tax > 0 && <div><dt>Tax</dt><dd>{money(tax, site)}</dd></div>}
              <div className="sum-total"><dt>Total</dt><dd>{money(total, site)}</dd></div>
            </dl>
            {site.payments?.checkout_notice && <p className="muted small">{site.payments.checkout_notice}</p>}
            {site.booking.terms_text && <p className="muted small">{site.booking.terms_text}</p>}
            {error && <p className="notice err">{error} {site.general.whatsapp && <a href={waLink(site.general.whatsapp, `Hi, I'd like to book ${title}`)} target="_blank" rel="noreferrer">WhatsApp us</a>}</p>}
            <div className="modal-foot">
              <button className="text-link" onClick={() => setStep(1)}><span>Back</span></button>
              <Btn onClick={submit} disabled={busy || !methodId}>{busy ? 'Booking…' : `Confirm booking · ${money(total, site)}`}</Btn>
            </div>
          </div>
        )}

        {step === 3 && result && (
          <div className="modal-body done">
            <div className="tick">✓</div>
            <h3 className="display modal-title">{isClass ? site.booking.class_success_title : site.booking.event_success_title}</h3>
            <p className="muted">{site.booking.success_text}</p>
            <div className="ref-box"><small>Booking reference</small><b>{result.data.reference}</b><span>{result.data.item} · {money(result.data.amount, site)}</span></div>
            <PaymentPanel booking={result.data} payment={result.payment} />
            <div className="modal-foot">
              <Link className="text-link" to={`/booking/track?ref=${result.data.reference}&email=${encodeURIComponent(result.data.email)}`} onClick={onClose}><span>Track this booking</span> <b>+</b></Link>
              <Btn variant="ghost" onClick={onClose}>Close</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
