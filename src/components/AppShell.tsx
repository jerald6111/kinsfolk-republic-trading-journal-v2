import React, { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'
import FloatingSupportButton from './FloatingSupportButton'
import AIChatbot from './AIChatbot'
import BackupNudge from './BackupNudge'
import CommandPalette from './CommandPalette'

export default function AppShell() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-krblack to-krbg">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 shrink-0 border-r border-krborder">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative w-64 max-w-[80%] border-r border-krborder bg-krbg">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 z-10 p-1.5 rounded-md text-krmuted hover:text-krwhite hover:bg-krcard"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-krborder bg-krblack/70 backdrop-blur shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="p-2 -ml-2 rounded-md text-krwhite hover:bg-krcard"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <Link to="/journal" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-krgold to-kryellow flex items-center justify-center text-krblack font-extrabold text-xs">KR</div>
            <span className="text-sm font-bold tracking-tight">Kinsfolk Republic</span>
          </Link>
          <div className="w-9" />
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-custom">
          <BackupNudge />
          <Outlet />
        </main>
      </div>

      <CommandPalette />
      <FloatingSupportButton />
      <AIChatbot />
    </div>
  )
}
