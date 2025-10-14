import React, { useEffect, useRef, useState } from 'react'

export default function MarketData() {
  const calendarRef = useRef<HTMLDivElement>(null)
  const heatmapRef = useRef<HTMLDivElement>(null)
  const cryptoScreenerRef = useRef<HTMLDivElement>(null)
  const mostVolatileRef = useRef<HTMLDivElement>(null)
  const gainersRef = useRef<HTMLDivElement>(null)
  const losersRef = useRef<HTMLDivElement>(null)
  const [heatmapMetric, setHeatmapMetric] = useState<'change' | 'volume' | 'open_interest'>('change')

  // Economic Calendar Widget
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
      height: '100%',
      locale: 'en',
      importanceFilter: '0,1',
      countryFilter: 'us,eu,gb,jp,cn,au'
    })
    container.appendChild(script)
    return () => { if (container) { container.innerHTML = '' } }
  }, [])

  // Crypto Heatmap Widget
  useEffect(() => {
    if (!heatmapRef.current) return
    const container = heatmapRef.current
    container.innerHTML = ''
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      dataSource: "Crypto",
      blockSize: heatmapMetric,
      blockColor: "change",
      locale: "en",
      symbolUrl: "",
      colorTheme: "dark",
      hasTopBar: false,
      isDataSetEnabled: false,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      width: "100%",
      height: "100%"
    })
    container.appendChild(script)
    return () => { if (container) { container.innerHTML = '' } }
  }, [heatmapMetric])

  // Crypto Screener Widget (Data Analysis) - Filtered by Binance, Bybit, OKX
  useEffect(() => {
    if (!cryptoScreenerRef.current) return
    const container = cryptoScreenerRef.current
    container.innerHTML = ''
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: "100%",
      defaultColumn: "overview",
      screener_type: "crypto_mkt",
      displayCurrency: "USD",
      colorTheme: "dark",
      locale: "en",
      isTransparent: true,
      showToolbar: true,
      filter: [
        { 
          left: "exchange", 
          operation: "match", 
          right: "BINANCE|BYBIT|OKX"
        }
      ]
    })
    container.appendChild(script)
    return () => { if (container) { container.innerHTML = '' } }
  }, [])

  // Most Volatile Widget
  useEffect(() => {
    if (!mostVolatileRef.current) return
    const container = mostVolatileRef.current
    container.innerHTML = ''
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: "100%",
      defaultColumn: "name",
      defaultScreen: "most_volatile",
      market: "crypto",
      showToolbar: true,
      colorTheme: "dark",
      locale: "en",
      isTransparent: true,
      screener_type: "crypto_mkt",
      displayCurrency: "USD",
      enableScrolling: true,
      filter: [
        { left: "exchange", operation: "equal", right: "BINANCE" },
        { left: "typespecs", operation: "has", right: "spot" }
      ],
      columns: [
        { id: "name", displayName: "Coin" },
        { id: "close", displayName: "Price" },
        { id: "change|1", displayName: "Change % 1m" },
        { id: "Recommend.All", displayName: "Tech Rating" }
      ]
    })
    container.appendChild(script)
    return () => { if (container) { container.innerHTML = '' } }
  }, [])

  // Top Gainers Widget
  useEffect(() => {
    if (!gainersRef.current) return
    const container = gainersRef.current
    container.innerHTML = ''
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: "100%",
      defaultColumn: "name",
      defaultScreen: "top_gainers",
      market: "crypto",
      showToolbar: true,
      colorTheme: "dark",
      locale: "en",
      isTransparent: true,
      screener_type: "crypto_mkt",
      displayCurrency: "USD",
      enableScrolling: true,
      filter: [
        { left: "exchange", operation: "equal", right: "BINANCE" },
        { left: "typespecs", operation: "has", right: "spot" }
      ],
      columns: [
        { id: "name", displayName: "Coin" },
        { id: "close", displayName: "Price" },
        { id: "change|1", displayName: "Change % 1m" },
        { id: "Recommend.All", displayName: "Tech Rating" }
      ]
    })
    container.appendChild(script)
    return () => { if (container) { container.innerHTML = '' } }
  }, [])

  // Top Losers Widget
  useEffect(() => {
    if (!losersRef.current) return
    const container = losersRef.current
    container.innerHTML = ''
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: "100%",
      defaultColumn: "name",
      defaultScreen: "top_losers",
      market: "crypto",
      showToolbar: true,
      colorTheme: "dark",
      locale: "en",
      isTransparent: true,
      screener_type: "crypto_mkt",
      displayCurrency: "USD",
      enableScrolling: true,
      filter: [
        { left: "exchange", operation: "equal", right: "BINANCE" },
        { left: "typespecs", operation: "has", right: "spot" }
      ],
      columns: [
        { id: "name", displayName: "Coin" },
        { id: "close", displayName: "Price" },
        { id: "change|1", displayName: "Change % 1m" },
        { id: "Recommend.All", displayName: "Tech Rating" }
      ]
    })
    container.appendChild(script)
    return () => { if (container) { container.innerHTML = '' } }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-krblack to-gray-950 text-krtext relative overflow-hidden">
      {/* Animated gradient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-krgold/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-kryellow/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">📊</span>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">
                Market Data Center
              </h1>
            </div>
            <p className="text-krmuted text-sm md:text-base ml-14">
              Real-time crypto market data and economic calendar
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="space-y-6">
            {/* Full Width: Cryptocurrency Data Analysis */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📈</span>
                  <h2 className="text-xl font-semibold text-krtext">Cryptocurrency Data Analysis</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-krgold/10 border border-krgold/30 rounded-lg">
                  <span className="text-xs font-semibold text-krgold">Binance</span>
                  <span className="text-xs text-krgold/50">•</span>
                  <span className="text-xs font-semibold text-krgold">Bybit</span>
                  <span className="text-xs text-krgold/50">•</span>
                  <span className="text-xs font-semibold text-krgold">OKX</span>
                </div>
              </div>
              <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-6 h-[700px]">
                <div ref={cryptoScreenerRef} className="h-full w-full"></div>
              </div>
            </div>

            {/* Full Width: Economic Calendar */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📅</span>
                <h2 className="text-xl font-semibold text-krtext">Economic Calendar</h2>
              </div>
              <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-6 h-[700px]">
                <div ref={calendarRef} className="h-full w-full"></div>
              </div>
            </div>

            {/* Two Column Row: Heatmap & Most Volatile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Crypto Heatmap */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔥</span>
                    <h2 className="text-xl font-semibold text-krtext">Market Heatmap</h2>
                  </div>
                  <select
                    value={heatmapMetric}
                    onChange={(e) => setHeatmapMetric(e.target.value as 'change' | 'volume' | 'open_interest')}
                    className="bg-krcard border border-krborder rounded-lg px-2 py-1 text-xs text-krtext focus:outline-none focus:border-krgold"
                  >
                    <option value="change">Change %</option>
                    <option value="volume">Volume</option>
                    <option value="open_interest">Open Interest</option>
                  </select>
                </div>
                <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-6 h-[600px]">
                  <div ref={heatmapRef} className="h-full w-full"></div>
                </div>
              </div>

              {/* Most Volatile */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">⚡</span>
                  <h2 className="text-xl font-semibold text-krtext">Most Volatile</h2>
                </div>
                <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-6 h-[600px]">
                  <div ref={mostVolatileRef} className="h-full w-full"></div>
                </div>
              </div>
            </div>

            {/* Two Column Row: Top Gainers & Top Losers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Crypto Gainers */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">🚀</span>
                  <h2 className="text-xl font-semibold text-krtext">Top Gainers</h2>
                </div>
                <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-6 h-[600px]">
                  <div ref={gainersRef} className="h-full w-full"></div>
                </div>
              </div>

              {/* Top Crypto Losers */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">🚨</span>
                  <h2 className="text-xl font-semibold text-krtext">Top Losers</h2>
                </div>
                <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-6 h-[600px]">
                  <div ref={losersRef} className="h-full w-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Sources Footer */}
          <div className="mt-8 pt-6 border-t border-krborder">
            <div className="text-xs text-krmuted text-center">
              <span className="font-semibold">Data Sources:</span> All market data powered by{' '}
              <span className="text-krgold font-medium">TradingView</span> • Real-time crypto analysis with live updates • Screener filtered to Binance, Bybit & OKX exchanges
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
