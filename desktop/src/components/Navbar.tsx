import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, ChevronDown, Settings, Download } from 'lucide-react'

const nav = [
  { to: '/vision', label: 'Vision' },
  { 
    to: '/news-and-data', 
    label: 'News & Data',
    dropdown: [
      { to: '/data-market', label: 'Data Market' },
      { to: '/news', label: 'Market News' }
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
                      <div className="bg-krcard border border-krborder rounded-xl shadow-lg min-w-[160px] overflow-hidden backdrop-blur-sm">
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
          {/* Download Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => handleMouseEnter('/download')}
            onMouseLeave={handleMouseLeave}
          >
            <button className="p-2 rounded-md bg-krgold/20 hover:bg-krgold/30 transition-colors border border-krgold/30 flex items-center gap-1" title="Download">
              <Download size={20} className="text-krgold" />
              <ChevronDown size={12} className={`text-krgold transition-transform ${hoveredDropdown === '/download' ? 'rotate-180' : ''}`} />
            </button>
            {hoveredDropdown === '/download' && (
              <div className="absolute top-full right-0 pt-2 -mt-2 z-50">
                <div className="bg-krcard border border-krborder rounded-xl shadow-lg min-w-[280px] overflow-hidden backdrop-blur-sm">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Download size={16} className="text-krgold" />
                      <span className="text-sm font-semibold text-krgold">Desktop App</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      Want to use our app offline? No problem! Download our Windows desktop app for enhanced security and performance.
                    </p>
                    <Link
                      to="/download"
                      className="w-full bg-gradient-to-r from-krgold to-kryellow text-krblack px-3 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-krgold/30 transition-all text-sm flex items-center justify-center gap-1"
                    >
                      <Download size={14} />
                      Download for Windows
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          
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
