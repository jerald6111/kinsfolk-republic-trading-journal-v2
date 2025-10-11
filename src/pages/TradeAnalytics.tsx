import React, { useState } from 'react'
import { loadData } from '../utils/storage'
import { BarChart3, TrendingUp, TrendingDown, Activity, DollarSign, Percent, Target, Calendar, ChevronLeft, ChevronRight, X, Info, Clock, Flame, Shield } from 'lucide-react'
import { useCurrency } from '../context/CurrencyContext'

export default function TradeAnalytics() {
  const data = loadData()
  const { formatAmount } = useCurrency()
  const journal = data.journal || []
  const wallet = data.wallet || []
  
  const [calendarView, setCalendarView] = useState<'monthly' | 'weekly'>('monthly')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showDurationInfo, setShowDurationInfo] = useState(false)
  const [exposureFilter, setExposureFilter] = useState<'All' | 'Spot' | 'Futures'>('All')
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  const [showTickerModal, setShowTickerModal] = useState(false)
  
  const totalTrades = journal.length
  const wins = journal.filter(j => j.pnlAmount > 0).length
  const losses = journal.filter(j => j.pnlAmount < 0).length
  const winRate = totalTrades ? Math.round((wins / totalTrades) * 100) : 0
  // Total PnL = sum of (pnlAmount - fee) for each trade
  const totalPnl = journal.reduce((s, j) => s + (j.pnlAmount || 0) - (j.fee || 0), 0)
  
  const avgWin = wins > 0 ? journal.filter(j => j.pnlAmount > 0).reduce((s, j) => s + j.pnlAmount - (j.fee || 0), 0) / wins : 0
  const avgLoss = losses > 0 ? journal.filter(j => j.pnlAmount < 0).reduce((s, j) => s + j.pnlAmount - (j.fee || 0), 0) / losses : 0
  const riskReward = wins > 0 && losses > 0 ? Math.abs(avgWin / avgLoss) : 0
  
  const profitFactor = losses > 0 && avgLoss !== 0
    ? (wins * avgWin) / (losses * Math.abs(avgLoss))
    : wins > 0 ? Infinity : 0

  // Calculate ROI based on wallet deposits/withdrawals
  const totalDeposits = wallet.filter((w: any) => w.type === 'deposit').reduce((s: number, w: any) => s + Number(w.amount), 0)
  const totalWithdrawals = wallet.filter((w: any) => w.type === 'withdrawal').reduce((s: number, w: any) => s + Number(w.amount), 0)
  const walletBalance = totalDeposits - totalWithdrawals
  const currentBalance = walletBalance + totalPnl
  // ROI = ((Current Balance - Total Deposits + Total Withdrawals) / Total Deposits) × 100
  const roi = totalDeposits > 0 ? ((currentBalance - totalDeposits + totalWithdrawals) / totalDeposits) * 100 : 0

  // Calculate Average Trade Duration
  const tradeDurations = journal.map((j: any) => {
    const entryTime = new Date(`${j.date} ${j.time || '00:00:00'}`).getTime()
    const exitTime = new Date(`${j.exitDate || j.date} ${j.exitTime || j.time || '00:00:00'}`).getTime()
    return exitTime - entryTime
  }).filter(d => d > 0)
  const avgDuration = tradeDurations.length > 0 ? tradeDurations.reduce((a, b) => a + b, 0) / tradeDurations.length : 0
  const avgDurationHours = avgDuration / (1000 * 60 * 60)
  const avgDurationDays = avgDurationHours / 24

  // Determine trader type based on average duration
  const getTraderType = (hours: number) => {
    if (hours < 1) return { type: 'Scalper', color: 'text-purple-400' }
    if (hours < 24) return { type: 'Day Trader', color: 'text-blue-400' }
    if (hours < 168) return { type: 'Swing Trader', color: 'text-green-400' }
    return { type: 'Position Trader', color: 'text-orange-400' }
  }
  const traderType = getTraderType(avgDurationHours)

  // Calculate Win/Loss Streaks
  const calculateStreaks = () => {
    let currentStreak = 0
    let longestWinStreak = 0
    let longestLossStreak = 0
    let currentWinStreak = 0
    let currentLossStreak = 0

    // Sort trades by exit date/time
    const sortedTrades = [...journal].sort((a, b) => {
      const dateA = new Date(`${a.exitDate || a.date} ${a.exitTime || a.time}`).getTime()
      const dateB = new Date(`${b.exitDate || b.date} ${b.exitTime || b.time}`).getTime()
      return dateA - dateB
    })

    sortedTrades.forEach((trade: any) => {
      const netPnl = (trade.pnlAmount || 0) - (trade.fee || 0)
      
      if (netPnl > 0) {
        currentWinStreak++
        currentLossStreak = 0
        longestWinStreak = Math.max(longestWinStreak, currentWinStreak)
      } else if (netPnl < 0) {
        currentLossStreak++
        currentWinStreak = 0
        longestLossStreak = Math.max(longestLossStreak, currentLossStreak)
      }
    })

    // Current streak
    if (sortedTrades.length > 0) {
      const lastTrade = sortedTrades[sortedTrades.length - 1]
      const lastNetPnl = (lastTrade.pnlAmount || 0) - (lastTrade.fee || 0)
      currentStreak = lastNetPnl > 0 ? currentWinStreak : lastNetPnl < 0 ? -currentLossStreak : 0
    }

    return { currentStreak, longestWinStreak, longestLossStreak }
  }
  const streaks = calculateStreaks()

  // Setup Performance Breakdown
  const setupPerformance = journal.reduce((acc: any, trade: any) => {
    const setup = trade.setup && trade.setup.trim() !== '' ? trade.setup : 'Unknown'
    if (!acc[setup]) {
      acc[setup] = { trades: 0, wins: 0, losses: 0, totalPnl: 0 }
    }
    acc[setup].trades++
    const netPnl = (trade.pnlAmount || 0) - (trade.fee || 0)
    acc[setup].totalPnl += netPnl
    if (netPnl > 0) acc[setup].wins++
    else if (netPnl < 0) acc[setup].losses++
    return acc
  }, {})

  const topSetups = Object.entries(setupPerformance)
    .map(([setup, stats]: any) => ({
      setup,
      ...stats,
      winRate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0,
      avgPnl: stats.trades > 0 ? stats.totalPnl / stats.trades : 0
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl)
    .slice(0, 5)

  // Leverage Usage Analysis
  const leverageData = journal
    .filter((j: any) => j.type === 'Futures' && j.leverage)
    .reduce((acc: any, trade: any) => {
      const lev = trade.leverage
      if (!acc[lev]) {
        acc[lev] = { count: 0, totalPnl: 0, wins: 0, losses: 0 }
      }
      acc[lev].count++
      const netPnl = (trade.pnlAmount || 0) - (trade.fee || 0)
      acc[lev].totalPnl += netPnl
      if (netPnl > 0) acc[lev].wins++
      else if (netPnl < 0) acc[lev].losses++
      return acc
    }, {})

  const avgLeverage = journal.filter((j: any) => j.type === 'Futures' && j.leverage).length > 0
    ? journal.filter((j: any) => j.type === 'Futures' && j.leverage).reduce((s: number, j: any) => s + (j.leverage || 0), 0) /
      journal.filter((j: any) => j.type === 'Futures' && j.leverage).length
    : 0

  // Group trades by ticker
  const tickerPerformance = journal.reduce((acc: any, trade) => {
    if (!acc[trade.ticker]) {
      acc[trade.ticker] = { trades: 0, pnl: 0, wins: 0, losses: 0, spotTrades: 0, futuresTrades: 0 }
    }
    acc[trade.ticker].trades++
    if (trade.type === 'Spot') acc[trade.ticker].spotTrades++
    if (trade.type === 'Futures') acc[trade.ticker].futuresTrades++
    // Subtract fee from pnl for ticker performance
    acc[trade.ticker].pnl += (trade.pnlAmount || 0) - (trade.fee || 0)
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
      // Handle both date formats (YYYY-MM-DD)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-krblack to-gray-950 text-krtext relative overflow-hidden">
      {/* Animated gradient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-krgold/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-kryellow/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 p-4 md:p-6">
      {/* Header with Gradient */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">📊</span>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">Trade Analytics</h1>
            <p className="text-krmuted text-sm mt-1">Comprehensive analysis of your trading performance</p>
          </div>
        </div>

        {/* Key Performance Metrics - 5 columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4 hover:border-krgold/50 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="text-blue-400" size={16} />
              <p className="text-xs text-krmuted">Total Trades</p>
            </div>
            <p className="text-2xl font-bold text-krtext">{totalTrades}</p>
            <p className="text-xs text-krmuted mt-1">{wins}W / {losses}L</p>
          </div>

          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4 hover:border-krgold/50 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="text-purple-400" size={16} />
              <p className="text-xs text-krmuted">Win Rate</p>
            </div>
            <p className={`text-2xl font-bold ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {winRate}%
            </p>
            <p className="text-xs text-krmuted mt-1">
              {winRate >= 50 ? '✓ Above avg' : '⚠ Improve'}
            </p>
          </div>

          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4 hover:border-krgold/50 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="text-krgold" size={16} />
              <p className="text-xs text-krmuted">Total PnL</p>
            </div>
            <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatAmount(totalPnl)}
            </p>
            <p className="text-xs text-krmuted mt-1">
              {totalTrades > 0 ? formatAmount(totalPnl / totalTrades) : formatAmount(0)} avg
            </p>
          </div>

          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4 hover:border-krgold/50 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-green-400" size={16} />
              <p className="text-xs text-krmuted">ROI</p>
            </div>
            <p className={`text-2xl font-bold ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
            </p>
            <p className="text-xs text-krmuted mt-1">
              on {formatAmount(totalDeposits)}
            </p>
          </div>

          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4 hover:border-krgold/50 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-orange-400" size={16} />
              <p className="text-xs text-krmuted">Profit Factor</p>
            </div>
            <p className={`text-2xl font-bold ${profitFactor >= 1.5 ? 'text-green-400' : profitFactor >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
              {profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}
            </p>
            <p className="text-xs text-krmuted mt-1">
              {profitFactor >= 1.5 ? '✓ Excellent' : profitFactor >= 1 ? '~ Good' : '⚠ Poor'}
            </p>
          </div>
        </div>

        {/* Secondary Metrics - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-green-400" size={18} />
              <h3 className="text-sm font-semibold text-krtext">Average Win</h3>
            </div>
            <p className="text-xl font-bold text-green-400 mb-1">
              {formatAmount(avgWin)}
            </p>
            <p className="text-xs text-krmuted">
              Across {wins} winning trades
            </p>
          </div>

          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="text-red-400" size={18} />
              <h3 className="text-sm font-semibold text-krtext">Average Loss</h3>
            </div>
            <p className="text-xl font-bold text-red-400 mb-1">
              {formatAmount(avgLoss)}
            </p>
            <p className="text-xs text-krmuted">
              Across {losses} losing trades
            </p>
          </div>

          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="text-krgold" size={18} />
              <h3 className="text-sm font-semibold text-krtext">Risk/Reward</h3>
            </div>
            <p className="text-xl font-bold text-krgold mb-1">
              1:{riskReward.toFixed(2)}
            </p>
            <p className="text-xs text-krmuted">
              {riskReward >= 2 ? '✓ Excellent' : riskReward >= 1 ? '~ Good' : '⚠ Improve'}
            </p>
          </div>
        </div>
      </div>

      {/* ========== SECTION 2: TRADING BEHAVIOR & STREAKS ========== */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🔥</span>
          <h2 className="text-xl font-semibold text-krtext">Trading Behavior & Streaks</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Average Trade Duration */}
        <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4 hover:border-krgold/50 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-blue-400" size={18} />
            <h3 className="text-sm font-semibold text-krtext">Avg Duration</h3>
            <button
              onClick={() => setShowDurationInfo(!showDurationInfo)}
              className="ml-auto p-1 hover:bg-krgold/20 rounded-full transition-colors"
            >
              <Info size={14} className="text-krmuted" />
            </button>
          </div>
          <p className={`text-xl font-bold ${traderType.color} mb-1`}>
            {avgDurationDays >= 1
              ? `${avgDurationDays.toFixed(1)}d`
              : `${avgDurationHours.toFixed(1)}h`}
          </p>
          <p className="text-xs text-krmuted">{traderType.type}</p>
          {showDurationInfo && (
            <div className="mt-3 p-2 bg-krblack/50 rounded-lg text-xs space-y-1 border border-krborder/30">
              <div><strong className="text-purple-400">Scalper:</strong> &lt;1h</div>
              <div><strong className="text-blue-400">Day Trader:</strong> &lt;24h</div>
              <div><strong className="text-green-400">Swing:</strong> 1-7d</div>
              <div><strong className="text-orange-400">Position:</strong> &gt;7d</div>
            </div>
          )}
        </div>

        {/* Current Streak */}
        <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4 hover:border-krgold/50 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Flame className={streaks.currentStreak > 0 ? 'text-green-400' : 'text-red-400'} size={18} />
            <h3 className="text-sm font-semibold text-krtext">Current Streak</h3>
          </div>
          <p className={`text-xl font-bold mb-1 ${streaks.currentStreak > 0 ? 'text-green-400' : streaks.currentStreak < 0 ? 'text-red-400' : 'text-krmuted'}`}>
            {streaks.currentStreak > 0 ? `+${streaks.currentStreak}` : streaks.currentStreak}
          </p>
          <p className="text-xs text-krmuted">
            {streaks.currentStreak > 0 ? 'Wins' : streaks.currentStreak < 0 ? 'Losses' : 'No streak'}
          </p>
        </div>

        {/* Longest Win Streak */}
        <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4 hover:border-krgold/50 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-green-400" size={18} />
            <h3 className="text-sm font-semibold text-krtext">Best Win Streak</h3>
          </div>
          <p className="text-xl font-bold text-green-400 mb-1">
            {streaks.longestWinStreak}
          </p>
          <p className="text-xs text-krmuted">Consecutive wins</p>
        </div>

        {/* Longest Loss Streak */}
        <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4 hover:border-krgold/50 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="text-red-400" size={18} />
            <h3 className="text-sm font-semibold text-krtext">Worst Loss Streak</h3>
          </div>
          <p className="text-xl font-bold text-red-400 mb-1">
            {streaks.longestLossStreak}
          </p>
          <p className="text-xs text-krmuted">Consecutive losses</p>
        </div>
        </div>
      </div>

      {/* ========== SECTION 3: STRATEGY PERFORMANCE ========== */}
      {topSetups.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🎯</span>
            <h2 className="text-xl font-semibold text-krtext">Strategy Performance</h2>
          </div>
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-5">
          <div className="space-y-3">
            {topSetups.map((setup: any, index) => (
              <div key={index} className="bg-krblack/40 rounded-lg p-4 border border-krborder/30 hover:border-krgold/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-base text-krtext">{setup.setup}</div>
                  <div className={`text-lg font-bold ${setup.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatAmount(setup.totalPnl)}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Trades</div>
                    <div className="font-medium">{setup.trades}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Win Rate</div>
                    <div className={`font-medium ${setup.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                      {setup.winRate.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Avg P&L</div>
                    <div className={`font-medium ${setup.avgPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatAmount(setup.avgPnl)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">W/L</div>
                    <div className="font-medium">{setup.wins}/{setup.losses}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      )}

      {/* ========== SECTION 4: RISK MANAGEMENT ========== */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🛡️</span>
          <h2 className="text-xl font-semibold text-krtext">Risk Management</h2>
        </div>
        <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Average Risk per Trade */}
          <div className="bg-krblack/30 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Avg Risk per Trade</div>
            <div className="text-xl font-bold text-krtext">
              {journal.length > 0
                ? formatAmount(journal.reduce((s: number, j: any) => s + (j.marginCost || 0), 0) / journal.length)
                : '$0.00'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {totalDeposits > 0 && journal.length > 0
                ? `${((journal.reduce((s: number, j: any) => s + (j.marginCost || 0), 0) / journal.length / totalDeposits) * 100).toFixed(2)}% of capital`
                : 'No data'}
            </div>
          </div>

          {/* Risk Consistency Score */}
          <div className="bg-krblack/30 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Risk Consistency</div>
            <div className="text-xl font-bold text-krtext">
              {(() => {
                const marginCosts = journal.map((j: any) => j.marginCost || 0).filter(m => m > 0)
                if (marginCosts.length < 2) return 'N/A'
                const avg = marginCosts.reduce((a, b) => a + b, 0) / marginCosts.length
                const variance = marginCosts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / marginCosts.length
                const stdDev = Math.sqrt(variance)
                const cv = avg > 0 ? (stdDev / avg) * 100 : 0
                const score = Math.max(0, 100 - cv)
                return `${score.toFixed(0)}%`
              })()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {(() => {
                const marginCosts = journal.map((j: any) => j.marginCost || 0).filter(m => m > 0)
                if (marginCosts.length < 2) return 'Need more trades'
                const avg = marginCosts.reduce((a, b) => a + b, 0) / marginCosts.length
                const variance = marginCosts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / marginCosts.length
                const stdDev = Math.sqrt(variance)
                const cv = avg > 0 ? (stdDev / avg) * 100 : 0
                const score = Math.max(0, 100 - cv)
                return score >= 70 ? 'Consistent' : score >= 50 ? 'Moderate' : 'Inconsistent'
              })()}
            </div>
          </div>

          {/* Reward-to-Risk Ratio */}
          <div className="bg-krblack/30 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Reward-to-Risk</div>
            <div className="text-xl font-bold text-krgold">
              {(() => {
                const avgRisk = journal.length > 0
                  ? journal.reduce((s: number, j: any) => s + (j.marginCost || 0), 0) / journal.length
                  : 0
                const avgReward = totalTrades > 0 ? totalPnl / totalTrades : 0
                const ratio = avgRisk > 0 ? Math.abs(avgReward / avgRisk) : 0
                return ratio.toFixed(2)
              })()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {(() => {
                const avgRisk = journal.length > 0
                  ? journal.reduce((s: number, j: any) => s + (j.marginCost || 0), 0) / journal.length
                  : 0
                const avgReward = totalTrades > 0 ? totalPnl / totalTrades : 0
                const ratio = avgRisk > 0 ? Math.abs(avgReward / avgRisk) : 0
                return ratio >= 2 ? 'Excellent' : ratio >= 1 ? 'Good' : 'Poor'
              })()}
            </div>
          </div>

          {/* Win/Loss Consistency */}
          <div className="bg-krblack/30 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">PnL Consistency</div>
            <div className="text-xl font-bold text-krtext">
              {(() => {
                const pnls = journal.map((j: any) => (j.pnlAmount || 0) - (j.fee || 0))
                if (pnls.length < 2) return 'N/A'
                const avg = pnls.reduce((a, b) => a + b, 0) / pnls.length
                const variance = pnls.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / pnls.length
                const stdDev = Math.sqrt(variance)
                return formatAmount(stdDev)
              })()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Std deviation</div>
          </div>
        </div>
        </div>
      </div>

      {/* ========== SECTION 5: PAIR ANALYSIS ========== */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📈</span>
          <h2 className="text-xl font-semibold text-krtext">Pair & Market Analysis</h2>
        </div>
        {/* Exposure by Pair and Top 5 Performing Pairs - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Exposure by Pair/Coin */}
        <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Exposure by Pair</h2>
            <div className="flex gap-1 bg-krblack/30 rounded-lg p-1">
              {(['All', 'Spot', 'Futures'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setExposureFilter(filter)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    exposureFilter === filter
                      ? 'bg-krgold text-krblack font-semibold'
                      : 'text-gray-400 hover:text-krtext'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {(() => {
              // Filter tickers based on exposure filter
              const filteredTickers = Object.entries(tickerPerformance).filter(([ticker, stats]: any) => {
                if (exposureFilter === 'Spot') return stats.spotTrades > 0
                if (exposureFilter === 'Futures') return stats.futuresTrades > 0
                return true
              })
              
              const sortedTickers = filteredTickers.sort(([, a]: any, [, b]: any) => b.trades - a.trades)
              const totalFilteredTrades = exposureFilter === 'All' 
                ? totalTrades 
                : journal.filter((j: any) => j.type === exposureFilter).length
              
              return sortedTickers.map(([ticker, stats]: any) => {
                const percentage = totalFilteredTrades > 0 ? (stats.trades / totalFilteredTrades) * 100 : 0
                return (
                  <div key={ticker} className="bg-krblack/30 rounded-lg p-3 hover:bg-krblack/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedTicker(ticker)
                      setShowTickerModal(true)
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{ticker}</span>
                      <div className="text-sm">
                        <span className="text-gray-400">{stats.trades} trades </span>
                        <span className="text-gray-500">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="relative h-2 bg-krblack rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-krgold to-kryellow"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-krcard backdrop-blur-sm rounded-xl border border-krborder p-6">
          <h2 className="text-xl font-semibold mb-4">Top 5 Performing Pairs</h2>
          {topPerformers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No trading data available</div>
          ) : (
            <div className="space-y-3">
              {topPerformers.map(([ticker, stats]: any, index) => (
                <div 
                  key={ticker} 
                  className="bg-krblack/30 rounded-lg p-4 flex items-center justify-between hover:bg-krblack/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedTicker(ticker)
                    setShowTickerModal(true)
                  }}
                >
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
        </div>
      </div>

      {/* ========== SECTION 6: EQUITY CURVE ========== */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">💹</span>
          <h2 className="text-xl font-semibold text-krtext">Performance Over Time</h2>
        </div>
      {/* Visualization Charts */}
      <div>
        {/* PnL Over Time - Equity Curve - Full Width */}
        <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-5 hover:border-krgold/50 transition-all">
          <h3 className="text-base font-semibold mb-4 text-krtext">PnL Over Time (Equity Curve)</h3>
          {journal.length === 0 ? (
            <div className="bg-krblack/50 rounded-lg p-8 text-center border border-krborder/30">
              <span className="text-5xl mb-3 block">📊</span>
              <p className="text-krmuted">No trading data available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Build cumulative PnL over time */}
              {(() => {
                // Sort trades by exit date/time
                const sortedTrades = [...journal].sort((a, b) => {
                  const dateA = new Date(`${a.exitDate || a.date} ${a.exitTime || a.time}`).getTime()
                  const dateB = new Date(`${b.exitDate || b.date} ${b.exitTime || b.time}`).getTime()
                  return dateA - dateB
                })
                
                let cumulative = walletBalance
                const points = sortedTrades.map((trade, idx) => {
                  const netPnl = (trade.pnlAmount || 0) - (trade.fee || 0)
                  cumulative += netPnl
                  return { cumulative, trade, idx }
                })
                
                const maxPnl = Math.max(...points.map(p => p.cumulative), walletBalance)
                const minPnl = Math.min(...points.map(p => p.cumulative), walletBalance)
                const range = maxPnl - minPnl || 1
                
                return (
                  <>
                    <div className="text-sm text-krmuted mb-3">
                      Starting Balance: {formatAmount(walletBalance)} → Current: {formatAmount(currentBalance)}
                    </div>
                    <div className="relative h-80 bg-krblack/40 rounded-lg p-4 border border-krborder/30">
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-500">
                        <div>{formatAmount(maxPnl)}</div>
                        <div>{formatAmount((maxPnl + minPnl) / 2)}</div>
                        <div>{formatAmount(minPnl)}</div>
                      </div>
                      
                      {/* Chart area */}
                      <div className="ml-16 h-full relative">
                        {/* Zero line */}
                        {walletBalance >= minPnl && walletBalance <= maxPnl && (
                          <div 
                            className="absolute left-0 right-0 border-t border-gray-600 border-dashed"
                            style={{ top: `${((maxPnl - walletBalance) / range) * 100}%` }}
                          >
                            <span className="text-xs text-gray-500 absolute -top-2 right-0">Start</span>
                          </div>
                        )}
                        
                        {/* Line chart */}
                        <svg className="w-full h-full" preserveAspectRatio="none">
                          {/* Draw line segments */}
                          {points.map((point, i) => {
                            if (i === 0) {
                              // First segment from starting balance to first trade
                              const x1 = 0
                              const y1 = ((maxPnl - walletBalance) / range) * 100
                              const x2 = ((i + 1) / points.length) * 100
                              const y2 = ((maxPnl - point.cumulative) / range) * 100
                              const color = point.cumulative >= walletBalance ? '#22c55e' : '#ef4444'
                              return (
                                <line
                                  key={i}
                                  x1={`${x1}%`}
                                  y1={`${y1}%`}
                                  x2={`${x2}%`}
                                  y2={`${y2}%`}
                                  stroke={color}
                                  strokeWidth="2"
                                />
                              )
                            }
                            const prev = points[i - 1]
                            const x1 = (i / points.length) * 100
                            const y1 = ((maxPnl - prev.cumulative) / range) * 100
                            const x2 = ((i + 1) / points.length) * 100
                            const y2 = ((maxPnl - point.cumulative) / range) * 100
                            const color = point.cumulative >= prev.cumulative ? '#22c55e' : '#ef4444'
                            return (
                              <line
                                key={i}
                                x1={`${x1}%`}
                                y1={`${y1}%`}
                                x2={`${x2}%`}
                                y2={`${y2}%`}
                                stroke={color}
                                strokeWidth="2"
                              />
                            )
                          })}
                          
                          {/* Draw points */}
                          {points.map((point, i) => {
                            const x = ((i + 1) / points.length) * 100
                            const y = ((maxPnl - point.cumulative) / range) * 100
                            const netPnl = (point.trade.pnlAmount || 0) - (point.trade.fee || 0)
                            const color = netPnl >= 0 ? '#22c55e' : '#ef4444'
                            return (
                              <circle
                                key={i}
                                cx={`${x}%`}
                                cy={`${y}%`}
                                r="3"
                                fill={color}
                                className="hover:r-5 cursor-pointer transition-all"
                              >
                                <title>{point.trade.ticker}: {formatAmount(netPnl)}</title>
                              </circle>
                            )
                          })}
                        </svg>
                      </div>
                    </div>
                    
                    {/* Drawdown Statistics */}
                    {(() => {
                      // Calculate drawdown
                      let peak = walletBalance
                      let maxDrawdown = 0
                      let currentDrawdown = 0
                      
                      points.forEach(point => {
                        if (point.cumulative > peak) {
                          peak = point.cumulative
                        }
                        currentDrawdown = peak > 0 ? ((peak - point.cumulative) / peak) * 100 : 0
                        if (currentDrawdown > maxDrawdown) {
                          maxDrawdown = currentDrawdown
                        }
                      })
                      
                      // Current drawdown
                      const currentPeak = Math.max(...points.map(p => p.cumulative), walletBalance)
                      const currentDD = currentPeak > 0 ? ((currentPeak - currentBalance) / currentPeak) * 100 : 0
                      
                      return (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div className="bg-krblack/40 rounded-lg p-3 border border-krborder/30">
                            <p className="text-xs text-krmuted mb-1">Max Drawdown</p>
                            <p className="text-sm font-bold text-red-400">-{maxDrawdown.toFixed(2)}%</p>
                          </div>
                          <div className="bg-krblack/40 rounded-lg p-3 border border-krborder/30">
                            <p className="text-xs text-krmuted mb-1">Current Drawdown</p>
                            <p className={`text-sm font-bold ${currentDD > 0 ? 'text-red-400' : 'text-green-400'}`}>
                              {currentDD > 0 ? `-${currentDD.toFixed(2)}%` : '0.00%'}
                            </p>
                          </div>
                        </div>
                      )
                    })()}
                  </>
                )
              })()}
            </div>
          )}
        </div>
      </div>
      </div>

      {/* ========== SECTION 7: PNL CALENDAR ========== */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📅</span>
          <h2 className="text-xl font-semibold text-krtext">PNL Calendar</h2>
        </div>
      {/* PNL Calendar */}
      <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
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
                const dayWins = tradeData.filter((t: any) => t.pnlAmount > 0).length
                const dayLosses = tradeData.filter((t: any) => t.pnlAmount < 0).length
                
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
                        const isWin = trade.pnlAmount >= 0
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

      {/* Ticker Details Modal */}
      {showTickerModal && selectedTicker && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowTickerModal(false)}>
          <div className="bg-krcard/95 backdrop-blur-xl border border-krborder/50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-krcard/95 backdrop-blur-xl border-b border-krborder/50 p-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-krtext">{selectedTicker}</h2>
                <p className="text-krmuted text-sm mt-1">All Trades</p>
              </div>
              <button
                onClick={() => setShowTickerModal(false)}
                className="p-2 hover:bg-krgold/20 rounded-lg transition-colors"
              >
                <X size={20} className="text-krmuted hover:text-krtext" />
              </button>
            </div>
            
            <div className="p-5">
              {(() => {
                const tickerTrades = journal.filter((j: any) => j.ticker === selectedTicker)
                const tickerStats = tickerPerformance[selectedTicker]
                const tickerWins = tickerTrades.filter((t: any) => (t.pnlAmount || 0) - (t.fee || 0) > 0).length
                const tickerLosses = tickerTrades.filter((t: any) => (t.pnlAmount || 0) - (t.fee || 0) < 0).length
                
                return (
                  <>
                    {/* Ticker Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                      <div className="bg-krblack/40 rounded-lg p-3 text-center border border-krborder/30">
                        <p className="text-xs text-krmuted mb-1">Total PnL</p>
                        <p className={`text-xl font-bold ${tickerStats.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatAmount(tickerStats.pnl)}
                        </p>
                      </div>
                      <div className="bg-krblack/40 rounded-lg p-3 text-center border border-krborder/30">
                        <p className="text-xs text-krmuted mb-1">Total Trades</p>
                        <p className="text-xl font-bold text-krtext">{tickerStats.trades}</p>
                      </div>
                      <div className="bg-krblack/40 rounded-lg p-3 text-center border border-krborder/30">
                        <p className="text-xs text-krmuted mb-1">Win Rate</p>
                        <p className={`text-xl font-bold ${tickerWins / tickerStats.trades >= 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                          {((tickerWins / tickerStats.trades) * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="bg-krblack/40 rounded-lg p-3 text-center border border-krborder/30">
                        <p className="text-xs text-krmuted mb-1">Avg PnL</p>
                        <p className={`text-xl font-bold ${tickerStats.pnl / tickerStats.trades >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatAmount(tickerStats.pnl / tickerStats.trades)}
                        </p>
                      </div>
                    </div>

                    {/* Trade List */}
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold mb-3 text-krtext">All Trades ({tickerStats.trades})</h3>
                      {tickerTrades.map((trade: any) => {
                        const netPnl = (trade.pnlAmount || 0) - (trade.fee || 0)
                        return (
                          <div key={trade.id} className="bg-krblack/30 rounded-lg p-4 border border-krborder hover:border-krgold/50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-lg font-semibold text-krtext">{trade.ticker}</h4>
                                  {netPnl >= 0 ? (
                                    <TrendingUp className="text-green-500" size={20} />
                                  ) : (
                                    <TrendingDown className="text-red-500" size={20} />
                                  )}
                                  <span className="text-sm text-gray-400">
                                    {trade.type} {trade.position}
                                    {trade.leverage && trade.leverage > 1 ? ` ${trade.leverage}x` : ''}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-400 mt-1">
                                  {trade.setup || 'No strategy'} • {trade.objective || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {trade.date} {trade.time} → {trade.exitDate || trade.date} {trade.exitTime || trade.time}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-xl font-bold ${netPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {netPnl >= 0 ? '+' : ''}{formatAmount(netPnl)}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {trade.pnlPercent ? `${trade.pnlPercent.toFixed(2)}%` : 'N/A'}
                                </div>
                              </div>
                            </div>
                            
                            {/* Trade Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              {trade.entryPrice && (
                                <div>
                                  <span className="text-gray-400">Entry: </span>
                                  <span className="text-krtext font-medium">{trade.entryPrice}</span>
                                </div>
                              )}
                              {trade.exitPrice && (
                                <div>
                                  <span className="text-gray-400">Exit: </span>
                                  <span className="text-krtext font-medium">{trade.exitPrice}</span>
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
    </div>
  )
}
