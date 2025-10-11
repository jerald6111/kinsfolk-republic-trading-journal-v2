import React from 'react'
import { Link } from 'react-router-dom'
import { loadData } from '../utils/storage'
import { Camera, TrendingUp, TrendingDown, BarChart3, ArrowRight, ImageIcon } from 'lucide-react'

export default function SnapshotsOverview() {
  const data = loadData()
  const journal = data.journal || []
  const chartsData = journal.filter((j: any) => j.chartImg || j.pnlImg)
  
  const totalSnapshots = chartsData.length
  const chartSnapshots = chartsData.filter((j: any) => j.chartImg).length
  const pnlSnapshots = chartsData.filter((j: any) => j.pnlImg).length
  
  const totalPnl = chartsData.reduce((s: number, j: any) => s + (j.pnlAmount || 0), 0)
  const wins = chartsData.filter((j: any) => j.pnlAmount > 0).length
  const winRate = totalSnapshots ? Math.round((wins / totalSnapshots) * 100) : 0

  // Recent snapshots
  const recentSnapshots = [...chartsData].reverse().slice(0, 6)

  return (
    <div className="min-h-screen bg-krcard/30 backdrop-blur-sm text-krtext p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Camera className="text-krgold" size={32} />
          <h1 className="text-3xl font-bold">Snapshots</h1>
        </div>
        <p className="text-gray-400">Visual documentation of your trading journey</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
          <div className="text-gray-400 text-sm mb-1">Total Snapshots</div>
          <div className="text-3xl font-bold text-krgold">{totalSnapshots}</div>
        </div>
        <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
          <div className="text-gray-400 text-sm mb-1">Win Rate</div>
          <div className={`text-3xl font-bold ${winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
            {winRate}%
          </div>
        </div>
        <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
          <div className="text-gray-400 text-sm mb-1">Total PnL</div>
          <div className={`text-3xl font-bold ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${totalPnl.toFixed(2)}
          </div>
        </div>
        <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
          <div className="text-gray-400 text-sm mb-1">Chart/PNL</div>
          <div className="text-3xl font-bold text-krtext">
            {chartSnapshots}/{pnlSnapshots}
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Charts Section */}
        <Link 
          to="/snapshots/charts"
          className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6 hover:border-krgold/50 transition-all group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-krgold/10 rounded-lg">
                <ImageIcon className="text-krgold" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold group-hover:text-krgold transition-colors">Charts</h2>
                <p className="text-sm text-gray-400">Technical analysis snapshots</p>
              </div>
            </div>
            <ArrowRight className="text-gray-400 group-hover:text-krgold transition-colors" size={20} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-krblack/30 rounded-lg p-3">
              <div className="text-xs text-gray-400">Chart Images</div>
              <div className="text-2xl font-semibold text-krgold">{chartSnapshots}</div>
            </div>
            <div className="bg-krblack/30 rounded-lg p-3">
              <div className="text-xs text-gray-400">Documented</div>
              <div className="text-2xl font-semibold text-krtext">
                {chartsData.filter((j: any) => j.chartImg && (j.reasonIn || j.reasonOut)).length}
              </div>
            </div>
          </div>
        </Link>

        {/* PNL Overview Section */}
        <Link 
          to="/snapshots/pnl"
          className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6 hover:border-krgold/50 transition-all group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-krgold/10 rounded-lg">
                <BarChart3 className="text-krgold" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold group-hover:text-krgold transition-colors">PNL Overview</h2>
                <p className="text-sm text-gray-400">Profit & loss snapshots</p>
              </div>
            </div>
            <ArrowRight className="text-gray-400 group-hover:text-krgold transition-colors" size={20} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-krblack/30 rounded-lg p-3">
              <div className="text-xs text-gray-400">PNL Images</div>
              <div className="text-2xl font-semibold text-krgold">{pnlSnapshots}</div>
            </div>
            <div className="bg-krblack/30 rounded-lg p-3">
              <div className="text-xs text-gray-400">Avg PnL</div>
              <div className={`text-2xl font-semibold ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${totalSnapshots > 0 ? (totalPnl / totalSnapshots).toFixed(0) : '0'}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Snapshots Grid */}
      <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
        <div className="flex items-center gap-3 mb-4">
          <Camera className="text-krgold" size={24} />
          <h2 className="text-xl font-semibold">Recent Snapshots</h2>
        </div>
        {recentSnapshots.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No snapshots yet. Start documenting your trades!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSnapshots.map((snapshot: any) => {
              const isProfit = snapshot.pnlAmount >= 0
              const displayImage = snapshot.chartImg || snapshot.pnlImg
              
              return (
                <div key={snapshot.id} className="bg-krblack/30 rounded-lg overflow-hidden border border-krborder hover:border-krgold/50 transition-all">
                  {displayImage && (
                    <div className="aspect-video bg-krblack/50 relative">
                      <img 
                        src={displayImage} 
                        alt={snapshot.ticker}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{snapshot.ticker}</div>
                      {isProfit ? (
                        <TrendingUp className="text-green-500" size={16} />
                      ) : (
                        <TrendingDown className="text-red-500" size={16} />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-400">{snapshot.date}</div>
                      <div className={`font-semibold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
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
    </div>
  )
}
