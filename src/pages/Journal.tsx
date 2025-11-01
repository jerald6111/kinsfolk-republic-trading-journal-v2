import React, { useState, useEffect } from 'react'
import FileUploader from '../components/FileUploader'
import DateTimePicker from '../components/DateTimePicker'
import Select from '../components/Select'
import Modal from '../components/Modal'
import SendToDiscordButton from '../components/SendToDiscordButton'
import { loadData, saveData, triggerAutoEmailBackup } from '../utils/storage'
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
    
    let amount = 0
    let percent = 0
    
    if (form.type === 'Spot') {
      // Spot trading: Simple price difference (always Long)
      const diff = form.exitPrice - form.entryPrice
      percent = (diff / form.entryPrice) * 100
      // Amount = percent of margin cost
      amount = form.marginCost ? (form.marginCost * percent) / 100 : diff
    } else {
      // Futures trading: With leverage and position
      const multiplier = form.position === 'Long' ? 1 : -1
      const diff = (form.exitPrice - form.entryPrice) * multiplier
      percent = (diff / form.entryPrice) * 100 * (form.leverage || 1)
      // Amount = percent of margin cost
      amount = form.marginCost ? (form.marginCost * percent) / 100 : diff * (form.leverage || 1)
    }
    
    // DO NOT subtract fees here - fees are applied separately in balance calculations
    setForm({ ...form, pnlAmount: amount, pnlPercent: percent })
  }

  useEffect(() => {
    calculatePnL()
  }, [form.entryPrice, form.exitPrice, form.leverage, form.position, form.type, form.marginCost])

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
    
    // Trigger auto-email backup if enabled
    if (!form.id) {
      triggerAutoEmailBackup('add')
    } else {
      triggerAutoEmailBackup('update')
    }
    
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
    
    // Trigger auto-email backup for deletion
    triggerAutoEmailBackup('delete')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-krblack to-gray-950 text-krtext relative overflow-hidden">
      {/* Animated gradient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-krgold/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-kryellow/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
      {/* Header Section with Stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">Trading Journal</h1>
            <p className="text-krmuted text-sm mt-1">Track and analyze your trading performance</p>
          </div>
          
          {/* Total Trades */}
          <div className="flex items-center gap-3">
            <div className="bg-krcard/50 backdrop-blur-sm rounded-xl border border-krborder px-4 py-2">
              <p className="text-xs text-krmuted">Total Trades</p>
              <p className="text-2xl font-bold text-krgold">{items.length}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4">
            <p className="text-xs text-krmuted mb-1">Win Rate</p>
            <p className="text-xl font-bold text-green-500">
              {items.length > 0 ? `${((items.filter(t => (t.pnlAmount - (t.fee || 0)) > 0).length / items.length) * 100).toFixed(1)}%` : '0%'}
            </p>
          </div>
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4">
            <p className="text-xs text-krmuted mb-1">Total P&L</p>
            <p className={`text-xl font-bold ${items.reduce((sum, t) => sum + (t.pnlAmount - (t.fee || 0)), 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatAmount(items.reduce((sum, t) => sum + (t.pnlAmount - (t.fee || 0)), 0))}
            </p>
          </div>
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4">
            <p className="text-xs text-krmuted mb-1">Avg Win</p>
            <p className="text-xl font-bold text-green-500">
              {items.filter(t => (t.pnlAmount - (t.fee || 0)) > 0).length > 0 
                ? formatAmount(items.filter(t => (t.pnlAmount - (t.fee || 0)) > 0).reduce((sum, t) => sum + (t.pnlAmount - (t.fee || 0)), 0) / items.filter(t => (t.pnlAmount - (t.fee || 0)) > 0).length)
                : formatAmount(0)}
            </p>
          </div>
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4">
            <p className="text-xs text-krmuted mb-1">Avg Loss</p>
            <p className="text-xl font-bold text-red-500">
              {items.filter(t => (t.pnlAmount - (t.fee || 0)) < 0).length > 0 
                ? formatAmount(Math.abs(items.filter(t => (t.pnlAmount - (t.fee || 0)) < 0).reduce((sum, t) => sum + (t.pnlAmount - (t.fee || 0)), 0) / items.filter(t => (t.pnlAmount - (t.fee || 0)) < 0).length))
                : formatAmount(0)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Layout - Form and Trade History */}
      <div className="grid grid-cols-1 2xl:grid-cols-[1fr,450px] gap-6">
        {/* Form Section */}
        <div className="bg-krcard/90 backdrop-blur-md rounded-2xl shadow-2xl border border-krborder/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-krtext flex items-center gap-2">
              {form.id ? (
                <>
                  <span className="text-blue-400">✏️</span> Edit Trade
                </>
              ) : (
                <>
                  <span className="text-krgold">➤</span> New Trade
                </>
              )}
            </h2>
            {form.id && (
              <button
                onClick={() => setForm({
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
                })}
                className="text-sm text-krmuted hover:text-krtext transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>
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
                  className="w-full px-3 py-2 border border-krborder rounded-xl bg-krcard text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                >
                  {TYPES.map(type => (
                    <option key={type} value={type} className="bg-krcard text-krtext">{type}</option>
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
                    className="w-full px-3 py-2 border border-krborder rounded-xl bg-krcard text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                  >
                    {POSITIONS.map(pos => (
                      <option key={pos} value={pos} className="bg-krcard text-krtext">{pos}</option>
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
                options={[{ value: '', label: '' }, ...strategies.map(s => ({ value: s, label: s }))]}
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
                <label className="block text-sm font-medium text-krtext">
                  Gain/Loss Amount
                  <button
                    type="button"
                    onClick={calculatePnL}
                    className="ml-2 text-xs text-krgold hover:text-kryellow"
                    title="Auto-calculate from entry/exit prices"
                  >
                    (Auto)
                  </button>
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                  value={form.pnlAmount || ''}
                  onChange={e => setForm({...form, pnlAmount: Number(e.target.value)})}
                  placeholder="Enter P&L amount"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-krtext">
                  Gain/Loss %
                  <button
                    type="button"
                    onClick={calculatePnL}
                    className="ml-2 text-xs text-krgold hover:text-kryellow"
                    title="Auto-calculate from entry/exit prices"
                  >
                    (Auto)
                  </button>
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                  value={form.pnlPercent || ''}
                  onChange={e => setForm({...form, pnlPercent: Number(e.target.value)})}
                  placeholder="Enter P&L %"
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

            {/* Reason for Entry & Exit */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-krtext">Reason for Entry & Exit</label>
              <textarea
                className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                rows={5}
                value={form.reasonIn || ''}
                onChange={e => setForm({...form, reasonIn: e.target.value, reasonOut: e.target.value})}
                placeholder="Describe your reasoning for entering and exiting this trade..."
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
        <div className="bg-krcard/90 backdrop-blur-md rounded-2xl shadow-2xl border border-krborder/50 p-6 flex flex-col">
          <h2 className="text-2xl font-bold mb-4 text-krtext flex items-center gap-2">
            <span className="text-krgold">📊</span> Recent Trades
          </h2>
          <div className="space-y-3 overflow-y-auto pr-2 flex-1 max-h-[calc(100vh-16rem)] custom-scrollbar">
            {items.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📈</div>
                <p className="text-krmuted">No trades yet</p>
                <p className="text-xs text-krmuted/60 mt-2">Add your first trade to start tracking!</p>
              </div>
            )}
            {items.map((it) => {
              const netPnl = (it.pnlAmount || 0) - (it.fee || 0)
              const isProfit = netPnl > 0
              return (
                <div 
                  key={it.id} 
                  className="bg-krblack/40 backdrop-blur-sm rounded-xl border border-krborder/30 p-4 cursor-pointer hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 group relative"
                >
                  {/* Hover Tooltip with PNL and Chart */}
                  <div className="absolute right-full mr-4 top-0 w-80 bg-krcard/95 backdrop-blur-xl border border-krgold/50 rounded-xl shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
                    {/* PNL Summary */}
                    <div className="mb-3 pb-3 border-b border-krborder/30">
                      <div className="text-xs text-krmuted mb-2">Net P&L</div>
                      <div className={`text-2xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                        {formatAmount(netPnl)}
                      </div>
                      <div className={`text-sm font-medium ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                        {isProfit ? '+' : ''}{it.pnlPercent.toFixed(2)}%
                      </div>
                    </div>
                    
                    {/* Chart Image */}
                    {it.chartImg && (
                      <div>
                        <div className="text-xs text-krmuted mb-2">Chart</div>
                        <img 
                          src={it.chartImg} 
                          alt="Trade Chart" 
                          className="w-full rounded-lg border border-krborder/50"
                        />
                      </div>
                    )}
                    
                    {/* If no chart image */}
                    {!it.chartImg && (
                      <div className="text-xs text-krmuted italic">No chart image available</div>
                    )}
                  </div>

                  {/* Trade Header */}
                  <div className="flex items-start justify-between gap-2 mb-3" onClick={() => setViewingTrade(it)}>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg text-krtext group-hover:text-krgold transition-colors">{it.ticker}</div>
                      <div className="text-xs text-krmuted flex items-center gap-2">
                        <span>{it.date}</span>
                        <span className="text-krborder">•</span>
                        <span>{it.time}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${isProfit ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                      {isProfit ? <TrendingUp className="inline-block w-3 h-3 mr-1" /> : <TrendingDown className="inline-block w-3 h-3 mr-1" />}
                      {it.pnlPercent.toFixed(2)}%
                    </span>
                  </div>

                  {/* Trade Details */}
                  <div className="text-xs space-y-2">
                    <div className="flex items-center justify-between text-krmuted">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${it.position === 'Long' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        {it.type} {it.type === 'Futures' ? `${it.leverage}x` : ''} • {it.position}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-krborder/20">
                      <span className="text-krmuted">Net P&L</span>
                      <span className={`font-bold text-sm ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                        {formatAmount(netPnl)}
                      </span>
                    </div>
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
            {(() => {
              const netPnl = (viewingTrade.pnlAmount || 0) - (viewingTrade.fee || 0)
              return (
                <>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-krtext">{viewingTrade.ticker}</h2>
                      <p className="text-sm text-gray-400 mt-1">
                        {viewingTrade.date} {viewingTrade.time} → {viewingTrade.exitDate} {viewingTrade.exitTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${netPnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {netPnl > 0 ? '+' : ''}{formatAmount(netPnl)}
                      </div>
                      <div className={`text-sm font-medium ${netPnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {netPnl > 0 ? <TrendingUp className="inline-block w-4 h-4" /> : <TrendingDown className="inline-block w-4 h-4" />}
                        {viewingTrade.pnlPercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Trade Type & Position Cards */}
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    <div className="bg-krblack/30 backdrop-blur-sm rounded-xl p-3 border border-krborder">
                      <label className="block text-xs text-gray-400 mb-1">Type</label>
                      <div className="text-krtext font-semibold">{viewingTrade.type}</div>
                    </div>
                    {viewingTrade.type === 'Futures' && (
                      <>
                        <div className="bg-krblack/30 backdrop-blur-sm rounded-xl p-3 border border-krborder">
                          <label className="block text-xs text-gray-400 mb-1">Position</label>
                          <div className="text-krtext font-semibold">{viewingTrade.position}</div>
                        </div>
                        <div className="bg-krblack/30 backdrop-blur-sm rounded-xl p-3 border border-krborder">
                          <label className="block text-xs text-gray-400 mb-1">Leverage</label>
                          <div className="text-krtext font-semibold">{viewingTrade.leverage}x</div>
                        </div>
                      </>
                    )}
                    <div className="bg-krblack/30 backdrop-blur-sm rounded-xl p-3 border border-krborder">
                      <label className="block text-xs text-gray-400 mb-1">Objective</label>
                      <div className="text-krtext font-semibold">{viewingTrade.objective}</div>
                    </div>
                    {viewingTrade.setup && (
                      <div className="bg-krblack/30 backdrop-blur-sm rounded-xl p-3 border border-krborder col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">Strategy</label>
                        <div className="text-krtext font-semibold">{viewingTrade.setup}</div>
                      </div>
                    )}
                  </div>

                  {/* Price & P&L Information */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-krblack/30 backdrop-blur-sm rounded-xl p-4 border border-krborder">
                      <label className="block text-sm text-gray-400 mb-2">Entry Price</label>
                      <div className="text-2xl font-bold text-krtext">{formatAmount(viewingTrade.entryPrice)}</div>
                      <div className="text-xs text-gray-400 mt-1">{viewingTrade.date} {viewingTrade.time}</div>
                    </div>
                    <div className="bg-krblack/30 backdrop-blur-sm rounded-xl p-4 border border-krborder">
                      <label className="block text-sm text-gray-400 mb-2">Exit Price</label>
                      <div className="text-2xl font-bold text-krtext">{formatAmount(viewingTrade.exitPrice)}</div>
                      <div className="text-xs text-gray-400 mt-1">{viewingTrade.exitDate} {viewingTrade.exitTime}</div>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {viewingTrade.marginCost > 0 && (
                      <div className="bg-krblack/30 backdrop-blur-sm rounded-xl p-4 border border-krborder">
                        <label className="block text-sm text-gray-400 mb-2">Margin Cost</label>
                        <div className="text-xl font-semibold text-krtext">{formatAmount(viewingTrade.marginCost)}</div>
                      </div>
                    )}
                    <div className="bg-krblack/30 backdrop-blur-sm rounded-xl p-4 border border-krborder">
                      <label className="block text-sm text-gray-400 mb-2">Gross P&L</label>
                      <div className={`text-xl font-semibold ${viewingTrade.pnlAmount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatAmount(viewingTrade.pnlAmount)}
                      </div>
                    </div>
                    <div className="bg-krblack/30 backdrop-blur-sm rounded-xl p-4 border border-krborder">
                      <label className="block text-sm text-gray-400 mb-2">Fee</label>
                      <div className="text-xl font-semibold text-red-400">{formatAmount(viewingTrade.fee || 0)}</div>
                    </div>
                    <div className="bg-krblack/30 backdrop-blur-sm rounded-xl p-4 border border-krborder">
                      <label className="block text-sm text-gray-400 mb-2">Net P&L</label>
                      <div className={`text-xl font-bold ${netPnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatAmount(netPnl)}
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  {(viewingTrade.chartImg || viewingTrade.pnlImg) && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {viewingTrade.chartImg && (
                        <div className="bg-krblack/30 backdrop-blur-sm rounded-xl p-4 border border-krborder">
                          <label className="block text-sm text-gray-400 mb-3">Chart Image</label>
                          <img src={viewingTrade.chartImg} className="w-full rounded-lg border border-krborder" alt="Chart" />
                        </div>
                      )}
                      {viewingTrade.pnlImg && (
                        <div className="bg-krblack/30 backdrop-blur-sm rounded-xl p-4 border border-krborder">
                          <label className="block text-sm text-gray-400 mb-3">PnL Image</label>
                          <img src={viewingTrade.pnlImg} className="w-full rounded-lg border border-krborder" alt="PnL" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reason */}
                  {viewingTrade.reasonIn && (
                    <div className="bg-krblack/30 backdrop-blur-sm rounded-xl p-4 border border-krborder mb-6">
                      <label className="block text-sm text-gray-400 mb-3">Reason for Entry & Exit</label>
                      <div className="text-krtext whitespace-pre-wrap leading-relaxed">
                        {viewingTrade.reasonIn}
                      </div>
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
                      className="flex-1 px-4 py-2 text-blue-400 hover:bg-blue-500/10 border border-blue-500/30 rounded-lg transition-colors font-medium"
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
                      className="px-4 py-2 text-red-400 hover:bg-red-500/10 border border-red-500/30 rounded-lg transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </Modal>
      )}
      </div>
      </div>
    </div>
  );
}

