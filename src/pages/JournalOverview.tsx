import React from 'react'
import { Link } from 'react-router-dom'
import { loadData } from '../utils/storage'
import { ArrowRight } from 'lucide-react'

export default function JournalOverview() {
  const data = loadData()
  const journal = data.journal || []
  
  const totalTrades = journal.length
  const wins = journal.filter(j => j.pnlAmount > 0).length
  const losses = journal.filter(j => j.pnlAmount < 0).length
  const winRate = totalTrades ? Math.round((wins / totalTrades) * 100) : 0
  // Total PnL = sum of (pnlAmount - fee) for each trade
  const totalPnl = journal.reduce((s, j) => s + (j.pnlAmount || 0) - (j.fee || 0), 0)
  
  // Recent entries (last 5)
  const recentEntries = [...journal].reverse().slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-krblack to-gray-950 text-krtext relative overflow-hidden">
      {/* Animated gradient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-krgold/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-kryellow/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📓</span>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">
              Trading Journal
            </h1>
          </div>
          <p className="text-krmuted text-sm md:text-base ml-14">
            Your complete trading record and performance analytics
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5">
            <div className="text-krmuted text-sm mb-1">Total Trades</div>
            <div className="text-3xl font-bold text-krgold">{totalTrades}</div>
          </div>
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5">
            <div className="text-krmuted text-sm mb-1">Win Rate</div>
            <div className="text-3xl font-bold text-green-400">{winRate}%</div>
            <div className="text-xs text-krmuted mt-1">{wins}W / {losses}L</div>
          </div>
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5">
            <div className="text-krmuted text-sm mb-1">Total PnL</div>
            <div className={`text-3xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${totalPnl.toFixed(2)}
            </div>
          </div>
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5">
            <div className="text-krmuted text-sm mb-1">Active Positions</div>
            <div className="text-3xl font-bold text-krtext">
              {journal.filter(j => !j.exitPrice || j.exitPrice === 0).length}
            </div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Trade Analytics Section */}
          <Link 
            to="/journal/analytics"
            className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📊</span>
                <div>
                  <h2 className="text-lg font-semibold group-hover:text-krgold transition-colors">Trade Analytics</h2>
                  <p className="text-xs text-krmuted">Performance metrics & insights</p>
                </div>
              </div>
              <ArrowRight className="text-krmuted group-hover:text-krgold transition-colors" size={20} />
            </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-krblack/30 rounded-lg p-3">
              <div className="text-xs text-krmuted">Avg Win</div>
              <div className="text-base font-semibold text-green-400">
                ${wins > 0 ? (journal.filter(j => j.pnlAmount > 0).reduce((s, j) => s + j.pnlAmount - (j.fee || 0), 0) / wins).toFixed(2) : '0.00'}
              </div>
            </div>
            <div className="bg-krblack/30 rounded-lg p-3">
              <div className="text-xs text-krmuted">Avg Loss</div>
              <div className="text-base font-semibold text-red-400">
                ${losses > 0 ? (journal.filter(j => j.pnlAmount < 0).reduce((s, j) => s + j.pnlAmount - (j.fee || 0), 0) / losses).toFixed(2) : '0.00'}
              </div>
            </div>
            <div className="bg-krblack/30 rounded-lg p-3">
              <div className="text-xs text-krmuted">Risk/Reward</div>
              <div className="text-base font-semibold text-krgold">
                {wins > 0 && losses > 0 ? (Math.abs(journal.filter(j => j.pnlAmount > 0).reduce((s, j) => s + j.pnlAmount - (j.fee || 0), 0) / wins) / Math.abs(journal.filter(j => j.pnlAmount < 0).reduce((s, j) => s + j.pnlAmount - (j.fee || 0), 0) / losses)).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>
        </Link>

        {/* Recent Entries Section */}
        <Link 
          to="/journal/entries"
          className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📝</span>
              <div>
                <h2 className="text-lg font-semibold group-hover:text-krgold transition-colors">Recent Entries</h2>
                <p className="text-xs text-krmuted">Your latest trade logs</p>
              </div>
            </div>
            <ArrowRight className="text-krmuted group-hover:text-krgold transition-colors" size={20} />
          </div>
          <div className="space-y-2">
            {recentEntries.length === 0 ? (
              <div className="text-center py-4 text-krmuted">No entries yet</div>
            ) : (
              recentEntries.slice(0, 3).map(entry => {
                const netPnl = (entry.pnlAmount || 0) - (entry.fee || 0)
                return (
                  <div key={entry.id} className="bg-krblack/30 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{entry.ticker}</div>
                      <div className="text-xs text-krmuted">{entry.date}</div>
                    </div>
                    <div className={`font-semibold ${netPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${netPnl.toFixed(2)}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Link>
      </div>

      {/* Insights Section */}
      <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">💡</span>
          <h2 className="text-lg font-semibold">Quick Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-krblack/30 rounded-lg p-4">
            <div className="text-sm text-krmuted mb-2">Most Traded Pair</div>
            <div className="text-lg font-semibold">
              {journal.length > 0 
                ? Object.entries(journal.reduce((acc: any, j) => {acc[j.ticker] = (acc[j.ticker] || 0) + 1; return acc}, {}))
                    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'
                : 'N/A'}
            </div>
          </div>
          <div className="bg-krblack/30 rounded-lg p-4">
            <div className="text-sm text-krmuted mb-2">Best Performing Day</div>
            <div className="text-lg font-semibold text-green-400">
              $
              {journal.length > 0
                ? (Object.entries(journal.reduce((acc: any, j) => {
                    const date = j.date?.split('T')[0] || j.date
                    // Subtract fee from pnlAmount for each trade
                    acc[date] = (acc[date] || 0) + (j.pnlAmount || 0) - (j.fee || 0)
                    return acc
                  }, {}))
                  .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[1] as number || 0).toFixed(2)
                : '0.00'}
            </div>
          </div>
          <div className="bg-krblack/30 rounded-lg p-4">
            <div className="text-sm text-krmuted mb-2">Current Streak</div>
            <div className="text-lg font-semibold text-krgold">
              {(() => {
                let streak = 0
                for (let i = journal.length - 1; i >= 0; i--) {
                  const netPnl = (journal[i].pnlAmount || 0) - (journal[i].fee || 0)
                  if (netPnl > 0) streak++
                  else break
                }
                return `${streak} ${streak === 1 ? 'Win' : 'Wins'}`
              })()}
            </div>
          </div>
        </div>
      </div>
      </div>
      </div>
    </div>
  )
}
