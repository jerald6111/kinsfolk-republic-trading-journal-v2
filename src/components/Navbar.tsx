import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'

const nav = [
  { to: '/', label: 'Dashboard' },
  { to: '/vision', label: 'Vision' },
  { to: '/journal', label: 'Journal' },
  { to: '/playbook', label: 'Playbook' },
  { to: '/charts', label: 'Snapshots' },
  { to: '/wallet', label: 'Wallet' },
]

export default function Navbar(){
  const loc = useLocation()
  return (
    <header className="w-full bg-krblack border-b border-krgray">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-krgold to-kryellow flex items-center justify-center text-krblack font-bold">KR</div>
          <div className="text-lg font-bold">Kinsfolk Republic Trading Journal</div>
        </Link>
        <nav className="hidden md:flex gap-4 items-center">
          {nav.map(n => (
            <Link key={n.to} to={n.to} className={`px-3 py-2 rounded-md ${loc.pathname===n.to? 'bg-krgold text-krblack' : 'text-krwhite hover:bg-krgray/50'}`}>
              {n.label}
            </Link>
          ))}
          <Link to="/settings" className="px-3 py-2 rounded-md text-sm bg-krgray/60">Data</Link>
        </nav>
        <div className="md:hidden text-krwhite">
          <Menu />
        </div>
      </div>
    </header>
  )
}
