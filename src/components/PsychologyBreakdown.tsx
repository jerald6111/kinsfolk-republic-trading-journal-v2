import React from 'react'
import { Brain } from 'lucide-react'
import { useCurrency } from '../context/CurrencyContext'
import { PSYCH_TAGS } from '../types'

/** Win-rate & PnL grouped by trading-psychology tag. */
export default function PsychologyBreakdown({ journal }: { journal: any[] }) {
  const { formatAmount } = useCurrency()

  const rows = PSYCH_TAGS.map((tag) => {
    const trades = journal.filter((j) => Array.isArray(j.tags) && j.tags.includes(tag))
    const count = trades.length
    const wins = trades.filter((j) => ((j.pnlAmount || 0) - (j.fee || 0)) > 0).length
    const pnl = trades.reduce((s, j) => s + (j.pnlAmount || 0) - (j.fee || 0), 0)
    const winRate = count ? Math.round((wins / count) * 100) : 0
    return { tag, count, wins, winRate, pnl }
  })
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)

  return (
    <div className="bg-krcard shadow-soft rounded-xl border border-krborder p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-krborder bg-krpanel text-krgold"><Brain size={18} /></span>
        <div>
          <h2 className="text-xl font-semibold text-krtext">Trading Psychology</h2>
          <p className="text-xs text-krmuted">Win rate &amp; P&amp;L by the tags you assign to trades</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-krmuted py-6 text-center">
          Tag your trades (FOMO, Plan followed, Revenge trade…) in the Entries page to see which mindsets actually make you money.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.14em] text-krmuted border-b border-krborder">
                <th className="pb-3 font-normal">Tag</th>
                <th className="pb-3 font-normal text-right">Trades</th>
                <th className="pb-3 font-normal text-right">Win rate</th>
                <th className="pb-3 font-normal text-right">Net P&amp;L</th>
              </tr>
            </thead>
            <tbody className="tnum">
              {rows.map((r) => (
                <tr key={r.tag} className="border-b border-krborder/50">
                  <td className="py-3 font-medium text-krtext">{r.tag}</td>
                  <td className="py-3 text-right text-krmuted">{r.count}</td>
                  <td className={`py-3 text-right font-semibold ${r.winRate >= 50 ? 'text-krsuccess' : 'text-krdanger'}`}>{r.winRate}%</td>
                  <td className={`py-3 text-right font-semibold ${r.pnl >= 0 ? 'text-krsuccess' : 'text-krdanger'}`}>
                    {r.pnl >= 0 ? '+' : ''}{formatAmount(r.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
