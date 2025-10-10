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
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatBox title="Total Trades" value={totalTrades} />
        <StatBox title="Win Rate" value={`${winRate}%`} />
        <StatBox title="Total PnL" value={`$${totalPnl.toFixed(2)}`} />
        <StatBox title="Current Portfolio" value={`$${(data.wallet.reduce((s,w)=> s + (w.type==='deposit'? w.amount : -w.amount),0)||0).toFixed(2)}`} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-krgray/10 rounded-xl p-4">Placeholder chart / PnL over time</div>
        <div className="bg-krgray/10 rounded-xl p-4">Recent trades list (placeholder)</div>
      </div>
    </div>
  )
}
