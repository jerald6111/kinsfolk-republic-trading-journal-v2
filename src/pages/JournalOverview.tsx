import React from 'react'
import { Link } from 'react-router-dom'
import { loadData } from '../utils/storage'
import { BookOpen, TrendingUp, FileText, BarChart3, ArrowRight } from 'lucide-react'

export default function JournalOverview() {
  const data = loadData()
  const journal = data.journal || []
  
  const totalTrades = journal.length
  const wins = journal.filter(j => j.pnlAmount > 0).length
  const losses = journal.filter(j => j.pnlAmount < 0).length
  const winRate = totalTrades ? Math.round((wins / totalTrades) * 100) : 0
  const totalPnl = journal.reduce((s, j) => s + (j.pnlAmount || 0), 0)
  
  // Recent entries (last 5)
  const recentEntries = [...journal].reverse().slice(0, 5)

  return (
    <div className="min-h-screen bg-krcard/30 backdrop-blur-sm text-krtext p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="text-krgold" size={32} />
          <h1 className="text-3xl font-bold">Trading Journal</h1>
        </div>
        <p className="text-gray-400">Your complete trading record and performance analytics</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
          <div className="text-gray-400 text-sm mb-1">Total Trades</div>
          <div className="text-3xl font-bold text-krgold">{totalTrades}</div>
        </div>
        <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
          <div className="text-gray-400 text-sm mb-1">Win Rate</div>
          <div className="text-3xl font-bold text-green-500">{winRate}%</div>
          <div className="text-xs text-gray-500 mt-1">{wins}W / {losses}L</div>
        </div>
        <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
          <div className="text-gray-400 text-sm mb-1">Total PnL</div>
          <div className={`text-3xl font-bold ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${totalPnl.toFixed(2)}
          </div>
        </div>
        <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
          <div className="text-gray-400 text-sm mb-1">Active Positions</div>
          <div className="text-3xl font-bold text-krtext">
            {journal.filter(j => !j.exitPrice || j.exitPrice === 0).length}
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Trade Analytics Section */}
        <Link 
          to="/journal/analytics"
          className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6 hover:border-krgold/50 transition-all group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-krgold/10 rounded-lg">
                <BarChart3 className="text-krgold" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold group-hover:text-krgold transition-colors">Trade Analytics</h2>
                <p className="text-sm text-gray-400">Performance metrics & insights</p>
              </div>
            </div>
            <ArrowRight className="text-gray-400 group-hover:text-krgold transition-colors" size={20} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-krblack/30 rounded-lg p-3">
              <div className="text-xs text-gray-400">Avg Win</div>
              <div className="text-lg font-semibold text-green-500">
                ${wins > 0 ? (journal.filter(j => j.pnlAmount > 0).reduce((s, j) => s + j.pnlAmount, 0) / wins).toFixed(2) : '0.00'}
              </div>
            </div>
            <div className="bg-krblack/30 rounded-lg p-3">
              <div className="text-xs text-gray-400">Avg Loss</div>
              <div className="text-lg font-semibold text-red-500">
                ${losses > 0 ? (journal.filter(j => j.pnlAmount < 0).reduce((s, j) => s + j.pnlAmount, 0) / losses).toFixed(2) : '0.00'}
              </div>
            </div>
            <div className="bg-krblack/30 rounded-lg p-3">
              <div className="text-xs text-gray-400">Risk/Reward</div>
              <div className="text-lg font-semibold text-krgold">
                {wins > 0 && losses > 0 ? (Math.abs(journal.filter(j => j.pnlAmount > 0).reduce((s, j) => s + j.pnlAmount, 0) / wins) / Math.abs(journal.filter(j => j.pnlAmount < 0).reduce((s, j) => s + j.pnlAmount, 0) / losses)).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>
        </Link>

        {/* Recent Entries Section */}
        <Link 
          to="/journal/entries"
          className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6 hover:border-krgold/50 transition-all group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-krgold/10 rounded-lg">
                <FileText className="text-krgold" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold group-hover:text-krgold transition-colors">Recent Entries</h2>
                <p className="text-sm text-gray-400">Your latest trade logs</p>
              </div>
            </div>
            <ArrowRight className="text-gray-400 group-hover:text-krgold transition-colors" size={20} />
          </div>
          <div className="space-y-2">
            {recentEntries.length === 0 ? (
              <div className="text-center py-4 text-gray-400">No entries yet</div>
            ) : (
              recentEntries.slice(0, 3).map(entry => (
                <div key={entry.id} className="bg-krblack/30 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{entry.ticker}</div>
                    <div className="text-xs text-gray-400">{entry.date}</div>
                  </div>
                  <div className={`font-semibold ${entry.pnlAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${entry.pnlAmount?.toFixed(2) || '0.00'}
                  </div>
                </div>
              ))
            )}
          </div>
        </Link>
      </div>

      {/* Insights Section */}
      <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-krgold" size={24} />
          <h2 className="text-xl font-semibold">Quick Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-krblack/30 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Most Traded Pair</div>
            <div className="text-lg font-semibold">
              {journal.length > 0 
                ? Object.entries(journal.reduce((acc: any, j) => {acc[j.ticker] = (acc[j.ticker] || 0) + 1; return acc}, {}))
                    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'
                : 'N/A'}
            </div>
          </div>
          <div className="bg-krblack/30 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Best Performing Day</div>
            <div className="text-lg font-semibold text-green-500">
              $
              {journal.length > 0
                ? (Object.entries(journal.reduce((acc: any, j) => {
                    const date = j.date?.split('T')[0] || j.date
                    acc[date] = (acc[date] || 0) + (j.pnlAmount || 0)
                    return acc
                  }, {}))
                  .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[1] as number || 0).toFixed(2)
                : '0.00'}
            </div>
          </div>
          <div className="bg-krblack/30 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Current Streak</div>
            <div className="text-lg font-semibold text-krgold">
              {(() => {
                let streak = 0
                for (let i = journal.length - 1; i >= 0; i--) {
                  if (journal[i].pnlAmount > 0) streak++
                  else break
                }
                return `${streak} ${streak === 1 ? 'Win' : 'Wins'}`
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
