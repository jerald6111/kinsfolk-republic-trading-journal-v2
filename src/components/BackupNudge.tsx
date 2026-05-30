import React, { useState } from 'react'
import { ShieldAlert, Download, X } from 'lucide-react'
import { daysSinceBackup, exportData } from '../utils/storage'

const DISMISS_KEY = 'kr_backup_nudge_dismissed'
const STALE_DAYS = 14

export default function BackupNudge() {
  const days = daysSinceBackup()
  const dismissedAt = Number(sessionStorage.getItem(DISMISS_KEY) || 0)
  const shouldShow = (days === null || days >= STALE_DAYS) && !dismissedAt

  const [open, setOpen] = useState(shouldShow)
  if (!open) return null

  const handleBackup = () => {
    exportData()
    setOpen(false)
  }
  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setOpen(false)
  }

  return (
    <div className="mx-4 md:mx-6 mt-4 flex items-center gap-3 rounded-lg border border-krgold/30 bg-krgold/5 px-4 py-3">
      <span className="text-krgold shrink-0"><ShieldAlert size={18} /></span>
      <p className="text-sm text-krtext flex-1">
        {days === null
          ? "You haven't backed up your journal yet. Since the passcode can't be recovered, keep an export somewhere safe."
          : `It's been ${days} days since your last backup. Export a fresh copy to stay safe.`}
      </p>
      <button
        onClick={handleBackup}
        className="shine inline-flex items-center gap-1.5 rounded-lg bg-krgold px-3.5 py-1.5 text-xs font-semibold text-krblack shadow-btn hover:bg-kryellow transition shrink-0"
      >
        <Download size={14} /> Back up now
      </button>
      <button onClick={dismiss} className="text-krmuted hover:text-krwhite shrink-0" aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  )
}
