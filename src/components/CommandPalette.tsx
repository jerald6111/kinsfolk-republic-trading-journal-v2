import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, LayoutDashboard, FileText, BarChart3, Calculator, BookOpen,
  Target, Activity, Image, Wallet, Settings, Plus, Lock, Download, CornerDownLeft,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'
import { exportData } from '../utils/storage'

type Cmd = { id: string; label: string; hint?: string; icon: React.ReactNode; run: () => void }

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const navigate = useNavigate()
  const { lock } = useAuth()
  const { toast } = useToast()

  // Toggle on ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    const openEvt = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('kr:open-palette', openEvt)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('kr:open-palette', openEvt)
    }
  }, [])

  useEffect(() => {
    if (open) { setQuery(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 20) }
  }, [open])

  const commands: Cmd[] = useMemo(() => {
    const go = (to: string) => () => { navigate(to); setOpen(false) }
    return [
      { id: 'new', label: 'New Trade', hint: 'Add a journal entry', icon: <Plus size={16} />, run: go('/journal/entries') },
      { id: 'dash', label: 'Dashboard', icon: <LayoutDashboard size={16} />, run: go('/journal') },
      { id: 'entries', label: 'Entries', icon: <FileText size={16} />, run: go('/journal/entries') },
      { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} />, run: go('/journal/analytics') },
      { id: 'calc', label: 'Position Calculator', icon: <Calculator size={16} />, run: go('/calculator') },
      { id: 'playbook', label: 'Playbook', icon: <BookOpen size={16} />, run: go('/playbook') },
      { id: 'vision', label: 'Vision Board', icon: <Target size={16} />, run: go('/vision') },
      { id: 'market', label: 'Market Data', icon: <Activity size={16} />, run: go('/data-market') },
      { id: 'snaps', label: 'Snapshots', icon: <Image size={16} />, run: go('/snapshots') },
      { id: 'wallet', label: 'Wallet', icon: <Wallet size={16} />, run: go('/wallet') },
      { id: 'settings', label: 'Settings', icon: <Settings size={16} />, run: go('/settings') },
      { id: 'backup', label: 'Back up now', hint: 'Export encrypted journal', icon: <Download size={16} />, run: () => { exportData(); setOpen(false); toast('Backup exported') } },
      { id: 'lock', label: 'Lock app', icon: <Lock size={16} />, run: () => { setOpen(false); lock() } },
    ]
  }, [navigate, lock, toast])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => c.label.toLowerCase().includes(q) || c.hint?.toLowerCase().includes(q))
  }, [query, commands])

  useEffect(() => { setActive(0) }, [query])

  if (!open) return null

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); filtered[active]?.run() }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[12vh] px-4" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-xl border border-krborder bg-krcard shadow-card overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-krborder px-4">
          <Search size={17} className="text-krmuted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search actions & pages…"
            className="flex-1 bg-transparent py-3.5 text-sm text-krtext placeholder:text-krmuted focus:outline-none"
          />
          <span className="hidden sm:block text-[10px] text-krmuted border border-krborder rounded px-1.5 py-0.5">ESC</span>
        </div>
        <div className="max-h-80 overflow-y-auto custom-scrollbar py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-krmuted">No matches</p>
          ) : (
            filtered.map((c, i) => (
              <button
                key={c.id}
                onMouseEnter={() => setActive(i)}
                onClick={() => c.run()}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                  i === active ? 'bg-krgold/15 text-krwhite' : 'text-krtext hover:bg-krpanel'
                }`}
              >
                <span className="text-krgold">{c.icon}</span>
                <span className="flex-1">{c.label}</span>
                {c.hint && <span className="text-xs text-krmuted">{c.hint}</span>}
                {i === active && <CornerDownLeft size={14} className="text-krmuted" />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
