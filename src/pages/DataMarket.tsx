import React, { useEffect, useRef } from 'react'
import { Database, TrendingUp } from 'lucide-react'

export default function DataMarket() {
  const screenerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!screenerRef.current) return

    const container = screenerRef.current
    container.innerHTML = ''

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      width: '100%',
      height: '800',
      defaultColumn: 'overview',
      defaultScreen: 'general',
      market: 'crypto',
      showToolbar: true,
      colorTheme: 'dark',
      locale: 'en',
      isTransparent: true,
      largeChartUrl: '',
      // Pre-configured filter for Binance, Bybit, and OKX perpetuals
      symbols: [
        { s: 'BINANCE:BTCUSDT.P' },
        { s: 'BINANCE:ETHUSDT.P' },
        { s: 'BYBIT:BTCUSDT.P' },
        { s: 'BYBIT:ETHUSDT.P' },
        { s: 'OKX:BTCUSDT.P' },
        { s: 'OKX:ETHUSDT.P' }
      ],
      defaultExchange: 'BINANCE'
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
        <div className="flex items-center gap-3">
          <Database className="text-krgold" size={32} />
          <div>
            <h1 className="text-2xl font-bold">Data Market</h1>
            <p className="text-gray-400 mt-1">Powered by TradingView - Professional crypto market analysis tools</p>
          </div>
        </div>
      </div>

      {/* Crypto Screener */}
      <div className="bg-krcard backdrop-blur-sm rounded-xl shadow-sm border border-krborder p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-krgold" size={24} />
          <h2 className="text-xl font-semibold">Perpetual Futures Screener</h2>
          <span className="text-sm text-gray-400 ml-2">(Binance • Bybit • OKX)</span>
        </div>
        <div className="tradingview-widget-container">
          <div ref={screenerRef} className="tradingview-widget-container__widget"></div>
        </div>
      </div>
    </div>
  )
}
