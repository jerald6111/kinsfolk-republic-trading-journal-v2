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
    <div>
      <h1 className="text-2xl font-bold mb-4 text-krtext">Journal</h1>
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-krcard backdrop-blur-sm rounded-xl shadow-sm border border-krborder p-6">
          <h2 className="text-xl font-semibold mb-4 text-krtext">{form.id ? 'Edit Trade' : 'Add New Trade'}</h2>
          <div className="space-y-6">
            {/* Trade Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-krtext mb-1">
                  Ticker
                </label>
                <input
                  className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                  value={form.ticker}
                  onChange={e => setForm({...form, ticker: e.target.value.toUpperCase()})}
                  placeholder="e.g., BTCUSDT"
                />
              </div>
              
              {/* Trade Type and Position */}
              <div>
                <label className="block text-sm font-medium text-krtext mb-1">
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={e => setForm({...form, type: e.target.value as TradeType})}
                  className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                >
                  {TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-krtext mb-1">
                  Position
                </label>
                <select
                  value={form.position}
                  onChange={e => setForm({...form, position: e.target.value as TradePosition})}
                  className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                >
                  {POSITIONS.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              {/* Entry Details */}
              <div>
                <DateTimePicker
                  label="Entry Date"
                  date={form.date || ''}
                  time={form.time || ''}
                  onDateChange={date => setForm({...form, date})}
                  onTimeChange={time => setForm({...form, time})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-krtext mb-1">
                  Entry Price
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
              value={form.entryPrice || ''}
              onChange={e => setForm({...form, entryPrice: Number(e.target.value)})}
              placeholder="Enter price"
            />
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              value={form.type || 'Spot'}
              onChange={type => setForm({...form, type: type as TradeType})}
              options={TYPES.map(t => ({ value: t, label: t }))}
            />
            <Select
              label="Position"
              value={form.position || 'Long'}
              onChange={position => setForm({...form, position: position as TradePosition})}
              options={POSITIONS.map(p => ({ value: p, label: p }))}
            />
          </div>

          {form.type === 'Futures' && (
            <Select
              label="Leverage"
              value={form.leverage || 1}
              onChange={lev => setForm({...form, leverage: Number(lev)})}
              options={LEVERAGE_OPTIONS.map(l => ({ value: l, label: `${l}x` }))}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-krtext">Entry Price</div>
              <input
                type="number"
                className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                value={form.entryPrice || ''}
                onChange={e => setForm({...form, entryPrice: Number(e.target.value)})}
              />
            </div>

            <DateTimePicker
              label="Exit Date & Time"
              date={form.exitDate || ''}
              time={form.exitTime || ''}
              onDateChange={exitDate => setForm({...form, exitDate})}
              onTimeChange={exitTime => setForm({...form, exitTime})}
            />

            <div className="space-y-1">
              <div className="text-sm font-medium text-krtext">Exit Price</div>
              <input
                type="number"
                className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                value={form.exitPrice || ''}
                onChange={e => setForm({...form, exitPrice: Number(e.target.value)})}
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-krtext">Fee</div>
              <input
                type="number"
                className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                value={form.fee || ''}
                onChange={e => setForm({...form, fee: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-krtext">Chart Image</div>
            <div className="relative">
              <FileUploader
                value={form.chartImg || ''}
                onChange={chartImg => setForm({...form, chartImg})}
                accept="image/*"
              />
              {form.chartImg && (
                <a 
                  href={form.chartImg} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 text-sm text-krgold hover:text-kryellow inline-flex items-center gap-1"
                >
                  <Link size={14} />
                  View Full Image
                </a>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-krtext">PnL Image</div>
            <div className="relative">
              <FileUploader
                value={form.pnlImg || ''}
                onChange={pnlImg => setForm({...form, pnlImg})}
                accept="image/*"
              />
              {form.pnlImg && (
                <a 
                  href={form.pnlImg} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 text-sm text-krgold hover:text-kryellow inline-flex items-center gap-1"
                >
                  <Link size={14} />
                  View Full Image
                </a>
              )}
            </div>
          </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium text-krtext">Reason for Entry</div>
            <textarea
              className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
              rows={3}
              value={form.reasonIn || ''}
              onChange={e => setForm({...form, reasonIn: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium text-krtext">Reason for Exit</div>
            <textarea
              className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
              rows={3}
              value={form.reasonOut || ''}
              onChange={e => setForm({...form, reasonOut: e.target.value})}
            />
          </div>

          <button 
            className="w-full px-4 py-2 bg-krgold text-white rounded-md font-semibold hover:bg-kryellow transition-colors"
            onClick={save}
          >
            {form.id ? 'Update Trade' : 'Save Trade'}
          </button>
        </div>
      </div>
      
      {/* Saved Trades List */}
      <div className="bg-krcard backdrop-blur-sm rounded-xl shadow-sm border border-krborder p-6">
        <h2 className="text-xl font-semibold mb-4 text-krtext">Trade History</h2>
        <div className="space-y-4">
            {items.map((it) => {
              const isProfit = it.pnlAmount > 0
              return (
                <div key={it.id} className="bg-krblack/30 rounded-xl shadow-sm border border-krborder p-4 flex gap-4">
                  {it.chartImg && (
                    <img src={it.chartImg} className="w-32 h-24 object-cover rounded-md" alt="Chart" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{it.ticker}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm">{it.date} {it.time}</span>
                      <span className={`ml-auto text-sm px-2 py-0.5 rounded ${isProfit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isProfit ? <TrendingUp className="inline-block w-4 h-4 mr-1" /> : <TrendingDown className="inline-block w-4 h-4 mr-1" />}
                        {formatAmount(it.pnlAmount)} ({it.pnlPercent.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      <strong>Objective:</strong> {it.objective} <br />
                      <strong>Setup:</strong> {it.setup} <br />
                      <strong>Type:</strong> {it.type} {it.type === 'Futures' ? `${it.leverage}x` : ''} <br />
                      <strong>Position:</strong> {it.position}
                    </div>
                    <div className="mt-2 text-sm">
                      <strong>Entry:</strong> {formatAmount(it.entryPrice)} on {it.date} {it.time}<br />
                      <strong>Exit:</strong> {formatAmount(it.exitPrice)} on {it.exitDate} {it.exitTime}<br />
                      <strong>Fee:</strong> {formatAmount(it.fee || 0)}
                    </div>
                    <div className="mt-2 text-sm">
                      <strong>Reason for Entry:</strong> {it.reasonIn || 'N/A'}<br />
                      <strong>Reason for Exit:</strong> {it.reasonOut || 'N/A'}
                    </div>
                    <div className="mt-2 flex gap-4">
                      {it.chartImg && (
                        <a href={it.chartImg} target="_blank" rel="noopener noreferrer" className="text-sm text-krgold hover:text-kryellow flex items-center gap-1">
                          <Link size={14} />Chart Image
                        </a>
                      )}
                      {it.pnlImg && (
                        <a href={it.pnlImg} target="_blank" rel="noopener noreferrer" className="text-sm text-krgold hover:text-kryellow flex items-center gap-1">
                          <Link size={14} />PnL Image
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 justify-center">
                    <button
                      onClick={() => {
                        setForm({ ...it });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-sm px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    <SendToDiscordButton trade={it} />
                    <button
                      onClick={() => remove(it.id)}
                      className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
