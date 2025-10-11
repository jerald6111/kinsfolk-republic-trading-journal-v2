import React from 'react'
import StatBox from '../components/StatBox'
import { loadData } from '../utils/storage'

export default function Dashboard(){
  const data = loadData()
  const totalTrades = data.journal.length
  const wins = data.journal.filter(j => j.pnlAmount>0).length
  const winRate = totalTrades? Math.round((wins/totalTrades)*100):0
  const totalPnl = data.journal.reduce((s, j) => s + (j.pnlAmount||0), 0)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-krblack to-gray-950 text-krtext p-4 md:p-6 relative overflow-hidden">
      {/* Animated gradient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-krgold/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-kryellow/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📈</span>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
          <p className="text-krmuted text-sm md:text-base ml-14">
            Your trading performance at a glance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatBox title="Total Trades" value={totalTrades} />
          <StatBox title="Win Rate" value={`${winRate}%`} />
          <StatBox title="Total PnL" value={`$${totalPnl.toFixed(2)}`} />
          <StatBox title="Current Portfolio" value={`$${(data.wallet.reduce((s,w)=> s + (w.type==='deposit'? w.amount : -w.amount),0)||0).toFixed(2)}`} />
        </div>

        {/* Charts & Recent Activity */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📊</span>
              <h2 className="text-lg font-semibold">PnL Over Time</h2>
            </div>
            <div className="text-krmuted text-center py-8">
              Chart visualization coming soon
            </div>
          </div>
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📝</span>
              <h2 className="text-lg font-semibold">Recent Trades</h2>
            </div>
            <div className="text-krmuted text-center py-8">
              Recent trades list coming soon
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
