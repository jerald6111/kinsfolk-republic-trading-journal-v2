import React, { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { loadData, saveData } from '../utils/storage'
import Modal from '../components/Modal'
import FileUploader from '../components/FileUploader'
import { TrendingUp, TrendingDown, Calendar, DollarSign, Percent, Filter, X, Upload, Info } from 'lucide-react'
import { useCurrency } from '../context/CurrencyContext'

interface UploadedChart {
  id: number
  name: string
  entryPrice: number
  exitPrice: number
  description: string
  images: string[]
  date: string
  isOpportunity: true
}

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
  const uploadedCharts = data.uploadedCharts || []
  const [items, setItems] = useState(charts)
  const [viewingTrade, setViewingTrade] = useState<any>(null)
  const [viewingUploadedChart, setViewingUploadedChart] = useState<UploadedChart | null>(null)
  const [filterTicker, setFilterTicker] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  
  // Upload form states
  const [uploadName, setUploadName] = useState('')
  const [uploadEntry, setUploadEntry] = useState('')
  const [uploadExit, setUploadExit] = useState('')
  const [uploadDesc, setUploadDesc] = useState('')
  const [uploadImages, setUploadImages] = useState<string[]>(['', '', '', ''])

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

  const handleUploadChart = () => {
    const filteredImages = uploadImages.filter(img => img.trim() !== '')
    
    if (!uploadName || !uploadEntry || !uploadExit || filteredImages.length === 0) {
      alert('Please fill in Name, Entry Price, Exit Price, and upload at least one image.')
      return
    }

    const newChart: UploadedChart = {
      id: Date.now(),
      name: uploadName,
      entryPrice: parseFloat(uploadEntry),
      exitPrice: parseFloat(uploadExit),
      description: uploadDesc,
      images: filteredImages,
      date: new Date().toISOString().split('T')[0],
      isOpportunity: true
    }

    const updatedCharts = [newChart, ...(data.uploadedCharts || [])]
    saveData({ uploadedCharts: updatedCharts })
    
    // Reset form
    setUploadName('')
    setUploadEntry('')
    setUploadExit('')
    setUploadDesc('')
    setUploadImages(['', '', '', ''])
    setShowUploadModal(false)
    
    alert('Chart uploaded successfully! This is not counted as a trade entry.')
  }

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{activeTab === 'Charts' ? 'ðŸ“Š' : 'ðŸ’°'}</span>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">
                Snapshots - {activeTab === 'Charts' ? 'Charts' : 'PNL Overview'}
              </h1>
              <p className="text-krmuted text-sm mt-1">Visual trading documentation</p>
            </div>
          </div>
          
          {/* Upload Chart Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-krgold/20 hover:bg-krgold/30 text-krgold font-semibold rounded-lg border border-krgold/50 transition-colors"
            >
              <Upload size={18} />
              Upload Chart
            </button>
            <div className="group relative">
              <Info size={20} className="text-krmuted hover:text-krgold cursor-help transition-colors" />
              <div className="absolute right-0 top-8 w-64 bg-krcard border border-krgold/30 rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <p className="text-xs text-krmuted">
                  <span className="font-semibold text-krgold">Uploaded Charts:</span> Save missed trade opportunities or guides for future reference. These are NOT counted as trade entries.
                </p>
              </div>
            </div>
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

      {/* Uploaded Charts Section - Missed Opportunities */}
      {data.uploadedCharts && data.uploadedCharts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-krtext">Missed Opportunities & Guides</h3>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg font-medium">
              Not counted as trade entries
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.uploadedCharts.map((chart: UploadedChart) => {
              const pnlPercent = ((chart.exitPrice - chart.entryPrice) / chart.entryPrice) * 100
              const isProfit = chart.exitPrice > chart.entryPrice
              
              return (
                <div 
                  key={chart.id} 
                  onClick={() => setViewingUploadedChart(chart)}
                  className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-sm rounded-xl border-2 border-blue-500/30 overflow-hidden hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 cursor-pointer group"
                >
                  <div className="relative overflow-hidden">
                    {chart.images[0] ? (
                      <img src={chart.images[0]} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-200" alt={chart.name} />
                    ) : (
                      <div className="w-full h-56 bg-krblack/40 flex items-center justify-center">
                        <Upload size={48} className="text-krmuted" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-blue-500/90 text-white px-2 py-1 rounded-lg text-xs font-bold">
                      OPPORTUNITY
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-base text-krtext">{chart.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-krmuted mt-1">
                          <Calendar size={14} />
                          {chart.date}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${isProfit ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}>
                        {isProfit ? <TrendingUp className="inline-block w-3 h-3" /> : <TrendingDown className="inline-block w-3 h-3" />}
                        {pnlPercent.toFixed(2)}%
                      </span>
                    </div>

                    {/* Price Details */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-krblack/40 rounded-lg p-2 border border-krborder/30">
                        <div className="text-krmuted text-xs mb-1">Entry</div>
                        <div className="text-krtext font-semibold flex items-center gap-1">
                          <DollarSign size={12} />
                          {formatAmount(chart.entryPrice)}
                        </div>
                      </div>
                      <div className="bg-krblack/40 rounded-lg p-2 border border-krborder/30">
                        <div className="text-krmuted text-xs mb-1">Exit</div>
                        <div className="text-krtext font-semibold flex items-center gap-1">
                          <DollarSign size={12} />
                          {formatAmount(chart.exitPrice)}
                        </div>
                      </div>
                    </div>

                    {/* Description Preview */}
                    {chart.description && (
                      <div className="text-xs text-krmuted bg-krblack/30 rounded-lg p-2 border border-krborder/30 line-clamp-2">
                        {chart.description}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Snapshots Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 && (
          <div className="col-span-full text-center bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-12">
            <span className="text-6xl mb-3 block">{activeTab === 'Charts' ? 'ðŸ“Š' : 'ðŸ’°'}</span>
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

      {/* Upload Chart Modal */}
      {showUploadModal && (
        <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Chart - Missed Opportunity / Guide" maxWidth="max-w-4xl">
          <div className="space-y-4">
            {/* Info Notice */}
            <div className="bg-krgold/10 border border-krgold/30 rounded-lg p-4 flex items-start gap-3">
              <Info size={20} className="text-krgold mt-0.5 flex-shrink-0" />
              <div className="text-sm text-krmuted">
                <p className="font-semibold text-krgold mb-1">Not a Trade Entry</p>
                <p>These charts are for documenting missed trade opportunities or creating trading guides. They will NOT be counted in your trading statistics or journal entries.</p>
              </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-krtext mb-2">Name / Title *</label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={e => setUploadName(e.target.value)}
                  className="w-full px-3 py-2 border border-krborder/30 rounded-lg bg-krblack/30 text-krtext focus:border-krgold focus:ring-2 focus:ring-krgold/20 transition-all"
                  placeholder="e.g., BTC Breakout Setup, Missed ETH Entry"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-krtext mb-2">Entry Price *</label>
                <input
                  type="number"
                  step="any"
                  value={uploadEntry}
                  onChange={e => setUploadEntry(e.target.value)}
                  className="w-full px-3 py-2 border border-krborder/30 rounded-lg bg-krblack/30 text-krtext focus:border-krgold focus:ring-2 focus:ring-krgold/20 transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-krtext mb-2">Exit Price *</label>
                <input
                  type="number"
                  step="any"
                  value={uploadExit}
                  onChange={e => setUploadExit(e.target.value)}
                  className="w-full px-3 py-2 border border-krborder/30 rounded-lg bg-krblack/30 text-krtext focus:border-krgold focus:ring-2 focus:ring-krgold/20 transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-krtext mb-2">Potential P&L</label>
                <div className={`px-3 py-2 rounded-lg ${uploadEntry && uploadExit ? (parseFloat(uploadExit) > parseFloat(uploadEntry) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400') : 'bg-krblack/30 text-krmuted'} font-semibold`}>
                  {uploadEntry && uploadExit ? `${(((parseFloat(uploadExit) - parseFloat(uploadEntry)) / parseFloat(uploadEntry)) * 100).toFixed(2)}%` : 'N/A'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-krtext mb-2">Description / Notes</label>
              <textarea
                value={uploadDesc}
                onChange={e => setUploadDesc(e.target.value)}
                className="w-full px-3 py-2 border border-krborder/30 rounded-lg bg-krblack/30 text-krtext focus:border-krgold focus:ring-2 focus:ring-krgold/20 transition-all h-24 resize-none"
                placeholder="Why did you miss this opportunity? What were the key indicators? What will you do differently next time?"
              />
            </div>

            {/* Image Uploads */}
            <div>
              <label className="block text-sm font-medium text-krtext mb-2">Upload Images (Max 4) *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {uploadImages.map((img, idx) => (
                  <div key={idx}>
                    <FileUploader
                      label={`Image ${idx + 1}`}
                      value={img}
                      onChange={val => {
                        const next = [...uploadImages]
                        next[idx] = val
                        setUploadImages(next)
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-krborder">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-krmuted hover:text-krtext border border-krborder/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadChart}
                className="px-4 py-2 bg-krgold hover:bg-krgold/90 text-krblack font-semibold rounded-lg transition-colors"
              >
                Upload Chart
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Uploaded Chart Modal */}
      {viewingUploadedChart && (
        <Modal isOpen={!!viewingUploadedChart} onClose={() => setViewingUploadedChart(null)} title="Missed Opportunity Details" maxWidth="max-w-7xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-krtext">{viewingUploadedChart.name}</h2>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg font-bold">
                    OPPORTUNITY
                  </span>
                </div>
                <p className="text-sm text-gray-400">{viewingUploadedChart.date}</p>
                <p className="text-xs text-krmuted mt-1 italic">This chart is not counted as a trade entry</p>
              </div>
              <span className={`text-lg px-3 py-1.5 rounded font-semibold ${viewingUploadedChart.exitPrice > viewingUploadedChart.entryPrice ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {viewingUploadedChart.exitPrice > viewingUploadedChart.entryPrice ? <TrendingUp className="inline-block w-5 h-5 mr-1" /> : <TrendingDown className="inline-block w-5 h-5 mr-1" />}
                {(((viewingUploadedChart.exitPrice - viewingUploadedChart.entryPrice) / viewingUploadedChart.entryPrice) * 100).toFixed(2)}%
              </span>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {viewingUploadedChart.images.filter(img => img).map((image, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-blue-500/30 group">
                  <img src={image} className="w-full h-auto object-contain bg-krblack/40" alt={`Chart ${idx + 1}`} />
                  <div className="absolute top-2 right-2 bg-krblack/70 px-2 py-1 rounded text-xs text-krtext">
                    Image {idx + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Information */}
              <div className="bg-krcard/50 backdrop-blur-sm rounded-xl p-4 border border-krborder space-y-3">
                <h3 className="text-lg font-semibold text-krtext mb-3 flex items-center gap-2">
                  <DollarSign size={20} />
                  Price Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-krmuted text-sm">Entry Price:</span>
                    <span className="text-krtext font-semibold">{formatAmount(viewingUploadedChart.entryPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-krmuted text-sm">Exit Price:</span>
                    <span className="text-krtext font-semibold">{formatAmount(viewingUploadedChart.exitPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-krborder">
                    <span className="text-krmuted text-sm">Potential P&L:</span>
                    <span className={`font-bold ${viewingUploadedChart.exitPrice > viewingUploadedChart.entryPrice ? 'text-green-400' : 'text-red-400'}`}>
                      {(((viewingUploadedChart.exitPrice - viewingUploadedChart.entryPrice) / viewingUploadedChart.entryPrice) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-krcard/50 backdrop-blur-sm rounded-xl p-4 border border-krborder">
                <h3 className="text-lg font-semibold text-krtext mb-3">Description</h3>
                <p className="text-krmuted text-sm whitespace-pre-wrap">
                  {viewingUploadedChart.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-krmuted">
                  <p className="font-semibold text-krtext mb-1">About Opportunity Charts</p>
                  <p>
                    This chart represents a missed trading opportunity or a reference guide. 
                    It is saved for learning purposes and will not be counted in your trading statistics or performance metrics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
      </div>
      </div>
    </div>
  )
}

