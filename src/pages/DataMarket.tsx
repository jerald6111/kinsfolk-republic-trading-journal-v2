import React, { useEffect, useRef } from 'react'

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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-krblack to-gray-950 text-krtext p-4 md:p-6 relative overflow-hidden">
      {/* Animated gradient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-krgold/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-kryellow/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📊</span>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">
              Data Market
            </h1>
          </div>
          <p className="text-krmuted text-sm md:text-base ml-14">
            Powered by TradingView - Professional crypto market analysis tools
          </p>
        </div>

        {/* Crypto Screener */}
        <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🔍</span>
            <div>
              <h2 className="text-lg font-semibold text-krtext">Perpetual Futures Screener</h2>
              <p className="text-xs text-krmuted">Binance • Bybit • OKX</p>
            </div>
          </div>
          <div className="tradingview-widget-container">
            <div ref={screenerRef} className="tradingview-widget-container__widget"></div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
