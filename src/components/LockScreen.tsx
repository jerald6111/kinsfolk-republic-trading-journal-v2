import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, ShieldCheck, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LockScreen() {
  const { status, createPasscode, unlock } = useAuth()
  const isSetup = status === 'setup'

  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isSetup) {
      if (pin.length < 4) return setError('Passcode must be at least 4 characters.')
      if (pin !== confirm) return setError('Passcodes do not match.')
      try {
        setBusy(true)
        await createPasscode(pin)
      } catch {
        setError('Could not create the passcode. Please try again.')
        setBusy(false)
      }
      return
    }

    try {
      setBusy(true)
      await unlock(pin)
    } catch {
      setError('Incorrect passcode.')
      setPin('')
      setBusy(false)
    }
  }

  return (
    <div className="hero-glow relative min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-krblack to-krbg">
      <div className="grid-bg" />
      <div className="relative w-full max-w-sm">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-krmuted hover:text-krwhite transition mb-8">
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="rounded-2xl border border-krborder bg-krcard shadow-card p-8">
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

          <form onSubmit={submit} className="space-y-4">
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
                placeholder="Passcode"
                className="w-full rounded-lg border border-krborder bg-krpanel px-4 py-3 pr-11 text-krwhite tnum tracking-widest placeholder:tracking-normal placeholder:text-krmuted focus:border-krgold/60 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-krmuted hover:text-krwhite"
                tabIndex={-1}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {isSetup && (
              <input
                type={show ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm passcode"
                className="w-full rounded-lg border border-krborder bg-krpanel px-4 py-3 text-krwhite tnum tracking-widest placeholder:tracking-normal placeholder:text-krmuted focus:border-krgold/60 focus:outline-none transition"
              />
            )}

            {error && <p className="text-sm text-krdanger">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="shine w-full rounded-lg bg-krgold px-6 py-3 text-sm font-semibold text-krblack shadow-btn hover:bg-kryellow transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              {isSetup ? 'Create passcode & enter' : 'Unlock'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-krmuted">
          Private · encrypted on this device · no account
        </p>
      </div>
    </div>
  )
}
