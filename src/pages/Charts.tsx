import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { loadData, saveData } from '../utils/storage'
import FileUploader from '../components/FileUploader'
import Modal from '../components/Modal'
import { TrendingUp, TrendingDown, Calendar, DollarSign, Percent, Filter, X } from 'lucide-react'
import { useCurrency } from '../context/CurrencyContext'

export default function Charts(){
  const data = loadData()
  const { formatAmount } = useCurrency()
  const [searchParams] = useSearchParams()
  const journal = data.journal || []
  const charts = journal.filter((j:any)=> j.chartImg || j.pnlImg)
  const [items, setItems] = useState(charts)
  const [showUpload, setShowUpload] = useState(false)
  const [activeTab, setActiveTab] = useState<'Chart' | 'PNL'>('Chart')
  const [viewingTrade, setViewingTrade] = useState<any>(null)
  const [filterTicker, setFilterTicker] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [uploadForm, setUploadForm] = useState({
    ticker: '',
    chartImg: '',
    pnlImg: '',
    date: '',
    entryPrice: 0,
    exitPrice: 0,
    reasonIn: '',
    reasonOut: ''
  })

  // Set active tab based on URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'pnl') {
      setActiveTab('PNL')
    } else {
      setActiveTab('Chart')
    }
  }, [searchParams])

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
      const hasCorrectImage = activeTab === 'Chart' ? item.chartImg : item.pnlImg
      return matchesTicker && matchesStartDate && matchesEndDate && hasCorrectImage
    })
  }, [items, filterTicker, filterStartDate, filterEndDate, activeTab])

  const clearFilters = () => {
    setFilterTicker('')
    setFilterStartDate('')
    setFilterEndDate('')
  }

  const hasActiveFilters = filterTicker || filterStartDate || filterEndDate

  const updateReason = (id:number, key:'reasonIn'|'reasonOut', val:string)=>{
    const j = journal.map((it:any)=> it.id===id ? { ...it, [key]: val } : it)
    saveData({ journal: j })
    setItems(j.filter((it:any)=> it.chartImg || it.pnlImg))
  }

  const uploadChart = () => {
    const imageToCheck = activeTab === 'Chart' ? uploadForm.chartImg : uploadForm.pnlImg
    if (!uploadForm.ticker || !imageToCheck) {
      alert(`Please provide at least a ticker and ${activeTab.toLowerCase()} image`)
      return
    }
    
    const newChart = {
      id: Date.now(),
      ...uploadForm,
      pnlAmount: uploadForm.exitPrice - uploadForm.entryPrice,
      pnlPercent: ((uploadForm.exitPrice - uploadForm.entryPrice) / uploadForm.entryPrice) * 100
    }
    
    const updatedJournal = [newChart, ...journal]
    saveData({ journal: updatedJournal })
    setItems([newChart, ...items])
    setShowUpload(false)
    setUploadForm({
      ticker: '',
      chartImg: '',
      pnlImg: '',
      date: '',
      entryPrice: 0,
      exitPrice: 0,
      reasonIn: '',
      reasonOut: ''
    })
  }

  return (
    <div className="min-h-screen bg-krcard/30 backdrop-blur-sm text-krtext p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Snapshots</h1>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-4 py-2 bg-krgold hover:bg-kryellow text-krblack rounded-lg font-semibold transition-colors"
        >
          {showUpload ? 'Cancel' : 'Upload Snapshot'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('Chart')}
          className={`px-6 py-2.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'Chart'
              ? 'bg-krgold text-krblack'
              : 'bg-krcard border border-krborder text-krtext hover:border-krgold/50'
          }`}
        >
          Chart
        </button>
        <button
          onClick={() => setActiveTab('PNL')}
          className={`px-6 py-2.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'PNL'
              ? 'bg-krgold text-krblack'
              : 'bg-krcard border border-krborder text-krtext hover:border-krgold/50'
          }`}
        >
          PNL Overview
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-krcard backdrop-blur-sm rounded-xl shadow-sm border border-krborder p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-krgold" />
          <h2 className="text-lg font-semibold">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-sm px-3 py-1 text-gray-400 hover:text-krtext border border-krborder rounded-md transition-colors flex items-center gap-1"
            >
              <X size={14} />
              Clear Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-krtext">Ticker</label>
            <select
              value={filterTicker}
              onChange={e => setFilterTicker(e.target.value)}
              className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
            >
              <option value="">All Tickers</option>
              {uniqueTickers.map(ticker => (
                <option key={ticker} value={ticker}>{ticker}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-krtext">Start Date</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={e => setFilterStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-krtext">End Date</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={e => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
            />
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-400">
          Showing {filteredItems.length} of {items.length} charts
        </div>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="bg-krcard backdrop-blur-sm rounded-xl shadow-sm border border-krborder p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Upload New Snapshot</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-krtext">Ticker</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                value={uploadForm.ticker}
                onChange={e => setUploadForm({...uploadForm, ticker: e.target.value})}
                placeholder="BTC/USDT"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-krtext">Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                value={uploadForm.date}
                onChange={e => setUploadForm({...uploadForm, date: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-krtext">Entry Price</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                value={uploadForm.entryPrice || ''}
                onChange={e => setUploadForm({...uploadForm, entryPrice: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-krtext">Exit Price</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                value={uploadForm.exitPrice || ''}
                onChange={e => setUploadForm({...uploadForm, exitPrice: Number(e.target.value)})}
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-medium text-krtext">Chart Image</label>
              <FileUploader
                value={uploadForm.chartImg}
                onChange={val => setUploadForm({...uploadForm, chartImg: val})}
                accept="image/*"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-medium text-krtext">PNL Image</label>
              <FileUploader
                value={uploadForm.pnlImg}
                onChange={val => setUploadForm({...uploadForm, pnlImg: val})}
                accept="image/*"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-medium text-krtext">Reason for Entry</label>
              <textarea
                className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold min-h-[80px]"
                value={uploadForm.reasonIn}
                onChange={e => setUploadForm({...uploadForm, reasonIn: e.target.value})}
                placeholder="Why did you enter this trade?"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-medium text-krtext">Reason for Exit</label>
              <textarea
                className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold min-h-[80px]"
                value={uploadForm.reasonOut}
                onChange={e => setUploadForm({...uploadForm, reasonOut: e.target.value})}
                placeholder="Why did you exit this trade?"
              />
            </div>
          </div>
          <button
            onClick={uploadChart}
            className="mt-4 px-6 py-2 bg-krgold hover:bg-kryellow text-krblack rounded-lg font-semibold transition-colors"
          >
            Upload Snapshot
          </button>
        </div>
      )}

      {/* Snapshots Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-12">
            {hasActiveFilters ? `No ${activeTab.toLowerCase()} snapshots match the selected filters.` : `No ${activeTab.toLowerCase()} snapshots available. Upload your first snapshot to get started!`}
          </div>
        )}
        {filteredItems.map((it:any)=> {
          const isProfit = it.exitPrice > it.entryPrice
          const pnlAmount = it.pnlAmount || (it.exitPrice - it.entryPrice)
          const pnlPercent = it.pnlPercent || (((it.exitPrice - it.entryPrice) / it.entryPrice) * 100)
          const displayImage = activeTab === 'Chart' ? it.chartImg : it.pnlImg
          
          return (
            <div 
              key={it.id} 
              onClick={() => setViewingTrade(it)}
              className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder overflow-hidden hover:border-krgold/50 transition-colors cursor-pointer"
            >
              <img src={displayImage} className="w-full h-56 object-cover" alt={`${it.ticker} ${activeTab.toLowerCase()}`} />
              
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-krtext">{it.ticker || it.coin}</h3>
                    {it.date && (
                      <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                        <Calendar size={14} />
                        {it.date} {it.time}
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${isProfit ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isProfit ? <TrendingUp className="inline-block w-4 h-4" /> : <TrendingDown className="inline-block w-4 h-4" />}
                    {pnlPercent.toFixed(2)}%
                  </span>
                </div>

                {/* Trade Details Summary */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-krblack/50 rounded-lg p-2">
                    <div className="text-gray-400 text-xs mb-1">Entry Price</div>
                    <div className="text-krtext font-semibold flex items-center gap-1">
                      <DollarSign size={14} />
                      {formatAmount(it.entryPrice)}
                    </div>
                  </div>
                  <div className="bg-krblack/50 rounded-lg p-2">
                    <div className="text-gray-400 text-xs mb-1">Exit Price</div>
                    <div className="text-krtext font-semibold flex items-center gap-1">
                      <DollarSign size={14} />
                      {formatAmount(it.exitPrice)}
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                {(it.objective || it.setup || it.position) && (
                  <div className="text-xs text-gray-400 space-y-1 bg-krblack/30 rounded-lg p-2">
                    {it.objective && <div><strong className="text-krtext">Objective:</strong> {it.objective}</div>}
                    {it.setup && <div><strong className="text-krtext">Setup:</strong> {it.setup}</div>}
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
        <Modal isOpen={!!viewingTrade} onClose={() => setViewingTrade(null)} title="Trade Details" maxWidth="max-w-4xl">
          <div className="max-w-4xl mx-auto">
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
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Position</label>
                  <div className="text-krtext">{viewingTrade.position}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Objective</label>
                  <div className="text-krtext">{viewingTrade.objective}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Setup</label>
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
            {(viewingTrade.reasonIn || viewingTrade.reasonOut) && (
              <div className="space-y-4">
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
          </div>
        </Modal>
      )}
    </div>
  )
}
