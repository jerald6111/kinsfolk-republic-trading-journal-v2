import React, { useState, useEffect } from 'react'
import FileUploader from '../components/FileUploader'
import DateTimePicker from '../components/DateTimePicker'
import Select from '../components/Select'
import Modal from '../components/Modal'
import SendToDiscordButton from '../components/SendToDiscordButton'
import { loadData, saveData } from '../utils/storage'
import { useCurrency } from '../context/CurrencyContext'
import { JournalEntry, TradeObjective, TradeType, TradePosition } from '../types'
import { TrendingUp, TrendingDown, Link, X } from 'lucide-react'

const OBJECTIVES: TradeObjective[] = ['Scalping', 'Day Trade', 'Swing Trade', 'Position']
const TYPES: TradeType[] = ['Spot', 'Futures']
const POSITIONS: TradePosition[] = ['Long', 'Short']
const LEVERAGE_OPTIONS = Array.from({ length: 150 }, (_, i) => i + 1)

export default function Journal() {
  const data = loadData()
  const { formatAmount } = useCurrency()
  const [items, setItems] = useState<JournalEntry[]>(data.journal || [])
  const [strategies, setStrategies] = useState<string[]>([])
  const [viewingTrade, setViewingTrade] = useState<JournalEntry | null>(null)
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
    marginCost: 0,
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
      marginCost: 0,
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

            {/* Type and Position/Margin Cost */}
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
              
              {/* Position (only for Futures) */}
              {form.type === 'Futures' ? (
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
              ) : (
                /* Margin Cost (for Spot) */
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-krtext">Margin Cost</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                    value={form.marginCost || ''}
                    onChange={e => setForm({...form, marginCost: Number(e.target.value)})}
                    placeholder="Enter margin cost"
                  />
                </div>
              )}
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

            {/* Objective and Strategy */}
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Objective"
                value={form.objective || 'Scalping'}
                onChange={objective => setForm({...form, objective: objective as TradeObjective})}
                options={OBJECTIVES.map(o => ({ value: o, label: o }))}
              />

              <Select
                label="Strategy"
                value={form.setup || ''}
                onChange={setup => setForm({...form, setup})}
                options={strategies.map(s => ({ value: s, label: s }))}
              />
            </div>

            {/* Leverage and Margin Cost (only show for Futures) */}
            {form.type === 'Futures' && (
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Leverage"
                  value={form.leverage || 1}
                  onChange={lev => setForm({...form, leverage: Number(lev)})}
                  options={LEVERAGE_OPTIONS.map(l => ({ value: l, label: `${l}x` }))}
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-krtext">Margin Cost</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                    value={form.marginCost || ''}
                    onChange={e => setForm({...form, marginCost: Number(e.target.value)})}
                    placeholder="Enter margin cost"
                  />
                </div>
              </div>
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
                <div 
                  key={it.id} 
                  onClick={() => setViewingTrade(it)}
                  className="bg-krblack/30 rounded-xl shadow-sm border border-krborder p-4 cursor-pointer hover:border-krgold/50 transition-colors"
                >
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

                  {/* Trade Details - Summary Only */}
                  <div className="text-xs text-gray-400 space-y-1">
                    <div className="grid grid-cols-2 gap-x-2">
                      <div><strong className="text-krtext">Type:</strong> {it.type} {it.type === 'Futures' ? `${it.leverage}x` : ''}</div>
                      <div><strong className="text-krtext">Position:</strong> {it.position}</div>
                    </div>
                    <div>
                      <strong className="text-krtext">Entry:</strong> {formatAmount(it.entryPrice)} → <strong className="text-krtext">Exit:</strong> {formatAmount(it.exitPrice)}
                    </div>
                    <div><strong className="text-krtext">P&L:</strong> {formatAmount(it.pnlAmount)} ({it.pnlPercent.toFixed(2)}%)</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Trade Details Modal */}
      {viewingTrade && (
        <Modal isOpen={!!viewingTrade} onClose={() => setViewingTrade(null)} title="Trade Details" maxWidth="max-w-4xl">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-krtext">{viewingTrade.ticker}</h2>
                <p className="text-sm text-gray-400">{viewingTrade.date} {viewingTrade.time}</p>
              </div>
              <span className={`text-lg px-3 py-1.5 rounded font-semibold ${viewingTrade.pnlAmount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {viewingTrade.pnlAmount > 0 ? <TrendingUp className="inline-block w-5 h-5 mr-1" /> : <TrendingDown className="inline-block w-5 h-5 mr-1" />}
                {viewingTrade.pnlPercent.toFixed(2)}%
              </span>
            </div>

            {/* Images */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {viewingTrade.chartImg && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Chart Image</label>
                  <img src={viewingTrade.chartImg} className="w-full rounded-lg border border-krborder" alt="Chart" />
                </div>
              )}
              {viewingTrade.pnlImg && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">PnL Image</label>
                  <img src={viewingTrade.pnlImg} className="w-full rounded-lg border border-krborder" alt="PnL" />
                </div>
              )}
            </div>

            {/* Trade Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                  <div className="text-krtext">{viewingTrade.type} {viewingTrade.type === 'Futures' ? `${viewingTrade.leverage}x` : ''}</div>
                </div>
                {viewingTrade.type === 'Futures' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Position</label>
                    <div className="text-krtext">{viewingTrade.position}</div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Objective</label>
                  <div className="text-krtext">{viewingTrade.objective}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Strategy</label>
                  <div className="text-krtext">{viewingTrade.setup}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Entry Price</label>
                  <div className="text-krtext">{formatAmount(viewingTrade.entryPrice)}</div>
                  <div className="text-xs text-gray-400">{viewingTrade.date} {viewingTrade.time}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Exit Price</label>
                  <div className="text-krtext">{formatAmount(viewingTrade.exitPrice)}</div>
                  <div className="text-xs text-gray-400">{viewingTrade.exitDate} {viewingTrade.exitTime}</div>
                </div>
                {viewingTrade.marginCost > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Margin Cost</label>
                    <div className="text-krtext">{formatAmount(viewingTrade.marginCost)}</div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">P&L</label>
                  <div className={`font-semibold ${viewingTrade.pnlAmount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatAmount(viewingTrade.pnlAmount)} ({viewingTrade.pnlPercent.toFixed(2)}%)
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Fee</label>
                  <div className="text-krtext">{formatAmount(viewingTrade.fee || 0)}</div>
                </div>
              </div>
            </div>

            {/* Reasons */}
            {(viewingTrade.reasonIn || viewingTrade.reasonOut) && (
              <div className="space-y-4 mb-6">
                {viewingTrade.reasonIn && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Reason for Entry</label>
                    <div className="p-3 bg-krcard/50 rounded-lg border border-krborder text-krtext">
                      {viewingTrade.reasonIn}
                    </div>
                  </div>
                )}
                {viewingTrade.reasonOut && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Reason for Exit</label>
                    <div className="p-3 bg-krcard/50 rounded-lg border border-krborder text-krtext">
                      {viewingTrade.reasonOut}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setForm({ ...viewingTrade });
                  setViewingTrade(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 px-4 py-2 text-blue-400 hover:bg-blue-500/10 border border-blue-500/30 rounded-md transition-colors"
              >
                Edit Trade
              </button>
              <SendToDiscordButton trade={viewingTrade} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this trade?')) {
                    remove(viewingTrade.id);
                    setViewingTrade(null);
                  }
                }}
                className="px-4 py-2 text-red-400 hover:bg-red-500/10 border border-red-500/30 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
