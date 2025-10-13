import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { loadData } from '../utils/storage'
import { useCurrency } from '../context/CurrencyContext'
import { Camera, TrendingUp, TrendingDown, BarChart3, ArrowRight, ImageIcon, DollarSign, Calendar } from 'lucide-react'
import Modal from '../components/Modal'

export default function SnapshotsOverview() {
  const data = loadData()
  const { formatAmount } = useCurrency()
  const journal = data.journal || []
  const chartsData = journal.filter((j: any) => j.chartImg || j.pnlImg)
  const [viewingTrade, setViewingTrade] = useState<any>(null)
  
  const totalSnapshots = chartsData.length
  const chartSnapshots = chartsData.filter((j: any) => j.chartImg).length
  const pnlSnapshots = chartsData.filter((j: any) => j.pnlImg).length
  
  // Calculate PnL with fees subtracted
  const totalPnl = chartsData.reduce((s: number, j: any) => s + ((j.pnlAmount || 0) - (j.fee || 0)), 0)
  const wins = chartsData.filter((j: any) => ((j.pnlAmount || 0) - (j.fee || 0)) > 0).length
  const winRate = totalSnapshots ? Math.round((wins / totalSnapshots) * 100) : 0

  // Recent snapshots - newest first (already in newest-first order from journal)
  const recentSnapshots = chartsData.slice(0, 6)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-krblack to-gray-950 text-krtext relative overflow-hidden">
      {/* Animated gradient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-krgold/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-kryellow/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
      {/* Header with Gradient */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">📸</span>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">Snapshots</h1>
            <p className="text-krmuted text-sm mt-1">Visual documentation of your trading journey</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4 hover:border-krgold/50 transition-all">
            <p className="text-xs text-krmuted mb-1">Total Snapshots</p>
            <p className="text-2xl font-bold text-krgold">{totalSnapshots}</p>
          </div>
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4 hover:border-krgold/50 transition-all">
            <p className="text-xs text-krmuted mb-1">Win Rate</p>
            <p className={`text-2xl font-bold ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {winRate}%
            </p>
          </div>
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4 hover:border-krgold/50 transition-all">
            <p className="text-xs text-krmuted mb-1">Total PnL</p>
            <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatAmount(totalPnl)}
            </p>
          </div>
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4 hover:border-krgold/50 transition-all">
            <p className="text-xs text-krmuted mb-1">Chart/PNL</p>
            <p className="text-2xl font-bold text-krtext">
              {chartSnapshots}/{pnlSnapshots}
            </p>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Charts Section */}
        <Link 
          to="/snapshots/charts"
          className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-5 hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-krgold/10 rounded-lg group-hover:bg-krgold/20 transition-colors">
                <ImageIcon className="text-krgold" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold group-hover:text-krgold transition-colors">Charts</h2>
                <p className="text-xs text-krmuted">Technical analysis snapshots</p>
              </div>
            </div>
            <ArrowRight className="text-krmuted group-hover:text-krgold transition-colors" size={18} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-krblack/40 rounded-lg p-3 border border-krborder/30">
              <p className="text-xs text-krmuted">Chart Images</p>
              <p className="text-xl font-semibold text-krgold">{chartSnapshots}</p>
            </div>
            <div className="bg-krblack/40 rounded-lg p-3 border border-krborder/30">
              <p className="text-xs text-krmuted">Documented</p>
              <p className="text-xl font-semibold text-krtext">
                {chartsData.filter((j: any) => j.chartImg && (j.reasonIn || j.reasonOut)).length}
              </p>
            </div>
          </div>
        </Link>

        {/* PNL Overview Section */}
        <Link 
          to="/snapshots/pnl"
          className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-5 hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-krgold/10 rounded-lg group-hover:bg-krgold/20 transition-colors">
                <BarChart3 className="text-krgold" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold group-hover:text-krgold transition-colors">PNL Overview</h2>
                <p className="text-xs text-krmuted">Profit & loss snapshots</p>
              </div>
            </div>
            <ArrowRight className="text-krmuted group-hover:text-krgold transition-colors" size={18} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-krblack/40 rounded-lg p-3 border border-krborder/30">
              <p className="text-xs text-krmuted">PNL Images</p>
              <p className="text-xl font-semibold text-krgold">{pnlSnapshots}</p>
            </div>
            <div className="bg-krblack/40 rounded-lg p-3 border border-krborder/30">
              <p className="text-xs text-krmuted">Avg PnL</p>
              <p className={`text-xl font-semibold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${totalSnapshots > 0 ? (totalPnl / totalSnapshots).toFixed(0) : '0'}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Snapshots Grid */}
      <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📸</span>
          <h2 className="text-lg font-semibold text-krtext">Recent Snapshots</h2>
        </div>
        {recentSnapshots.length === 0 ? (
          <div className="text-center py-12 bg-krblack/40 rounded-lg border border-krborder/30">
            <span className="text-6xl mb-3 block">📸</span>
            <p className="text-krmuted">No snapshots yet. Start documenting your trades!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSnapshots.map((snapshot: any) => {
              const isProfit = snapshot.pnlAmount >= 0
              const displayImage = snapshot.chartImg || snapshot.pnlImg
              
              return (
                <div 
                  key={snapshot.id} 
                  onClick={() => setViewingTrade(snapshot)}
                  className="bg-krblack/40 rounded-lg overflow-hidden border border-krborder/30 hover:border-krgold/50 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 cursor-pointer group"
                >
                  {displayImage && (
                    <div className="aspect-video bg-krblack/50 relative overflow-hidden">
                      <img 
                        src={displayImage} 
                        alt={snapshot.ticker}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-krtext">{snapshot.ticker}</div>
                      {isProfit ? (
                        <TrendingUp className="text-green-400" size={16} />
                      ) : (
                        <TrendingDown className="text-red-400" size={16} />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-krmuted">{snapshot.date}</div>
                      <div className={`font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                        {isProfit ? '+' : ''}${snapshot.pnlAmount?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Trade Details Modal */}
      {viewingTrade && (
        <Modal isOpen={!!viewingTrade} onClose={() => setViewingTrade(null)} title="Snapshot Details" maxWidth="max-w-6xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-krtext">{viewingTrade.ticker}</h2>
                <div className="flex items-center gap-2 text-sm text-krmuted mt-1">
                  <Calendar size={14} />
                  <span>{viewingTrade.date} {viewingTrade.time}</span>
                </div>
              </div>
              <span className={`text-lg px-3 py-1.5 rounded-lg font-semibold ${(viewingTrade.pnlAmount || 0) > 0 ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}>
                {(viewingTrade.pnlAmount || 0) > 0 ? <TrendingUp className="inline-block w-5 h-5 mr-1" /> : <TrendingDown className="inline-block w-5 h-5 mr-1" />}
                {(viewingTrade.pnlPercent || (((viewingTrade.exitPrice - viewingTrade.entryPrice) / viewingTrade.entryPrice) * 100)).toFixed(2)}%
              </span>
            </div>

            {/* Images Grid */}
            <div className={`grid gap-6 ${viewingTrade.chartImg && viewingTrade.pnlImg ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {viewingTrade.chartImg && (
                <div>
                  <label className="block text-sm font-medium text-krmuted mb-2">Chart Analysis</label>
                  <img src={viewingTrade.chartImg} className="w-full rounded-lg border border-krborder" alt="Chart" />
                </div>
              )}
              {viewingTrade.pnlImg && (
                <div>
                  <label className="block text-sm font-medium text-krmuted mb-2">PnL Screenshot</label>
                  <img src={viewingTrade.pnlImg} className="w-full rounded-lg border border-krborder" alt="PnL" />
                </div>
              )}
            </div>

            {/* Trade Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-krblack/40 rounded-lg p-3 border border-krborder/30">
                <div className="text-xs text-krmuted mb-1">Entry</div>
                <div className="text-krtext font-semibold flex items-center gap-1">
                  <DollarSign size={14} />
                  {formatAmount(viewingTrade.entryPrice)}
                </div>
              </div>
              <div className="bg-krblack/40 rounded-lg p-3 border border-krborder/30">
                <div className="text-xs text-krmuted mb-1">Exit</div>
                <div className="text-krtext font-semibold flex items-center gap-1">
                  <DollarSign size={14} />
                  {formatAmount(viewingTrade.exitPrice)}
                </div>
              </div>
              <div className="bg-krblack/40 rounded-lg p-3 border border-krborder/30">
                <div className="text-xs text-krmuted mb-1">P&L</div>
                <div className={`font-semibold ${(viewingTrade.pnlAmount || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatAmount(viewingTrade.pnlAmount || 0)}
                </div>
              </div>
              <div className="bg-krblack/40 rounded-lg p-3 border border-krborder/30">
                <div className="text-xs text-krmuted mb-1">Fee</div>
                <div className="text-krtext font-semibold">
                  {formatAmount(viewingTrade.fee || 0)}
                </div>
              </div>
            </div>

            {/* Trade Info */}
            {(viewingTrade.objective || viewingTrade.setup || viewingTrade.position) && (
              <div className="bg-krblack/40 rounded-lg p-4 border border-krborder/30 space-y-2 text-sm">
                {viewingTrade.objective && (
                  <div>
                    <span className="text-krmuted">Objective:</span>
                    <span className="text-krtext ml-2">{viewingTrade.objective}</span>
                  </div>
                )}
                {viewingTrade.setup && (
                  <div>
                    <span className="text-krmuted">Strategy:</span>
                    <span className="text-krtext ml-2">{viewingTrade.setup}</span>
                  </div>
                )}
                {viewingTrade.position && (
                  <div>
                    <span className="text-krmuted">Position:</span>
                    <span className="text-krtext ml-2">{viewingTrade.position}</span>
                  </div>
                )}
                {viewingTrade.type && (
                  <div>
                    <span className="text-krmuted">Type:</span>
                    <span className="text-krtext ml-2">
                      {viewingTrade.type} {viewingTrade.type === 'Futures' && viewingTrade.leverage ? `${viewingTrade.leverage}x` : ''}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Reasons */}
            {viewingTrade.reasonIn && (
              <div>
                <label className="block text-sm font-medium text-krmuted mb-2">Reason for Entry & Exit</label>
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
