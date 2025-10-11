import React, { useState } from 'react'
import { loadData } from '../utils/storage'
import { BarChart3, TrendingUp, TrendingDown, Activity, DollarSign, Percent, Target, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCurrency } from '../context/CurrencyContext'

export default function TradeAnalytics() {
  const data = loadData()
  const { formatAmount } = useCurrency()
  const journal = data.journal || []
  
  const [calendarView, setCalendarView] = useState<'monthly' | 'weekly'>('monthly')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showModal, setShowModal] = useState(false)
  
  const totalTrades = journal.length
  const wins = journal.filter(j => j.pnlAmount > 0).length
  const losses = journal.filter(j => j.pnlAmount < 0).length
  const winRate = totalTrades ? Math.round((wins / totalTrades) * 100) : 0
  const totalPnl = journal.reduce((s, j) => s + (j.pnlAmount || 0), 0)
  
  const avgWin = wins > 0 ? journal.filter(j => j.pnlAmount > 0).reduce((s, j) => s + j.pnlAmount, 0) / wins : 0
  const avgLoss = losses > 0 ? journal.filter(j => j.pnlAmount < 0).reduce((s, j) => s + j.pnlAmount, 0) / losses : 0
  const riskReward = wins > 0 && losses > 0 ? Math.abs(avgWin / avgLoss) : 0
  
  const profitFactor = losses > 0 && avgLoss !== 0
    ? (wins * avgWin) / (losses * Math.abs(avgLoss))
    : wins > 0 ? Infinity : 0

  // Group trades by ticker
  const tickerPerformance = journal.reduce((acc: any, trade) => {
    if (!acc[trade.ticker]) {
      acc[trade.ticker] = { trades: 0, pnl: 0, wins: 0, losses: 0 }
    }
    acc[trade.ticker].trades++
    acc[trade.ticker].pnl += trade.pnlAmount || 0
    if (trade.pnlAmount > 0) acc[trade.ticker].wins++
    else if (trade.pnlAmount < 0) acc[trade.ticker].losses++
    return acc
  }, {})

  const topPerformers = Object.entries(tickerPerformance)
    .sort(([, a]: any, [, b]: any) => b.pnl - a.pnl)
    .slice(0, 5)

  // Calendar Helper Functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month, 1).getDay()
  }

  const getWeekDates = (date: Date) => {
    const curr = new Date(date)
    const first = curr.getDate() - curr.getDay() // First day is Sunday
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(curr.setDate(first + i))
      weekDates.push(day)
    }
    return weekDates
  }

  const getPnlForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const dayTrades = journal.filter((j: any) => {
      const tradeDate = new Date(j.date).toISOString().split('T')[0]
      return tradeDate === dateStr
    })
    const pnl = dayTrades.reduce((sum: number, j: any) => sum + (j.pnlAmount || 0), 0)
    return { pnl, trades: dayTrades.length, tradeData: dayTrades }
  }

  const handleDayClick = (date: Date) => {
    const { trades } = getPnlForDate(date)
    if (trades > 0) {
      setSelectedDate(date)
      setShowModal(true)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedDate(null)
  }

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction * 7))
    setCurrentDate(newDate)
  }

  const renderMonthlyCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const { pnl, trades } = getPnlForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()

      days.push(
        <div
          key={day}
          onClick={() => handleDayClick(date)}
          className={`aspect-square border border-krborder rounded-lg p-2 ${
            isToday ? 'ring-2 ring-krgold' : ''
          } ${trades > 0 ? 'bg-krblack/50 cursor-pointer hover:bg-krblack/70 transition-colors' : 'bg-krcard/30'}`}
        >
          <div className="text-sm text-gray-400 mb-1">{day}</div>
          {trades > 0 && (
            <>
              <div className={`text-xs font-semibold ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {pnl >= 0 ? '+' : ''}{pnl.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">{trades} trade{trades > 1 ? 's' : ''}</div>
            </>
          )}
        </div>
      )
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{monthYear}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-krgold/20 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm hover:bg-krgold/20 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-krgold/20 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>
    )
  }

  const renderWeeklyCalendar = () => {
    const weekDates = getWeekDates(currentDate)
    const weekStart = weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const weekEnd = weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{weekStart} - {weekEnd}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-krgold/20 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm hover:bg-krgold/20 rounded-lg transition-colors"
            >
              This Week
            </button>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 hover:bg-krgold/20 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-3">
          {weekDates.map((date, index) => {
            const { pnl, trades } = getPnlForDate(date)
            const isToday = date.toDateString() === new Date().toDateString()
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
            const dayNum = date.getDate()

            return (
              <div
                key={index}
                onClick={() => handleDayClick(date)}
                className={`border border-krborder rounded-lg p-4 ${
                  isToday ? 'ring-2 ring-krgold' : ''
                } ${trades > 0 ? 'bg-krblack/50 cursor-pointer hover:bg-krblack/70 transition-colors' : 'bg-krcard/30'}`}
              >
                <div className="text-center mb-3">
                  <div className="text-xs text-gray-400">{dayName}</div>
                  <div className="text-2xl font-bold text-krtext">{dayNum}</div>
                </div>
                {trades > 0 ? (
                  <div className="space-y-1">
                    <div className={`text-lg font-bold text-center ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {pnl >= 0 ? '+' : ''}{formatAmount(pnl)}
                    </div>
                    <div className="text-xs text-center text-gray-400">
                      {trades} trade{trades > 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-center text-gray-500">
                      Avg: {formatAmount(pnl / trades)}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-center text-gray-500 mt-2">No trades</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-krcard/30 backdrop-blur-sm text-krtext p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="text-krgold" size={32} />
          <h1 className="text-3xl font-bold">Trade Analytics</h1>
        </div>
        <p className="text-gray-400">Comprehensive analysis of your trading performance</p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="text-gray-400" size={20} />
            <div className="text-gray-400 text-sm">Total Trades</div>
          </div>
          <div className="text-3xl font-bold text-krtext">{totalTrades}</div>
          <div className="text-xs text-gray-500 mt-1">{wins}W / {losses}L</div>
        </div>

        <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
          <div className="flex items-center gap-3 mb-2">
            <Percent className="text-gray-400" size={20} />
            <div className="text-gray-400 text-sm">Win Rate</div>
          </div>
          <div className={`text-3xl font-bold ${winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
            {winRate}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {winRate >= 50 ? 'Above average' : 'Needs improvement'}
          </div>
        </div>

        <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-gray-400" size={20} />
            <div className="text-gray-400 text-sm">Total PnL</div>
          </div>
          <div className={`text-3xl font-bold ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatAmount(totalPnl)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {totalPnl >= 0 ? '+' : ''}{totalTrades > 0 ? (totalPnl / totalTrades).toFixed(2) : '0.00'} avg per trade
          </div>
        </div>

        <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-gray-400" size={20} />
            <div className="text-gray-400 text-sm">Profit Factor</div>
          </div>
          <div className={`text-3xl font-bold ${profitFactor >= 1.5 ? 'text-green-500' : profitFactor >= 1 ? 'text-krgold' : 'text-red-500'}`}>
            {profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {profitFactor >= 1.5 ? 'Excellent' : profitFactor >= 1 ? 'Good' : 'Poor'}
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-green-500" size={20} />
            <h2 className="text-lg font-semibold">Average Win</h2>
          </div>
          <div className="text-2xl font-bold text-green-500 mb-2">
            {formatAmount(avgWin)}
          </div>
          <div className="text-sm text-gray-400">
            Across {wins} winning trades
          </div>
        </div>

        <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="text-red-500" size={20} />
            <h2 className="text-lg font-semibold">Average Loss</h2>
          </div>
          <div className="text-2xl font-bold text-red-500 mb-2">
            {formatAmount(avgLoss)}
          </div>
          <div className="text-sm text-gray-400">
            Across {losses} losing trades
          </div>
        </div>

        <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-krgold" size={20} />
            <h2 className="text-lg font-semibold">Risk/Reward Ratio</h2>
          </div>
          <div className="text-2xl font-bold text-krgold mb-2">
            1:{riskReward.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">
            {riskReward >= 2 ? 'Excellent risk management' : riskReward >= 1 ? 'Good risk management' : 'Improve risk management'}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Top 5 Performing Pairs</h2>
        {topPerformers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No trading data available</div>
        ) : (
          <div className="space-y-3">
            {topPerformers.map(([ticker, stats]: any, index) => (
              <div key={ticker} className="bg-krblack/30 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-500">#{index + 1}</div>
                  <div>
                    <div className="font-semibold text-lg">{ticker}</div>
                    <div className="text-sm text-gray-400">
                      {stats.trades} trades • {stats.wins}W / {stats.losses}L
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${stats.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatAmount(stats.pnl)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {stats.trades > 0 ? ((stats.wins / stats.trades) * 100).toFixed(0) : 0}% win rate
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PNL Calendar */}
      <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="text-krgold" size={24} />
            <h2 className="text-xl font-semibold">PNL Calendar</h2>
          </div>
          <div className="flex gap-2 bg-krblack/30 rounded-lg p-1">
            <button
              onClick={() => setCalendarView('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                calendarView === 'monthly'
                  ? 'bg-krgold text-krblack'
                  : 'text-gray-400 hover:text-krtext'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCalendarView('weekly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                calendarView === 'weekly'
                  ? 'bg-krgold text-krblack'
                  : 'text-gray-400 hover:text-krtext'
              }`}
            >
              Weekly
            </button>
          </div>
        </div>
        {calendarView === 'monthly' ? renderMonthlyCalendar() : renderWeeklyCalendar()}
      </div>

      {/* Placeholder for charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
          <h2 className="text-lg font-semibold mb-4">PnL Over Time</h2>
          <div className="bg-krblack/30 rounded-lg p-8 text-center text-gray-400">
            Chart visualization coming soon
          </div>
        </div>
        <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
          <h2 className="text-lg font-semibold mb-4">Win/Loss Distribution</h2>
          <div className="bg-krblack/30 rounded-lg p-8 text-center text-gray-400">
            Chart visualization coming soon
          </div>
        </div>
      </div>

      {/* Trade Details Modal */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-krcard border border-krborder rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-krcard border-b border-krborder p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-krtext">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                <p className="text-gray-400 text-sm mt-1">Trade Details</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-krgold/20 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-400 hover:text-krtext" />
              </button>
            </div>
            
            <div className="p-6">
              {(() => {
                const { pnl, trades, tradeData } = getPnlForDate(selectedDate)
                const dayWins = tradeData.filter((t: any) => t.pnlAmount > 0).length
                const dayLosses = tradeData.filter((t: any) => t.pnlAmount < 0).length
                
                return (
                  <>
                    {/* Day Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-krblack/30 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-400 mb-1">Total PnL</div>
                        <div className={`text-2xl font-bold ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatAmount(pnl)}
                        </div>
                      </div>
                      <div className="bg-krblack/30 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-400 mb-1">Total Trades</div>
                        <div className="text-2xl font-bold text-krtext">{trades}</div>
                      </div>
                      <div className="bg-krblack/30 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                        <div className={`text-2xl font-bold ${dayWins / trades >= 0.5 ? 'text-green-500' : 'text-red-500'}`}>
                          {((dayWins / trades) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {/* Trade List */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold mb-3">Trades ({trades})</h3>
                      {tradeData.map((trade: any) => {
                        const isWin = trade.pnlAmount >= 0
                        return (
                          <div key={trade.id} className="bg-krblack/30 rounded-lg p-4 border border-krborder hover:border-krgold/50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-lg font-semibold text-krtext">{trade.ticker}</h4>
                                  {isWin ? (
                                    <TrendingUp className="text-green-500" size={20} />
                                  ) : (
                                    <TrendingDown className="text-red-500" size={20} />
                                  )}
                                </div>
                                <div className="text-sm text-gray-400 mt-1">
                                  {trade.strategy || 'No strategy specified'}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-xl font-bold ${isWin ? 'text-green-500' : 'text-red-500'}`}>
                                  {isWin ? '+' : ''}{formatAmount(trade.pnlAmount)}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {trade.timeframe || 'N/A'}
                                </div>
                              </div>
                            </div>
                            
                            {/* Trade Details Grid */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              {trade.entryPrice && (
                                <div>
                                  <span className="text-gray-400">Entry: </span>
                                  <span className="text-krtext font-medium">{formatAmount(trade.entryPrice)}</span>
                                </div>
                              )}
                              {trade.exitPrice && (
                                <div>
                                  <span className="text-gray-400">Exit: </span>
                                  <span className="text-krtext font-medium">{formatAmount(trade.exitPrice)}</span>
                                </div>
                              )}
                              {trade.type === 'Futures' && trade.marginCost > 0 && (
                                <div>
                                  <span className="text-gray-400">Margin: </span>
                                  <span className="text-krtext font-medium">{formatAmount(trade.marginCost)}</span>
                                </div>
                              )}
                              {trade.fee > 0 && (
                                <div>
                                  <span className="text-gray-400">Fee: </span>
                                  <span className="text-krtext font-medium">{formatAmount(trade.fee)}</span>
                                </div>
                              )}
                              {trade.positionSize && (
                                <div>
                                  <span className="text-gray-400">Position: </span>
                                  <span className="text-krtext font-medium">{trade.positionSize}</span>
                                </div>
                              )}
                              {trade.riskReward && (
                                <div>
                                  <span className="text-gray-400">R:R: </span>
                                  <span className="text-krtext font-medium">{trade.riskReward}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Notes */}
                            {(trade.reasonIn || trade.reasonOut) && (
                              <div className="mt-3 pt-3 border-t border-krborder/50">
                                {trade.reasonIn && (
                                  <div className="mb-2">
                                    <div className="text-xs text-gray-500 mb-1">Entry Reason:</div>
                                    <div className="text-sm text-gray-300">{trade.reasonIn}</div>
                                  </div>
                                )}
                                {trade.reasonOut && (
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Exit Reason:</div>
                                    <div className="text-sm text-gray-300">{trade.reasonOut}</div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Images */}
                            {(trade.chartImg || trade.pnlImg) && (
                              <div className="mt-3 flex gap-2">
                                {trade.chartImg && (
                                  <div className="flex-1">
                                    <img src={trade.chartImg} alt="Chart" className="w-full rounded-lg border border-krborder" />
                                  </div>
                                )}
                                {trade.pnlImg && (
                                  <div className="flex-1">
                                    <img src={trade.pnlImg} alt="PNL" className="w-full rounded-lg border border-krborder" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
