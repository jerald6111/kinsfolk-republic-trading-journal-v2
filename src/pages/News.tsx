import React, { useEffect, useRef } from 'react'
import { TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react'

// TradingView Widget Component
function TradingViewWidget({ type, title, icon }: { type: 'gainers' | 'losers' | 'active' | 'calendar', title: string, icon: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    container.innerHTML = '' // Clear previous content

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true

    if (type === 'calendar') {
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js'
      script.innerHTML = JSON.stringify({
        colorTheme: 'dark',
        isTransparent: true,
        width: '100%',
        height: '600',
        locale: 'en',
        importanceFilter: '0,1' // Medium to High importance
      })
    } else {
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js'
      const typeMap = {
        gainers: 'gainers',
        losers: 'losers',
        active: 'active'
      }
      script.innerHTML = JSON.stringify({
        colorTheme: 'dark',
        dateRange: '1D',
        exchange: 'US',
        showChart: true,
        locale: 'en',
        largeChartUrl: '',
        isTransparent: true,
        showSymbolLogo: false,
        showFloatingTooltip: false,
        width: '100%',
        height: '600',
        plotLineColorGrowing: 'rgba(251, 191, 36, 1)',
        plotLineColorFalling: 'rgba(251, 191, 36, 1)',
        gridLineColor: 'rgba(42, 46, 57, 0)',
        scaleFontColor: 'rgba(209, 212, 220, 1)',
        belowLineFillColorGrowing: 'rgba(251, 191, 36, 0.12)',
        belowLineFillColorFalling: 'rgba(251, 191, 36, 0.12)',
        belowLineFillColorGrowingBottom: 'rgba(251, 191, 36, 0)',
        belowLineFillColorFallingBottom: 'rgba(251, 191, 36, 0)',
        symbolActiveColor: 'rgba(251, 191, 36, 0.12)',
        tabs: [
          {
            title: typeMap[type],
            sortField: type === 'active' ? 'volume' : 'change',
            sortOrder: type === 'losers' ? 'asc' : 'desc'
          }
        ]
      })
    }

    container.appendChild(script)

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [type])

  return (
    <div className="bg-krcard backdrop-blur-sm rounded-xl shadow-sm border border-krborder p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="tradingview-widget-container">
        <div ref={containerRef} className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  )
}

export default function News() {
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!calendarRef.current) return

    const container = calendarRef.current
    container.innerHTML = ''

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      colorTheme: 'dark',
      isTransparent: true,
      width: '100%',
      height: '600',
      locale: 'en',
      importanceFilter: '0,1'
    })

    container.appendChild(script)

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-krcard/30 backdrop-blur-sm text-krtext p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Market News & Data</h1>
        <p className="text-gray-400 mt-2">Real-time market insights powered by TradingView</p>
      </div>

      {/* Market Movers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <TradingViewWidget 
          type="gainers" 
          title="Top Gainers" 
          icon={<TrendingUp className="text-green-500" size={24} />} 
        />
        <TradingViewWidget 
          type="losers" 
          title="Top Losers" 
          icon={<TrendingDown className="text-red-500" size={24} />} 
        />
        <TradingViewWidget 
          type="active" 
          title="Most Traded" 
          icon={<Activity className="text-krgold" size={24} />} 
        />
      </div>

      {/* Economic Calendar */}
      <div className="bg-krcard backdrop-blur-sm rounded-xl shadow-sm border border-krborder p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-krgold" size={24} />
          <h2 className="text-xl font-semibold">Economic Calendar</h2>
          <span className="text-sm text-gray-400 ml-2">(Medium to High Impact Events)</span>
        </div>
        <div className="tradingview-widget-container">
          <div ref={calendarRef} className="tradingview-widget-container__widget"></div>
        </div>
      </div>
    </div>
  )
}
