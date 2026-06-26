import React, { useState } from 'react'
import { CheckCircle2, AlertTriangle, X } from 'lucide-react'
import { authRedirect } from '../lib/authRedirect'

/** Shows a confirmation/error banner after a Supabase auth email link is clicked. */
export default function AuthNotice() {
  const isConfirmed = authRedirect.type === 'signup' || authRedirect.type === 'email'
  const isError = !!authRedirect.error
  const [open, setOpen] = useState(isConfirmed || isError)
  if (!open) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-4 pointer-events-none">
      <div
        className={`pointer-events-auto flex items-start gap-3 w-full max-w-xl rounded-xl border px-4 py-3 shadow-card backdrop-blur-xl ${
          isError
            ? 'border-krdanger/40 bg-krdanger/15 text-krdanger'
            : 'border-krsuccess/40 bg-krsuccess/15 text-krsuccess'
        }`}
      >
        <span className="mt-0.5 flex-shrink-0">
          {isError ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
        </span>
        <div className="flex-1 text-sm leading-relaxed">
          {isError ? (
            <>
              <strong className="text-krwhite">This link is invalid or has expired.</strong>{' '}
              <span className="text-krmuted">{authRedirect.errorDescription || 'Please request a new confirmation email and try again.'}</span>
            </>
          ) : (
            <>
              <strong className="text-krwhite">Your email is confirmed — your account is active.</strong>{' '}
              <span className="text-krmuted">You can now sign in to Cloud Sync from any device.</span>
            </>
          )}
        </div>
        <button onClick={() => setOpen(false)} className="flex-shrink-0 text-krmuted hover:text-krwhite transition-colors" aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
