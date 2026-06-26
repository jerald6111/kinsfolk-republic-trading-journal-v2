import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, ShieldCheck, Eye, EyeOff, ArrowLeft, Loader2, Cloud } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured, signIn, fetchCloudJournal, setAutoSync } from '../lib/cloudSync'
import type { AppData } from '../utils/storage'

type View = 'main' | 'cloudSignin' | 'cloudPasscode'

const inputCls =
  'w-full rounded-lg border border-krborder bg-krpanel px-4 py-3 text-krwhite tnum tracking-widest placeholder:tracking-normal placeholder:text-krmuted focus:border-krgold/60 focus:outline-none transition'

export default function LockScreen() {
  const { status, createPasscode, unlock } = useAuth()
  const isSetup = status === 'setup'

  const [view, setView] = useState<View>('main')
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Cloud sign-in fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pulled, setPulled] = useState<AppData | undefined>(undefined)
  const [cloudEmail, setCloudEmail] = useState('')

  const go = (v: View) => { setView(v); setError(''); setPin(''); setConfirm('') }

  // Passcode create / unlock
  const submitMain = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (isSetup) {
      if (pin.length < 4) return setError('Passcode must be at least 4 characters.')
      if (pin !== confirm) return setError('Passcodes do not match.')
      try { setBusy(true); await createPasscode(pin) }
      catch { setError('Could not create the passcode. Please try again.'); setBusy(false) }
      return
    }
    try { setBusy(true); await unlock(pin) }
    catch { setError('Incorrect passcode.'); setPin(''); setBusy(false) }
  }

  // Cloud sign-in → fetch journal → go set a device passcode
  const submitCloudSignin = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!email.trim() || !password) return setError('Enter your email and password.')
    try {
      setBusy(true)
      await signIn(email.trim(), password)
      const data = await fetchCloudJournal().catch(() => null)
      setPulled(data || undefined)
      setCloudEmail(email.trim())
      setPin(''); setConfirm(''); setPassword('')
      setView('cloudPasscode')
    } catch (err: any) {
      setError(err?.message || 'Incorrect email or password.')
    } finally { setBusy(false) }
  }

  // Set a passcode that encrypts the (cloud-pulled) journal on this device
  const submitCloudPasscode = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (pin.length < 4) return setError('Passcode must be at least 4 characters.')
    if (pin !== confirm) return setError('Passcodes do not match.')
    try {
      setBusy(true)
      await createPasscode(pin, pulled)
      setAutoSync(true)
      // status becomes 'unlocked' → the app renders with your synced data
    } catch {
      setError('Could not set the passcode. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="hero-glow relative min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-krblack to-krbg">
      <div className="grid-bg" />
      <div className="relative w-full max-w-sm">
        {view === 'main' ? (
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-krmuted hover:text-krwhite transition mb-8">
            <ArrowLeft size={14} /> Back to home
          </Link>
        ) : (
          <button onClick={() => go('main')} className="inline-flex items-center gap-2 text-xs text-krmuted hover:text-krwhite transition mb-8">
            <ArrowLeft size={14} /> Back
          </button>
        )}

        <div className="rounded-2xl border border-krborder bg-krcard shadow-card p-8">
          {/* ---- Main: create or unlock passcode ---- */}
          {view === 'main' && (
            <>
              <div className="flex flex-col items-center text-center mb-7">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-krborder bg-krpanel text-krgold mb-4">
                  {isSetup ? <ShieldCheck size={26} /> : <Lock size={24} />}
                </span>
                <h1 className="text-2xl font-extrabold tracking-tight text-krwhite">
                  {isSetup ? <>Create your <span className="text-krgold">passcode</span></> : <>Welcome <span className="text-krgold">back</span></>}
                </h1>
                <p className="mt-2 text-sm text-krmuted leading-relaxed">
                  {isSetup
                    ? 'This passcode encrypts your journal on this device. There is no recovery — keep it safe.'
                    : 'Enter your passcode to unlock your journal.'}
                </p>
              </div>

              <form onSubmit={submitMain} className="space-y-4">
                <div className="relative">
                  <input type={show ? 'text' : 'password'} value={pin} onChange={(e) => setPin(e.target.value)} autoFocus placeholder="Passcode" className={`${inputCls} pr-11`} />
                  <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-krmuted hover:text-krwhite" tabIndex={-1}>
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {isSetup && (
                  <input type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm passcode" className={inputCls} />
                )}
                {error && <p className="text-sm text-krdanger">{error}</p>}
                <button type="submit" disabled={busy} className="shine w-full rounded-lg bg-krgold px-6 py-3 text-sm font-semibold text-krblack shadow-btn hover:bg-kryellow transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {busy && <Loader2 size={16} className="animate-spin" />}
                  {isSetup ? 'Create passcode & enter' : 'Unlock'}
                </button>
              </form>

              {isSupabaseConfigured && (
                <>
                  <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-krmuted">
                    <span className="h-px flex-1 bg-krborder" /> or <span className="h-px flex-1 bg-krborder" />
                  </div>
                  <button onClick={() => go('cloudSignin')} className="w-full rounded-lg border border-krborder bg-krpanel px-6 py-3 text-sm font-semibold text-krwhite hover:border-krgold/50 transition flex items-center justify-center gap-2">
                    <Cloud size={16} className="text-krgold" /> Sign in to your account
                  </button>
                  <p className="mt-2.5 text-center text-xs text-krmuted">
                    {isSetup ? 'New device? Bring your journal over from the cloud.' : 'Use your cloud account on this device.'}
                  </p>
                </>
              )}
            </>
          )}

          {/* ---- Cloud sign-in ---- */}
          {view === 'cloudSignin' && (
            <>
              <div className="flex flex-col items-center text-center mb-7">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-krborder bg-krpanel text-krgold mb-4"><Cloud size={26} /></span>
                <h1 className="text-2xl font-extrabold tracking-tight text-krwhite">Sign in to your <span className="text-krgold">account</span></h1>
                <p className="mt-2 text-sm text-krmuted leading-relaxed">Bring your journal to this device. You'll set a passcode next to keep it encrypted here.</p>
              </div>
              <form onSubmit={submitCloudSignin} className="space-y-4">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus placeholder="you@email.com" autoComplete="email" className={`${inputCls} tracking-normal`} />
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" className={`${inputCls} tracking-normal pr-11`} />
                  <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-krmuted hover:text-krwhite" tabIndex={-1}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {error && <p className="text-sm text-krdanger">{error}</p>}
                <button type="submit" disabled={busy} className="shine w-full rounded-lg bg-krgold px-6 py-3 text-sm font-semibold text-krblack shadow-btn hover:bg-kryellow transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {busy && <Loader2 size={16} className="animate-spin" />} Sign in
                </button>
              </form>
            </>
          )}

          {/* ---- Set a device passcode after cloud sign-in ---- */}
          {view === 'cloudPasscode' && (
            <>
              <div className="flex flex-col items-center text-center mb-7">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-krborder bg-krpanel text-krgold mb-4"><ShieldCheck size={26} /></span>
                <h1 className="text-2xl font-extrabold tracking-tight text-krwhite">Secure this <span className="text-krgold">device</span></h1>
                <p className="mt-2 text-sm text-krmuted leading-relaxed">
                  Signed in as <span className="text-krwhite">{cloudEmail}</span>. Set a passcode to encrypt your journal on this device.
                  {pulled ? ' Your cloud journal is ready to load.' : ''}
                </p>
              </div>
              <form onSubmit={submitCloudPasscode} className="space-y-4">
                <div className="relative">
                  <input type={show ? 'text' : 'password'} value={pin} onChange={(e) => setPin(e.target.value)} autoFocus placeholder="New passcode" className={`${inputCls} pr-11`} />
                  <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-krmuted hover:text-krwhite" tabIndex={-1}>
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <input type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm passcode" className={inputCls} />
                {error && <p className="text-sm text-krdanger">{error}</p>}
                <button type="submit" disabled={busy} className="shine w-full rounded-lg bg-krgold px-6 py-3 text-sm font-semibold text-krblack shadow-btn hover:bg-kryellow transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {busy && <Loader2 size={16} className="animate-spin" />} Set passcode & enter
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-krmuted">
          Private · encrypted on this device · no account required
        </p>
      </div>
    </div>
  )
}
