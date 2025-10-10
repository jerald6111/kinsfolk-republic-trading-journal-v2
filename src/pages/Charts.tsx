import React, { useState } from 'react'
import { loadData, saveData } from '../utils/storage'
import FileUploader from '../components/FileUploader'
import { TrendingUp, TrendingDown, Calendar, DollarSign, Percent } from 'lucide-react'

export default function Charts(){
  const data = loadData()
  const journal = data.journal || []
  const charts = journal.filter((j:any)=> j.chartImg)
  const [items, setItems] = useState(charts)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    ticker: '',
    chartImg: '',
    date: '',
    entryPrice: 0,
    exitPrice: 0,
    reasonIn: '',
    reasonOut: ''
  })

  const updateReason = (id:number, key:'reasonIn'|'reasonOut', val:string)=>{
    const j = journal.map((it:any)=> it.id===id ? { ...it, [key]: val } : it)
    saveData({ journal: j })
    setItems(j.filter((it:any)=> it.chartImg))
  }

  const uploadChart = () => {
    if (!uploadForm.ticker || !uploadForm.chartImg) {
      alert('Please provide at least a ticker and chart image')
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
      date: '',
      entryPrice: 0,
      exitPrice: 0,
      reasonIn: '',
      reasonOut: ''
    })
  }

  const formatAmount = (val: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val)
  }

  return (
    <div className="min-h-screen bg-krblack text-krtext p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Charts</h1>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-4 py-2 bg-krgold hover:bg-kryellow text-krblack rounded-lg font-semibold transition-colors"
        >
          {showUpload ? 'Cancel' : 'Upload Chart'}
        </button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="bg-krcard backdrop-blur-sm rounded-xl shadow-sm border border-krborder p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Upload New Chart</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-krtext">Ticker</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                value={uploadForm.ticker}
                onChange={e => setUploadForm({...uploadForm, ticker: e.target.value})}
                placeholder="BTC/USDT"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-krtext">Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                value={uploadForm.date}
                onChange={e => setUploadForm({...uploadForm, date: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-krtext">Entry Price</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
                value={uploadForm.entryPrice || ''}
                onChange={e => setUploadForm({...uploadForm, entryPrice: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-krtext">Exit Price</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
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
              <label className="text-sm font-medium text-krtext">Reason for Entry</label>
              <textarea
                className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold min-h-[80px]"
                value={uploadForm.reasonIn}
                onChange={e => setUploadForm({...uploadForm, reasonIn: e.target.value})}
                placeholder="Why did you enter this trade?"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-medium text-krtext">Reason for Exit</label>
              <textarea
                className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold min-h-[80px]"
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
            Upload Chart
          </button>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((it:any)=> {
          const isProfit = it.exitPrice > it.entryPrice
          const pnlAmount = it.pnlAmount || (it.exitPrice - it.entryPrice)
          const pnlPercent = it.pnlPercent || (((it.exitPrice - it.entryPrice) / it.entryPrice) * 100)
          
          return (
            <div key={it.id} className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder overflow-hidden hover:border-krgold/50 transition-colors">
              <img src={it.chartImg} className="w-full h-56 object-cover" alt={`${it.ticker} chart`} />
              
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

                {/* Trade Details */}
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

                {/* Reasons */}
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-400 block mb-1">Reason for Entry</label>
                    <textarea 
                      className="w-full p-2 text-sm rounded-md bg-krblack/50 border border-krborder text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold resize-none" 
                      value={it.reasonIn || ''} 
                      onChange={e=> updateReason(it.id, 'reasonIn', e.target.value)}
                      rows={2}
                      placeholder="Why did you enter?"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 block mb-1">Reason for Exit</label>
                    <textarea 
                      className="w-full p-2 text-sm rounded-md bg-krblack/50 border border-krborder text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold resize-none" 
                      value={it.reasonOut || ''} 
                      onChange={e=> updateReason(it.id, 'reasonOut', e.target.value)}
                      rows={2}
                      placeholder="Why did you exit?"
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
