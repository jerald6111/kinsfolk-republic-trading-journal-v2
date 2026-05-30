import React, { useState } from 'react'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth, getAutoLockMinutes, setAutoLockMinutes } from '../context/AuthContext'

const AUTOLOCK_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
]

export default function SecuritySettings() {
  const { changePasscode } = useAuth()

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [autoLock, setAutoLock] = useState<number>(() => getAutoLockMinutes())

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSaved(false)
    if (next.length < 4) return setError('New passcode must be at least 4 characters.')
    if (next !== confirm) return setError('New passcodes do not match.')
    try {
      setBusy(true)
      await changePasscode(current, next)
      setCurrent(''); setNext(''); setConfirm('')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Current passcode is incorrect.')
    } finally {
      setBusy(false)
    }
  }

  const onAutoLockChange = (v: number) => {
    setAutoLock(v)
    setAutoLockMinutes(v)
  }

  const inputCls =
    'w-full px-4 py-3 border border-krborder rounded-xl bg-krblack/30 text-krtext focus:ring-2 focus:ring-krgold/20 focus:border-krgold transition-all'

  return (
    <div className="bg-krcard shadow-soft rounded-xl border border-krborder transition-all duration-200 hover:border-krgold/40 p-5 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-krborder bg-krpanel text-krgold"><Lock size={18} /></span>
        <div>
          <h2 className="text-lg font-semibold text-krtext">Security &amp; Passcode</h2>
          <p className="text-xs text-krmuted">Your journal is encrypted on this device with your passcode</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Change passcode */}
        <form onSubmit={submit} className="space-y-3">
          <label className="block text-sm font-medium text-krtext">Change passcode</label>
          <div className="relative">
            <input type={show ? 'text' : 'password'} value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Current passcode" className={inputCls + ' pr-11'} />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-krmuted hover:text-krwhite" tabIndex={-1}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <input type={show ? 'text' : 'password'} value={next} onChange={(e) => setNext(e.target.value)} placeholder="New passcode" className={inputCls} />
          <input type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new passcode" className={inputCls} />

          {error && <p className="text-sm text-krdanger">{error}</p>}
          {saved && <p className="text-sm text-krsuccess flex items-center gap-1.5"><CheckCircle2 size={15} /> Passcode updated</p>}

          <button type="submit" disabled={busy} className="shine inline-flex items-center justify-center gap-2 rounded-lg bg-krgold px-5 py-2.5 text-sm font-semibold text-krblack shadow-btn hover:bg-kryellow transition disabled:opacity-60">
            {busy && <Loader2 size={15} className="animate-spin" />} Update passcode
          </button>
          <p className="text-xs text-krmuted">There is no recovery — keep an exported backup somewhere safe.</p>
        </form>

        {/* Auto-lock */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-krtext">Auto-lock after inactivity</label>
          <p className="text-xs text-krmuted">Automatically lock the app when you've been idle.</p>
          <select value={autoLock} onChange={(e) => onAutoLockChange(Number(e.target.value))} className={inputCls}>
            {AUTOLOCK_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-krcard text-krtext">{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
