import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, ChevronDown, Settings } from 'lucide-react'

const nav = [
  { to: '/vision', label: 'Vision' },
  { 
    to: '/news', 
    label: 'News and Data',
    dropdown: [
      { to: '/news', label: 'News' },
      { to: '/data-market', label: 'Data Market' }
    ]
  },
  { 
    to: '/journal', 
    label: 'Journal',
    dropdown: [
      { to: '/journal/entries', label: 'Entries' },
      { to: '/journal/analytics', label: 'Trade Analytics' }
    ]
  },
  { 
    to: '/playbook', 
    label: 'Strategy',
    dropdown: [
      { to: '/playbook', label: 'Playbook' }
    ]
  },
  { 
    to: '/snapshots', 
    label: 'Snapshots',
    dropdown: [
      { to: '/snapshots/charts', label: 'Charts' },
      { to: '/snapshots/pnl', label: 'PNL Overview' }
    ]
  },
  { to: '/wallet', label: 'Wallet' },
]

export default function Navbar(){
  const loc = useLocation()
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null)
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = (path: string) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setHoveredDropdown(path)
  }

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setHoveredDropdown(null)
    }, 200) // 200ms delay before closing
    setTimeoutId(id)
  }
  
  return (
    <header className="w-full bg-krblack border-b border-krgray">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-krgold to-kryellow flex items-center justify-center text-krblack font-bold">KR</div>
          <div className="text-lg font-bold">Kinsfolk Republic</div>
        </Link>
        <nav className="hidden md:flex gap-4 items-center">
          {nav.map(n => {
            if (n.dropdown) {
              // Check if any dropdown item or the parent path matches
              const isActive = loc.pathname === n.to || n.dropdown.some(item => loc.pathname === item.to) || loc.pathname.startsWith(n.to + '/')
              return (
                <div 
                  key={n.to}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(n.to)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link 
                    to={n.to} 
                    className={`px-3 py-2 rounded-md flex items-center gap-1 ${isActive ? 'bg-krgold text-krblack' : 'text-krwhite hover:bg-krgray/50'}`}
                  >
                    {n.label}
                    <ChevronDown size={16} className={`transition-transform ${hoveredDropdown === n.to ? 'rotate-180' : ''}`} />
                  </Link>
                  {hoveredDropdown === n.to && (
                    <div className="absolute top-full left-0 pt-2 -mt-2 z-50">
                      <div className="bg-krcard border border-krborder rounded-md shadow-lg min-w-[160px] overflow-hidden">
                        {n.dropdown.map(item => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="block px-4 py-2 text-krtext hover:bg-krgold/20 hover:text-krgold transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            }
            
            return (
              <Link key={n.to} to={n.to} className={`px-3 py-2 rounded-md ${loc.pathname===n.to? 'bg-krgold text-krblack' : 'text-krwhite hover:bg-krgray/50'}`}>
                {n.label}
              </Link>
            )
          })}
          <Link to="/settings" className="p-2 rounded-md bg-krgray/60 hover:bg-krgold/20 transition-colors" title="Settings">
            <Settings size={20} className="text-krwhite" />
          </Link>
        </nav>
        <div className="md:hidden text-krwhite">
          <Menu />
        </div>
      </div>
    </header>
  )
}
