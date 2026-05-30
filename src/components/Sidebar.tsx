import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Target, FileText, BarChart3, BookOpen,
  Activity, Image, Wallet, Settings, Lock, Calculator, Search,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

type Item = { to: string; label: string; icon: React.ReactNode }
type Group = { heading: string; items: Item[] }

const GROUPS: Group[] = [
  {
    heading: 'Main',
    items: [
      { to: '/journal', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
      { to: '/vision', label: 'Vision Board', icon: <Target size={17} /> },
    ],
  },
  {
    heading: 'Trading',
    items: [
      { to: '/journal/entries', label: 'Entries', icon: <FileText size={17} /> },
      { to: '/journal/analytics', label: 'Analytics', icon: <BarChart3 size={17} /> },
      { to: '/calculator', label: 'Calculator', icon: <Calculator size={17} /> },
      { to: '/playbook', label: 'Playbook', icon: <BookOpen size={17} /> },
    ],
  },
  {
    heading: 'Markets',
    items: [
      { to: '/data-market', label: 'Market Data', icon: <Activity size={17} /> },
      { to: '/snapshots', label: 'Snapshots', icon: <Image size={17} /> },
    ],
  },
  {
    heading: 'Account',
    items: [
      { to: '/wallet', label: 'Wallet', icon: <Wallet size={17} /> },
      { to: '/settings', label: 'Settings', icon: <Settings size={17} /> },
    ],
  },
]

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const loc = useLocation()
  const { lock } = useAuth()

  const isActive = (to: string) =>
    loc.pathname === to || (to !== '/journal' && loc.pathname.startsWith(to + '/'))

  return (
    <div className="flex h-full flex-col bg-krpanel/60">
      <Link
        to="/journal"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-5 h-16 border-b border-krborder shrink-0"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-krgold to-kryellow flex items-center justify-center text-krblack font-extrabold shadow-btn">KR</div>
        <span className="text-[15px] font-bold tracking-tight text-krwhite">Kinsfolk Republic</span>
      </Link>

      <div className="px-3 pt-4">
        <button
          onClick={() => window.dispatchEvent(new Event('kr:open-palette'))}
          className="flex w-full items-center gap-2.5 rounded-lg border border-krborder bg-krcard/60 px-3 py-2 text-sm text-krmuted hover:text-krwhite hover:border-krgold/40 transition-colors"
        >
          <Search size={15} /> Search
          <span className="ml-auto text-[10px] border border-krborder rounded px-1.5 py-0.5">⌘K</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-5 text-sm">
        {GROUPS.map((g) => (
          <div key={g.heading}>
            <div className="px-3 mb-2 text-[0.65rem] uppercase tracking-[0.16em] text-krmuted">{g.heading}</div>
            <div className="space-y-1">
              {g.items.map((it) => {
                const active = isActive(it.to)
                return (
                  <Link
                    key={it.to}
                    to={it.to}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                      active
                        ? 'bg-krgold text-krblack font-semibold'
                        : 'text-krmuted hover:bg-krcard hover:text-krwhite'
                    }`}
                  >
                    {it.icon}
                    {it.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-krborder shrink-0">
        <button
          onClick={() => { lock(); onNavigate?.() }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-krmuted hover:bg-krcard hover:text-krwhite transition-colors"
        >
          <Lock size={17} /> Lock
        </button>
      </div>
    </div>
  )
}
