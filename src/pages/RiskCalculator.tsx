import React, { useState } from 'react'
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react'
import { Reveal } from '../components/Motion'
import { useCurrency } from '../context/CurrencyContext'

export default function RiskCalculator() {
  const { formatAmount } = useCurrency()

  const [account, setAccount] = useState('10000')
  const [riskPct, setRiskPct] = useState('1')
  const [entry, setEntry] = useState('')
  const [stop, setStop] = useState('')
  const [target, setTarget] = useState('')

  const n = (v: string) => {
    const x = parseFloat(v)
    return Number.isFinite(x) ? x : 0
  }

  const acct = n(account)
  const risk = n(riskPct)
  const entryP = n(entry)
  const stopP = n(stop)
  const targetP = n(target)

  const riskAmount = acct * (risk / 100)
  const perUnitRisk = Math.abs(entryP - stopP)
  const valid = entryP > 0 && stopP > 0 && perUnitRisk > 0 && acct > 0 && risk > 0

  const positionUnits = valid ? riskAmount / perUnitRisk : 0
  const positionValue = positionUnits * entryP
  const isLong = entryP > stopP
  const stopDistPct = entryP > 0 ? (perUnitRisk / entryP) * 100 : 0

  const hasTarget = targetP > 0 && valid
  const rewardPerUnit = hasTarget ? Math.abs(targetP - entryP) : 0
  const rr = hasTarget && perUnitRisk > 0 ? rewardPerUnit / perUnitRisk : 0
  const potentialProfit = positionUnits * rewardPerUnit

  const inputCls =
    'w-full px-4 py-3 border border-krborder rounded-xl bg-krblack/30 text-krtext tnum focus:ring-2 focus:ring-krgold/20 focus:border-krgold focus:outline-none transition-all'
  const labelCls = 'block text-xs uppercase tracking-[0.14em] text-krmuted mb-2'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-krblack to-gray-950 text-krtext relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-krgold/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative z-10 p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <Reveal className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-krborder bg-krpanel text-krgold"><Calculator size={22} /></span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-krwhite">Position <span className="text-krgold">Calculator</span></h1>
            </div>
            <p className="text-krmuted text-sm ml-14">Size every trade to a fixed risk before you enter.</p>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Inputs */}
            <Reveal className="bg-krcard shadow-card rounded-xl border border-krborder p-6">
              <h2 className="text-lg font-semibold mb-5">Trade setup</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Account size</label>
                    <input type="number" inputMode="decimal" value={account} onChange={(e) => setAccount(e.target.value)} className={inputCls} placeholder="10000" />
                  </div>
                  <div>
                    <label className={labelCls}>Risk %</label>
                    <input type="number" inputMode="decimal" value={riskPct} onChange={(e) => setRiskPct(e.target.value)} className={inputCls} placeholder="1" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Entry price</label>
                  <input type="number" inputMode="decimal" value={entry} onChange={(e) => setEntry(e.target.value)} className={inputCls} placeholder="0.00" />
                </div>
                <div>
                  <label className={labelCls}>Stop-loss price</label>
                  <input type="number" inputMode="decimal" value={stop} onChange={(e) => setStop(e.target.value)} className={inputCls} placeholder="0.00" />
                </div>
                <div>
                  <label className={labelCls}>Target price <span className="text-krmuted/60 normal-case tracking-normal">(optional)</span></label>
                  <input type="number" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} className={inputCls} placeholder="0.00" />
                </div>
              </div>
            </Reveal>

            {/* Results */}
            <Reveal delay={1} className="bg-krcard shadow-card rounded-xl border border-krborder p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Result</h2>
                {valid && (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${isLong ? 'bg-krsuccess/15 text-krsuccess' : 'bg-krdanger/15 text-krdanger'}`}>
                    {isLong ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {isLong ? 'Long' : 'Short'}
                  </span>
                )}
              </div>

              {!valid ? (
                <p className="text-sm text-krmuted py-10 text-center">Enter account size, risk %, entry and stop to size your position.</p>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-krgold/30 bg-krgold/5 p-5">
                    <div className="text-xs uppercase tracking-[0.14em] text-krmuted mb-1">Position size</div>
                    <div className="text-3xl font-extrabold text-krgold tnum">{positionUnits.toLocaleString('en-US', { maximumFractionDigits: 4 })}</div>
                    <div className="text-xs text-krmuted mt-1 tnum">≈ {formatAmount(positionValue)} notional</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-krborder bg-krblack/30 p-4">
                      <div className="text-xs uppercase tracking-[0.14em] text-krmuted mb-1">Risk amount</div>
                      <div className="text-xl font-bold text-krdanger tnum">{formatAmount(riskAmount)}</div>
                    </div>
                    <div className="rounded-lg border border-krborder bg-krblack/30 p-4">
                      <div className="text-xs uppercase tracking-[0.14em] text-krmuted mb-1">Stop distance</div>
                      <div className="text-xl font-bold tnum">{stopDistPct.toFixed(2)}%</div>
                    </div>
                    <div className="rounded-lg border border-krborder bg-krblack/30 p-4">
                      <div className="text-xs uppercase tracking-[0.14em] text-krmuted mb-1">Reward : Risk</div>
                      <div className={`text-xl font-bold tnum ${hasTarget ? (rr >= 2 ? 'text-krsuccess' : rr >= 1 ? 'text-krgold' : 'text-krdanger') : 'text-krmuted'}`}>
                        {hasTarget ? `${rr.toFixed(2)}R` : '—'}
                      </div>
                    </div>
                    <div className="rounded-lg border border-krborder bg-krblack/30 p-4">
                      <div className="text-xs uppercase tracking-[0.14em] text-krmuted mb-1">Potential profit</div>
                      <div className="text-xl font-bold text-krsuccess tnum">{hasTarget ? formatAmount(potentialProfit) : '—'}</div>
                    </div>
                  </div>

                  <p className="text-xs text-krmuted leading-relaxed pt-1">
                    Buy/sell <span className="text-krtext font-medium tnum">{positionUnits.toLocaleString('en-US', { maximumFractionDigits: 4 })}</span> units
                    at <span className="text-krtext font-medium tnum">{formatAmount(entryP)}</span> with a stop at
                    <span className="text-krtext font-medium tnum"> {formatAmount(stopP)}</span> to risk exactly
                    <span className="text-krtext font-medium tnum"> {formatAmount(riskAmount)}</span> ({risk}% of your account).
                  </p>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  )
}
