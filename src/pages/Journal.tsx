import React, { useState, useEffect } from 'react'
import FileUploader from '../components/FileUploader'
import DateTimePicker from '../components/DateTimePicker'
import Select from '../components/Select'
import SendToDiscordButton from '../components/SendToDiscordButton'
import { loadData, saveData } from '../utils/storage'
import { useCurrency } from '../context/CurrencyContext'
import { JournalEntry, TradeObjective, TradeType, TradePosition } from '../types'
import { TrendingUp, TrendingDown, Link } from 'lucide-react'

const OBJECTIVES: TradeObjective[] = ['Scalping', 'Day Trade', 'Swing Trade', 'Position']
const TYPES: TradeType[] = ['Spot', 'Futures']
const POSITIONS: TradePosition[] = ['Long', 'Short']
const LEVERAGE_OPTIONS = Array.from({ length: 150 }, (_, i) => i + 1)

export default function Journal() {
  const data = loadData()
  const { formatAmount } = useCurrency()
  const [items, setItems] = useState<JournalEntry[]>(data.journal || [])
  const [strategies, setStrategies] = useState<string[]>([])
  const [form, setForm] = useState<Partial<JournalEntry>>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
    ticker: '',
    objective: 'Scalping',
    setup: '',
    type: 'Spot',
    position: 'Long',
    leverage: 1,
    entryPrice: 0,
    exitDate: new Date().toISOString().split('T')[0],
    exitTime: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
    exitPrice: 0,
    fee: 0,
    pnlAmount: 0,
    pnlPercent: 0,
    chartImg: '',
    pnlImg: '',
    reasonIn: '',
    reasonOut: ''
  })

  useEffect(() => {
    const playbook = data.playbook || []
    setStrategies(playbook.map((p: any) => p.title))
  }, [data.playbook])

  const calculatePnL = () => {
    if (!form.entryPrice || !form.exitPrice) return
    const multiplier = form.position === 'Long' ? 1 : -1
    const leverageMulti = form.type === 'Futures' ? (form.leverage || 1) : 1
    const diff = (form.exitPrice - form.entryPrice) * multiplier * leverageMulti
    const amount = diff * (form.leverage || 1)
    const percent = (diff / form.entryPrice) * 100 * leverageMulti
    setForm({ ...form, pnlAmount: amount, pnlPercent: percent })
  }

  useEffect(() => {
    calculatePnL()
  }, [form.entryPrice, form.exitPrice, form.leverage, form.position, form.type])

  const save = () => {
    let next: JournalEntry[]
    if (form.id) {
      // Edit mode: update existing trade
      next = items.map(i => i.id === form.id ? { ...i, ...form } as JournalEntry : i)
    } else {
      // New trade
      const it = { id: Date.now(), ...form } as JournalEntry
      next = [it, ...items]
    }
    setItems(next)
    saveData({ journal: next })
    setForm({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
      ticker: '',
      objective: 'Scalping',
      setup: '',
      type: 'Spot',
      position: 'Long',
      leverage: 1,
      entryPrice: 0,
      exitDate: new Date().toISOString().split('T')[0],
      exitTime: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
      exitPrice: 0,
      fee: 0,
      pnlAmount: 0,
      pnlPercent: 0,
      chartImg: '',
      pnlImg: '',
      reasonIn: '',
      reasonOut: ''
    })
  }

  const remove = (id: number) => {
    const next = items.filter(i => i.id !== id)
    setItems(next)
    saveData({ journal: next })
  }

  return (
    <div className="min-h-screen bg-krcard/30 backdrop-blur-sm text-krtext p-6">
      <h1 className="text-2xl font-bold mb-6 text-krtext">Journal</h1>
      
      {/* Main Layout - Form and Trade History side by side on large screens, stacked on smaller */}
      <div className="grid grid-cols-1 2xl:grid-cols-[1fr,400px] gap-6">
        {/* Form Section */}
        <div className="bg-krcard backdrop-blur-sm rounded-xl shadow-sm border border-krborder p-6">
          <h2 className="text-xl font-semibold mb-4 text-krtext">{form.id ? 'Edit Trade' : 'Add New Trade'}</h2>
          <div className="space-y-4">
            {/* Ticker */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-krtext">Ticker</label>
              <input
                className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                value={form.ticker}
                onChange={e => setForm({...form, ticker: e.target.value.toUpperCase()})}
                placeholder="BTC/USDT"
              />
            </div>

            {/* Type and Position */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-krtext">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm({...form, type: e.target.value as TradeType})}
                  className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                >
                  {TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-krtext">Position</label>
                <select
                  value={form.position}
                  onChange={e => setForm({...form, position: e.target.value as TradePosition})}
                  className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                >
                  {POSITIONS.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Entry Date and Entry Price */}
            <div className="grid grid-cols-2 gap-4">
              <DateTimePicker
                label="Entry Date"
                date={form.date || ''}
                time={form.time || ''}
                onDateChange={date => setForm({...form, date})}
                onTimeChange={time => setForm({...form, time})}
              />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-krtext">Entry Price</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                  value={form.entryPrice || ''}
                  onChange={e => setForm({...form, entryPrice: Number(e.target.value)})}
                  placeholder="Enter price"
                />
              </div>
            </div>

            {/* Objective and Setup */}
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Objective"
                value={form.objective || 'Scalping'}
                onChange={objective => setForm({...form, objective: objective as TradeObjective})}
                options={OBJECTIVES.map(o => ({ value: o, label: o }))}
              />

              <Select
                label="Setup"
                value={form.setup || ''}
                onChange={setup => setForm({...form, setup})}
                options={strategies.map(s => ({ value: s, label: s }))}
              />
            </div>

            {/* Leverage (only show for Futures) */}
            {form.type === 'Futures' && (
              <Select
                label="Leverage"
                value={form.leverage || 1}
                onChange={lev => setForm({...form, leverage: Number(lev)})}
                options={LEVERAGE_OPTIONS.map(l => ({ value: l, label: `${l}x` }))}
              />
            )}

            {/* Exit Date & Time and Exit Price */}
            <div className="grid grid-cols-2 gap-4">
              <DateTimePicker
                label="Exit Date & Time"
                date={form.exitDate || ''}
                time={form.exitTime || ''}
                onDateChange={exitDate => setForm({...form, exitDate})}
                onTimeChange={exitTime => setForm({...form, exitTime})}
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-krtext">Exit Price</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                  value={form.exitPrice || ''}
                  onChange={e => setForm({...form, exitPrice: Number(e.target.value)})}
                  placeholder="Exit price"
                />
              </div>
            </div>

            {/* Gain/Loss Amount, Gain/Loss %, and Fee */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-krtext">Gain/Loss Amount</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                  value={form.pnlAmount?.toFixed(2) || '0.00'}
                  readOnly
                  disabled
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-krtext">Gain/Loss %</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                  value={`${form.pnlPercent?.toFixed(2) || '0.00'}%`}
                  readOnly
                  disabled
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-krtext">Fee</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                  value={form.fee || ''}
                  onChange={e => setForm({...form, fee: Number(e.target.value)})}
                  placeholder="Fee"
                />
              </div>
            </div>

            {/* Chart Image and PnL Image - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-krtext">Chart Image</label>
                <FileUploader
                  value={form.chartImg || ''}
                  onChange={chartImg => setForm({...form, chartImg})}
                  accept="image/*"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-krtext">PnL Image</label>
                <FileUploader
                  value={form.pnlImg || ''}
                  onChange={pnlImg => setForm({...form, pnlImg})}
                  accept="image/*"
                />
              </div>
            </div>

            {/* Reason for Entry */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-krtext">Reason for Entry</label>
              <textarea
                className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                rows={3}
                value={form.reasonIn || ''}
                onChange={e => setForm({...form, reasonIn: e.target.value})}
              />
            </div>

            {/* Reason for Exit */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-krtext">Reason for Exit</label>
              <textarea
                className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                rows={3}
                value={form.reasonOut || ''}
                onChange={e => setForm({...form, reasonOut: e.target.value})}
              />
            </div>

            {/* Save Button */}
            <button 
              className="w-full px-4 py-2 bg-krgold text-krblack rounded-md font-semibold hover:bg-kryellow transition-colors"
              onClick={save}
            >
              {form.id ? 'Update Trade' : 'Save Trade'}
            </button>
          </div>
        </div>

        {/* Trade History - Right Side */}
        <div className="bg-krcard backdrop-blur-sm rounded-xl shadow-sm border border-krborder p-6">
          <h2 className="text-xl font-semibold mb-4 text-krtext">Trade History</h2>
          <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
            {items.length === 0 && (
              <div className="text-center text-gray-400 py-12">
                No trades yet. Add your first trade to get started!
              </div>
            )}
            {items.map((it) => {
              const isProfit = it.pnlAmount > 0
              return (
                <div key={it.id} className="bg-krblack/30 rounded-xl shadow-sm border border-krborder p-4">
                  {/* Chart Image */}
                  {it.chartImg && (
                    <img src={it.chartImg} className="w-full h-32 object-cover rounded-md mb-3" alt="Chart" />
                  )}
                  
                  {/* Trade Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg text-krtext">{it.ticker}</div>
                      <div className="text-sm text-gray-400">{it.date} {it.time}</div>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded whitespace-nowrap font-semibold ${isProfit ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {isProfit ? <TrendingUp className="inline-block w-4 h-4 mr-1" /> : <TrendingDown className="inline-block w-4 h-4 mr-1" />}
                      {it.pnlPercent.toFixed(2)}%
                    </span>
                  </div>

                  {/* Trade Details */}
                  <div className="text-xs text-gray-400 space-y-1 mb-3">
                    <div className="grid grid-cols-2 gap-x-2">
                      <div><strong className="text-krtext">Type:</strong> {it.type} {it.type === 'Futures' ? `${it.leverage}x` : ''}</div>
                      <div><strong className="text-krtext">Position:</strong> {it.position}</div>
                      <div><strong className="text-krtext">Objective:</strong> {it.objective}</div>
                      <div><strong className="text-krtext">Setup:</strong> {it.setup}</div>
                    </div>
                    <div className="border-t border-krborder pt-1 mt-2">
                      <div><strong className="text-krtext">Entry:</strong> {formatAmount(it.entryPrice)} on {it.date} {it.time}</div>
                      <div><strong className="text-krtext">Exit:</strong> {formatAmount(it.exitPrice)} on {it.exitDate} {it.exitTime}</div>
                      <div><strong className="text-krtext">P&L:</strong> {formatAmount(it.pnlAmount)} ({it.pnlPercent.toFixed(2)}%)</div>
                      <div><strong className="text-krtext">Fee:</strong> {formatAmount(it.fee || 0)}</div>
                    </div>
                    {(it.reasonIn || it.reasonOut) && (
                      <div className="border-t border-krborder pt-1 mt-2">
                        {it.reasonIn && <div><strong className="text-krtext">Entry Reason:</strong> {it.reasonIn}</div>}
                        {it.reasonOut && <div><strong className="text-krtext">Exit Reason:</strong> {it.reasonOut}</div>}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setForm({ ...it });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex-1 min-w-[80px] text-xs px-3 py-1.5 text-blue-400 hover:bg-blue-500/10 border border-blue-500/30 rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    {it.chartImg && (
                      <a 
                        href={it.chartImg} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex-1 min-w-[80px] text-center text-xs px-3 py-1.5 text-krgold hover:bg-krgold/10 border border-krgold/30 rounded-md transition-colors"
                      >
                        Chart
                      </a>
                    )}
                    <SendToDiscordButton trade={it} />
                    <button
                      onClick={() => remove(it.id)}
                      className="flex-1 min-w-[80px] text-xs px-3 py-1.5 text-red-400 hover:bg-red-500/10 border border-red-500/30 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
