import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { loadData } from '../utils/storage'
import { useCurrency } from '../context/CurrencyContext'
import { ArrowRight, ChevronLeft, ChevronRight, X, TrendingUp, TrendingDown } from 'lucide-react'

export default function JournalOverview() {
  const data = loadData()
  const { formatAmount } = useCurrency()
  const journal = data.journal || []
  
  // PNL Calendar states
  const [calendarView, setCalendarView] = useState<'monthly' | 'weekly'>('monthly')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)
  
  const totalTrades = journal.length
  const wins = journal.filter(j => ((j.pnlAmount || 0) - (j.fee || 0)) > 0).length
  const losses = journal.filter(j => ((j.pnlAmount || 0) - (j.fee || 0)) < 0).length
  const winRate = totalTrades ? Math.round((wins / totalTrades) * 100) : 0
  // Total PnL = sum of (pnlAmount - fee) for each trade
  const totalPnl = journal.reduce((s, j) => s + (j.pnlAmount || 0) - (j.fee || 0), 0)
  
  // Recent entries (last 5)
  const recentEntries = [...journal].reverse().slice(0, 5)

  // ========== PNL CALENDAR FUNCTIONS ==========
  
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
      const day = new Date(curr)
      day.setDate(first + i)
      weekDates.push(day)
    }
    return weekDates
  }

  const getPnlForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const dayTrades = journal.filter((j: any) => {
      // Use exitDate for PnL calculation - trades appear when closed, not opened
      const exitDateStr = j.exitDate || j.date
      const tradeDate = new Date(exitDateStr + 'T00:00:00').toISOString().split('T')[0]
      return tradeDate === dateStr
    })
    // Subtract fees from PnL for each trade
    const pnl = dayTrades.reduce((sum: number, j: any) => sum + (j.pnlAmount || 0) - (j.fee || 0), 0)
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
      const { pnl, trades, tradeData } = getPnlForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()
      const dateKey = date.toISOString().split('T')[0]
      const isHovered = hoveredDate === dateKey

      days.push(
        <React.Fragment key={day}>
          <div
            id={`calendar-day-${dateKey}`}
            onClick={() => handleDayClick(date)}
            onMouseEnter={() => trades > 0 && setHoveredDate(dateKey)}
            onMouseLeave={() => setHoveredDate(null)}
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

          {/* Hover Tooltip with Trade Summary */}
          {isHovered && trades > 0 && (() => {
            const element = document.getElementById(`calendar-day-${dateKey}`)
            const rect = element?.getBoundingClientRect()
            if (!rect) return null

            return createPortal(
              <div 
                className="fixed w-96 bg-krcard/98 backdrop-blur-xl border border-krgold/50 rounded-xl shadow-2xl p-4 z-[9999] pointer-events-none max-h-96 overflow-y-auto custom-scrollbar"
                style={{
                  left: `${rect.right + 16}px`,
                  top: `${rect.top}px`
                }}
              >
                <div className="mb-3 pb-3 border-b border-krborder/30">
                  <div className="text-sm text-krmuted mb-1">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  <div className={`text-2xl font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pnl >= 0 ? '+' : ''}{formatAmount(pnl)}
                  </div>
                  <div className="text-xs text-krmuted">{trades} trade{trades > 1 ? 's' : ''}</div>
                </div>

                {/* Trade List */}
                <div className="space-y-2">
                  {tradeData.map((trade: any, idx: number) => {
                    const netPnl = (trade.pnlAmount || 0) - (trade.fee || 0)
                    const isProfit = netPnl > 0
                    return (
                      <div key={idx} className="bg-krblack/40 rounded-lg p-3 border border-krborder/30">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-bold text-krtext">{trade.ticker}</div>
                            <div className="text-xs text-krmuted">{trade.time} → {trade.exitTime}</div>
                          </div>
                          <div className={`text-sm font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                            {isProfit ? '+' : ''}{formatAmount(netPnl)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-krmuted flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${trade.position === 'Long' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                            {trade.type} {trade.type === 'Futures' ? `${trade.leverage}x` : ''} • {trade.position}
                          </span>
                          <span className={`font-medium ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                            {isProfit ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>,
              document.body
            )
          })()}
        </React.Fragment>
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
            const { pnl, trades, tradeData } = getPnlForDate(date)
            const isToday = date.toDateString() === new Date().toDateString()
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
            const dayNum = date.getDate()
            const dateKey = date.toISOString().split('T')[0]
            const isHovered = hoveredDate === dateKey

            return (
              <React.Fragment key={index}>
                <div
                  id={`calendar-day-${dateKey}`}
                  onClick={() => handleDayClick(date)}
                  onMouseEnter={() => trades > 0 && setHoveredDate(dateKey)}
                  onMouseLeave={() => setHoveredDate(null)}
                  className={`border border-krborder rounded-lg p-4 ${
                    isToday ? 'ring-2 ring-krgold' : ''
                  } ${trades > 0 ? 'bg-krblack/50 cursor-pointer hover:bg-krblack/70 transition-colors' : 'bg-krcard/30'}`}
                >
                <div className="text-center mb-3">
                  <div className="text-xs text-gray-400 mb-1">{dayName}</div>
                  <div className="text-2xl font-bold">{dayNum}</div>
                </div>
                {trades > 0 && (
                  <div className="text-center">
                    <div className={`text-sm font-semibold ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {pnl >= 0 ? '+' : ''}{pnl.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-500">{trades} trade{trades > 1 ? 's' : ''}</div>
                  </div>
                )}
              </div>

              {/* Hover Tooltip with Trade Summary */}
              {isHovered && trades > 0 && (() => {
                const element = document.getElementById(`calendar-day-${dateKey}`)
                const rect = element?.getBoundingClientRect()
                if (!rect) return null

                return createPortal(
                  <div 
                    className="fixed w-96 bg-krcard/98 backdrop-blur-xl border border-krgold/50 rounded-xl shadow-2xl p-4 z-[9999] pointer-events-none max-h-96 overflow-y-auto custom-scrollbar"
                    style={{
                      left: `${rect.right + 16}px`,
                      top: `${rect.top}px`
                    }}
                  >
                    <div className="mb-3 pb-3 border-b border-krborder/30">
                      <div className="text-sm text-krmuted mb-1">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                      <div className={`text-2xl font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}{formatAmount(pnl)}
                      </div>
                      <div className="text-xs text-krmuted">{trades} trade{trades > 1 ? 's' : ''}</div>
                    </div>

                    {/* Trade List */}
                    <div className="space-y-2">
                      {tradeData.map((trade: any, idx: number) => {
                        const netPnl = (trade.pnlAmount || 0) - (trade.fee || 0)
                        const isProfit = netPnl > 0
                        return (
                          <div key={idx} className="bg-krblack/40 rounded-lg p-3 border border-krborder/30">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="font-bold text-krtext">{trade.ticker}</div>
                                <div className="text-xs text-krmuted">{trade.time} → {trade.exitTime}</div>
                              </div>
                              <div className={`text-sm font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                {isProfit ? '+' : ''}{formatAmount(netPnl)}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-krmuted flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${trade.position === 'Long' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                {trade.type} {trade.type === 'Futures' ? `${trade.leverage}x` : ''} • {trade.position}
                              </span>
                              <span className={`font-medium ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                {isProfit ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>,
                  document.body
                )
              })()}
            </React.Fragment>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-krblack to-gray-950 text-krtext relative overflow-hidden">
      {/* Animated gradient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-krgold/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-kryellow/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📓</span>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">
              Trading Journal
            </h1>
          </div>
          <p className="text-krmuted text-sm md:text-base ml-14">
            Your complete trading record and performance analytics
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5">
            <div className="text-krmuted text-sm mb-1">Total Trades</div>
            <div className="text-3xl font-bold text-krgold">{totalTrades}</div>
          </div>
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5">
            <div className="text-krmuted text-sm mb-1">Win Rate</div>
            <div className="text-3xl font-bold text-green-400">{winRate}%</div>
            <div className="text-xs text-krmuted mt-1">{wins}W / {losses}L</div>
          </div>
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5">
            <div className="text-krmuted text-sm mb-1">Total PnL</div>
            <div className={`text-3xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatAmount(totalPnl)}
            </div>
          </div>
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5">
            <div className="text-krmuted text-sm mb-1">Active Positions</div>
            <div className="text-3xl font-bold text-krtext">
              {journal.filter(j => !j.exitPrice || j.exitPrice === 0).length}
            </div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Trade Analytics Section */}
          <Link 
            to="/journal/analytics"
            className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📊</span>
                <div>
                  <h2 className="text-lg font-semibold group-hover:text-krgold transition-colors">Trade Analytics</h2>
                  <p className="text-xs text-krmuted">Performance metrics & insights</p>
                </div>
              </div>
              <ArrowRight className="text-krmuted group-hover:text-krgold transition-colors" size={20} />
            </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-krblack/30 rounded-lg p-3">
              <div className="text-xs text-krmuted">Avg Win</div>
              <div className="text-base font-semibold text-green-400">
                {wins > 0 ? formatAmount(journal.filter(j => ((j.pnlAmount || 0) - (j.fee || 0)) > 0).reduce((s, j) => s + (j.pnlAmount || 0) - (j.fee || 0), 0) / wins) : formatAmount(0)}
              </div>
            </div>
            <div className="bg-krblack/30 rounded-lg p-3">
              <div className="text-xs text-krmuted">Avg Loss</div>
              <div className="text-base font-semibold text-red-400">
                {losses > 0 ? formatAmount(journal.filter(j => ((j.pnlAmount || 0) - (j.fee || 0)) < 0).reduce((s, j) => s + (j.pnlAmount || 0) - (j.fee || 0), 0) / losses) : formatAmount(0)}
              </div>
            </div>
            <div className="bg-krblack/30 rounded-lg p-3">
              <div className="text-xs text-krmuted">Risk/Reward</div>
              <div className="text-base font-semibold text-krgold">
                {wins > 0 && losses > 0 ? (Math.abs(journal.filter(j => ((j.pnlAmount || 0) - (j.fee || 0)) > 0).reduce((s, j) => s + (j.pnlAmount || 0) - (j.fee || 0), 0) / wins) / Math.abs(journal.filter(j => ((j.pnlAmount || 0) - (j.fee || 0)) < 0).reduce((s, j) => s + (j.pnlAmount || 0) - (j.fee || 0), 0) / losses)).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>
        </Link>

        {/* Recent Entries Section */}
        <Link 
          to="/journal/entries"
          className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📝</span>
              <div>
                <h2 className="text-lg font-semibold group-hover:text-krgold transition-colors">Recent Entries</h2>
                <p className="text-xs text-krmuted">Your latest trade logs</p>
              </div>
            </div>
            <ArrowRight className="text-krmuted group-hover:text-krgold transition-colors" size={20} />
          </div>
          <div className="space-y-2">
            {recentEntries.length === 0 ? (
              <div className="text-center py-4 text-krmuted">No entries yet</div>
            ) : (
              recentEntries.slice(0, 3).map(entry => {
                const netPnl = (entry.pnlAmount || 0) - (entry.fee || 0)
                return (
                  <div key={entry.id} className="bg-krblack/30 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{entry.ticker}</div>
                      <div className="text-xs text-krmuted">{entry.date}</div>
                    </div>
                    <div className={`font-semibold ${netPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${netPnl.toFixed(2)}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Link>
      </div>

      {/* Insights Section */}
      <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">💡</span>
          <h2 className="text-lg font-semibold">Quick Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-krblack/30 rounded-lg p-4">
            <div className="text-sm text-krmuted mb-2">Most Traded Pair</div>
            <div className="text-lg font-semibold">
              {journal.length > 0 
                ? Object.entries(journal.reduce((acc: any, j) => {acc[j.ticker] = (acc[j.ticker] || 0) + 1; return acc}, {}))
                    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'
                : 'N/A'}
            </div>
          </div>
          <div className="bg-krblack/30 rounded-lg p-4">
            <div className="text-sm text-krmuted mb-2">Best Performing Day</div>
            <div className="text-lg font-semibold text-green-400">
              $
              {journal.length > 0
                ? (Object.entries(journal.reduce((acc: any, j) => {
                    const date = j.date?.split('T')[0] || j.date
                    // Subtract fee from pnlAmount for each trade
                    acc[date] = (acc[date] || 0) + (j.pnlAmount || 0) - (j.fee || 0)
                    return acc
                  }, {}))
                  .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[1] as number || 0).toFixed(2)
                : '0.00'}
            </div>
          </div>
          <div className="bg-krblack/30 rounded-lg p-4">
            <div className="text-sm text-krmuted mb-2">Current Streak</div>
            <div className="text-lg font-semibold text-krgold">
              {(() => {
                let streak = 0
                for (let i = journal.length - 1; i >= 0; i--) {
                  const netPnl = (journal[i].pnlAmount || 0) - (journal[i].fee || 0)
                  if (netPnl > 0) streak++
                  else break
                }
                return `${streak} ${streak === 1 ? 'Win' : 'Wins'}`
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* PNL Calendar Section */}
      <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
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

      {/* Trade Details Modal */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-krcard/95 backdrop-blur-xl border border-krborder/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-krcard/95 backdrop-blur-xl border-b border-krborder/50 p-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-krtext">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                <p className="text-krmuted text-sm mt-1">Trade Details</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-krgold/20 rounded-lg transition-colors"
              >
                <X size={20} className="text-krmuted hover:text-krtext" />
              </button>
            </div>
            
            <div className="p-5">
              {(() => {
                const { pnl, trades, tradeData } = getPnlForDate(selectedDate)
                const dayWins = tradeData.filter((t: any) => ((t.pnlAmount || 0) - (t.fee || 0)) > 0).length
                const dayLosses = tradeData.filter((t: any) => ((t.pnlAmount || 0) - (t.fee || 0)) < 0).length
                
                return (
                  <>
                    {/* Day Summary */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="bg-krblack/40 rounded-lg p-3 text-center border border-krborder/30">
                        <p className="text-xs text-krmuted mb-1">Total PnL</p>
                        <p className={`text-xl font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatAmount(pnl)}
                        </p>
                      </div>
                      <div className="bg-krblack/40 rounded-lg p-3 text-center border border-krborder/30">
                        <p className="text-xs text-krmuted mb-1">Total Trades</p>
                        <p className="text-xl font-bold text-krtext">{trades}</p>
                      </div>
                      <div className="bg-krblack/40 rounded-lg p-3 text-center border border-krborder/30">
                        <p className="text-xs text-krmuted mb-1">Win Rate</p>
                        <p className={`text-xl font-bold ${dayWins / trades >= 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                          {((dayWins / trades) * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    {/* Trade List */}
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold mb-3 text-krtext">Trades ({trades})</h3>
                      {tradeData.map((trade: any) => {
                        const netPnl = (trade.pnlAmount || 0) - (trade.fee || 0)
                        return (
                          <div key={trade.id} className="bg-krblack/40 rounded-lg p-4 border border-krborder/30 hover:border-krgold/50 transition-all">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-base font-semibold text-krtext">{trade.ticker}</h4>
                                  {netPnl >= 0 ? (
                                    <TrendingUp className="text-green-400" size={18} />
                                  ) : (
                                    <TrendingDown className="text-red-500" size={20} />
                                  )}
                                </div>
                                <div className="text-sm text-gray-400 mt-1">
                                  {trade.strategy || 'No strategy specified'}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-xl font-bold ${netPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {netPnl >= 0 ? '+' : ''}{formatAmount(netPnl)}
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
                              {trade.marginCost > 0 && (
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
                            </div>
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
      </div>
    </div>
  )
}
