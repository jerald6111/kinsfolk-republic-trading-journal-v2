import React, { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { loadData, saveData } from '../utils/storage'
import Modal from '../components/Modal'
import { TrendingUp, TrendingDown, Calendar, DollarSign, Percent, Filter, X } from 'lucide-react'
import { useCurrency } from '../context/CurrencyContext'

export default function Charts(){
  const data = loadData()
  const { formatAmount } = useCurrency()
  const location = useLocation()
  const journal = data.journal || []
  
  // Determine view type based on route
  const isPnlView = location.pathname.includes('/pnl')
  const activeTab = isPnlView ? 'PNL' : 'Charts'
  
  // Filter journal entries based on view type
  const charts = journal.filter((j:any)=> isPnlView ? j.pnlImg : j.chartImg)
  const [items, setItems] = useState(charts)
  const [viewingTrade, setViewingTrade] = useState<any>(null)
  const [filterTicker, setFilterTicker] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')

  // Update items when location changes
  useEffect(() => {
    const filteredCharts = journal.filter((j:any)=> isPnlView ? j.pnlImg : j.chartImg)
    setItems(filteredCharts)
  }, [location.pathname, journal.length])

  // Get unique tickers from all journal entries
  const uniqueTickers = useMemo(() => {
    const tickers = new Set(journal.map((j: any) => j.ticker).filter(Boolean))
    return Array.from(tickers).sort()
  }, [journal])

  // Filter items based on ticker and date range
  const filteredItems = useMemo(() => {
    return items.filter((item: any) => {
      const matchesTicker = !filterTicker || item.ticker === filterTicker
      const matchesStartDate = !filterStartDate || item.date >= filterStartDate
      const matchesEndDate = !filterEndDate || item.date <= filterEndDate
      return matchesTicker && matchesStartDate && matchesEndDate
    })
  }, [items, filterTicker, filterStartDate, filterEndDate])

  const clearFilters = () => {
    setFilterTicker('')
    setFilterStartDate('')
    setFilterEndDate('')
  }

  const hasActiveFilters = filterTicker || filterStartDate || filterEndDate

  const updateReason = (id:number, key:'reasonIn'|'reasonOut', val:string)=>{
    const j = journal.map((it:any)=> it.id===id ? { ...it, [key]: val } : it)
    saveData({ journal: j })
    const filteredCharts = j.filter((it:any)=> isPnlView ? it.pnlImg : it.chartImg)
    setItems(filteredCharts)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-krblack to-gray-950 text-krtext relative overflow-hidden">
      {/* Animated gradient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-krgold/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-kryellow/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{activeTab === 'Charts' ? '📊' : '💰'}</span>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">
              Snapshots - {activeTab === 'Charts' ? 'Charts' : 'PNL Overview'}
            </h1>
            <p className="text-krmuted text-sm mt-1">Visual trading documentation</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-krgold" />
          <h2 className="text-base font-semibold text-krtext">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-sm px-3 py-1 text-krmuted hover:text-krtext border border-krborder/50 rounded-lg transition-colors flex items-center gap-1 hover:border-krgold/50"
            >
              <X size={14} />
              Clear Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-krtext">Ticker</label>
            <select
              value={filterTicker}
              onChange={e => setFilterTicker(e.target.value)}
              className="w-full px-3 py-2 border border-krborder/30 rounded-lg bg-krblack/30 text-krtext focus:border-krgold focus:ring-2 focus:ring-krgold/20 transition-all"
            >
              <option value="" className="bg-krcard text-krtext">All Tickers</option>
              {uniqueTickers.map(ticker => (
                <option key={ticker} value={ticker} className="bg-krcard text-krtext">{ticker}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-krtext">Start Date</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={e => setFilterStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-krborder/30 rounded-lg bg-krblack/30 text-krtext focus:border-krgold focus:ring-2 focus:ring-krgold/20 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-krtext">End Date</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={e => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-krborder/30 rounded-lg bg-krblack/30 text-krtext focus:border-krgold focus:ring-2 focus:ring-krgold/20 transition-all"
            />
          </div>
        </div>
        <div className="mt-3 text-sm text-krmuted">
          Showing {filteredItems.length} of {items.length} charts
        </div>
      </div>

      {/* Snapshots Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 && (
          <div className="col-span-full text-center bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-12">
            <span className="text-6xl mb-3 block">{activeTab === 'Charts' ? '📊' : '💰'}</span>
            <p className="text-krmuted">
              {hasActiveFilters ? `No ${activeTab.toLowerCase()} snapshots match the selected filters.` : `No ${activeTab.toLowerCase()} snapshots available.`}
            </p>
          </div>
        )}
        {filteredItems.map((it:any)=> {
          const isProfit = it.exitPrice > it.entryPrice
          const pnlAmount = it.pnlAmount || (it.exitPrice - it.entryPrice)
          const pnlPercent = it.pnlPercent || (((it.exitPrice - it.entryPrice) / it.entryPrice) * 100)
          const displayImage = isPnlView ? it.pnlImg : it.chartImg
          
          return (
            <div 
              key={it.id} 
              onClick={() => setViewingTrade(it)}
              className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder overflow-hidden hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 cursor-pointer group"
            >
              <div className="relative overflow-hidden">
                <img src={displayImage} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-200" alt={`${it.ticker} ${activeTab.toLowerCase()}`} />
              </div>
              
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-krtext">{it.ticker || it.coin}</h3>
                    {it.date && (
                      <div className="flex items-center gap-1 text-sm text-krmuted mt-1">
                        <Calendar size={14} />
                        {it.date} {it.time}
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${isProfit ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}>
                    {isProfit ? <TrendingUp className="inline-block w-3 h-3" /> : <TrendingDown className="inline-block w-3 h-3" />}
                    {pnlPercent.toFixed(2)}%
                  </span>
                </div>

                {/* Trade Details Summary */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-krblack/40 rounded-lg p-2 border border-krborder/30">
                    <div className="text-krmuted text-xs mb-1">Entry</div>
                    <div className="text-krtext font-semibold flex items-center gap-1">
                      <DollarSign size={12} />
                      {formatAmount(it.entryPrice)}
                    </div>
                  </div>
                  <div className="bg-krblack/40 rounded-lg p-2 border border-krborder/30">
                    <div className="text-krmuted text-xs mb-1">Exit</div>
                    <div className="text-krtext font-semibold flex items-center gap-1">
                      <DollarSign size={12} />
                      {formatAmount(it.exitPrice)}
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                {(it.objective || it.setup || it.position) && (
                  <div className="text-xs text-krmuted space-y-1 bg-krblack/30 rounded-lg p-2 border border-krborder/30">
                    {it.objective && <div><strong className="text-krtext">Objective:</strong> {it.objective}</div>}
                    {it.setup && <div><strong className="text-krtext">Strategy:</strong> {it.setup}</div>}
                    {it.position && <div><strong className="text-krtext">Position:</strong> {it.position}</div>}
                    {it.type && <div><strong className="text-krtext">Type:</strong> {it.type} {it.type === 'Futures' && it.leverage ? `${it.leverage}x` : ''}</div>}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Trade Details Modal */}
      {viewingTrade && (
        <Modal isOpen={!!viewingTrade} onClose={() => setViewingTrade(null)} title="Trade Details" maxWidth="max-w-7xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-krtext">{viewingTrade.ticker}</h2>
                <p className="text-sm text-gray-400">{viewingTrade.date} {viewingTrade.time}</p>
              </div>
              <span className={`text-lg px-3 py-1.5 rounded font-semibold ${viewingTrade.pnlAmount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {viewingTrade.pnlAmount > 0 ? <TrendingUp className="inline-block w-5 h-5 mr-1" /> : <TrendingDown className="inline-block w-5 h-5 mr-1" />}
                {(viewingTrade.pnlPercent || (((viewingTrade.exitPrice - viewingTrade.entryPrice) / viewingTrade.entryPrice) * 100)).toFixed(2)}%
              </span>
            </div>

            {/* Charts View - Only show Chart Image (Horizontal) */}
            {!isPnlView && viewingTrade.chartImg && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Chart Analysis</label>
                <img src={viewingTrade.chartImg} className="w-full rounded-lg border border-krborder" alt="Chart" />
              </div>
            )}

            {/* PNL View - Only show PNL Image (Vertical) */}
            {isPnlView && viewingTrade.pnlImg && (
              <div className="mb-6 flex justify-center">
                <div className="max-w-2xl w-full">
                  <label className="block text-sm font-medium text-gray-400 mb-2">PnL Screenshot</label>
                  <img src={viewingTrade.pnlImg} className="w-full rounded-lg border border-krborder" alt="PnL" />
                </div>
              </div>
            )}

            {/* Trade Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                  <div className="text-krtext">{viewingTrade.type} {viewingTrade.type === 'Futures' ? `${viewingTrade.leverage}x` : ''}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Position</label>
                  <div className="text-krtext">{viewingTrade.position}</div>
                </div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">P&L</label>
                  <div className={`font-semibold ${(viewingTrade.pnlAmount || (viewingTrade.exitPrice - viewingTrade.entryPrice)) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatAmount(viewingTrade.pnlAmount || (viewingTrade.exitPrice - viewingTrade.entryPrice))} ({(viewingTrade.pnlPercent || (((viewingTrade.exitPrice - viewingTrade.entryPrice) / viewingTrade.entryPrice) * 100)).toFixed(2)}%)
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Fee</label>
                  <div className="text-krtext">{formatAmount(viewingTrade.fee || 0)}</div>
                </div>
              </div>
            </div>

            {/* Reasons */}
            {viewingTrade.reasonIn && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Reason for Entry & Exit</label>
                <div className="p-3 bg-krcard/50 rounded-lg border border-krborder text-krtext whitespace-pre-wrap">
                  {viewingTrade.reasonIn}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
      </div>
      </div>
    </div>
  )
}
