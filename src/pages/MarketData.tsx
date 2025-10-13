import React, { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

// Crypto market data type
interface CryptoData {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  image: string
  market_cap_rank: number
}

export default function MarketData() {
  const calendarRef = useRef<HTMLDivElement>(null)
  const heatmapRef = useRef<HTMLDivElement>(null)
  const cryptoScreenerRef = useRef<HTMLDivElement>(null)
  const trendingRef = useRef<HTMLDivElement>(null)
  const [topGainers, setTopGainers] = useState<CryptoData[]>([])
  const [topLosers, setTopLosers] = useState<CryptoData[]>([])
  const [cryptoLoading, setCryptoLoading] = useState(true)
  const [gainersTimeframe, setGainersTimeframe] = useState<'1h' | '24h' | '7d'>('24h')
  const [losersTimeframe, setLosersTimeframe] = useState<'1h' | '24h' | '7d'>('24h')
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

  // Top Trending Coins Widget - Crypto Specific
  useEffect(() => {
    if (!trendingRef.current) return
    const container = trendingRef.current
    container.innerHTML = ''
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: "100%",
      defaultColumn: "overview",
      defaultScreen: "most_capitalized",
      market: "crypto",
      showToolbar: false,
      colorTheme: "dark",
      locale: "en",
      isTransparent: true,
      screener_type: "crypto_mkt",
      displayCurrency: "USD"
    })
    container.appendChild(script)
    return () => { if (container) { container.innerHTML = '' } }
  }, [])

  // Fetch crypto market data from CoinGecko API
  useEffect(() => {
    const fetchCryptoData = async () => {
      setCryptoLoading(true)
      try {
        const timestamp = Date.now()
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&price_change_percentage=1h,24h,7d&_t=${timestamp}`)
        const data = await response.json()
        if (!Array.isArray(data)) { throw new Error('Invalid API response') }
        
        const getChangeField = (timeframe: string) => {
          switch (timeframe) {
            case '1h': return 'price_change_percentage_1h_in_currency'
            case '24h': return 'price_change_percentage_24h'
            case '7d': return 'price_change_percentage_7d_in_currency'
            default: return 'price_change_percentage_24h'
          }
        }
        
        const gainersChangeField = getChangeField(gainersTimeframe)
        const gainersData = data.map(coin => ({ ...coin, price_change_percentage_24h: coin[gainersChangeField] || coin.price_change_percentage_24h || 0 }))
        const sortedGainers = [...gainersData].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        const gainers = sortedGainers.filter(coin => coin.price_change_percentage_24h > 0).slice(0, 10)
        setTopGainers(gainers)
        
        const losersChangeField = getChangeField(losersTimeframe)
        const losersData = data.map(coin => ({ ...coin, price_change_percentage_24h: coin[losersChangeField] || coin.price_change_percentage_24h || 0 }))
        const sortedLosers = [...losersData].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
        const losers = sortedLosers.filter(coin => coin.price_change_percentage_24h < 0).slice(0, 10)
        setTopLosers(losers)
      } catch (error) {
        console.error('Error fetching crypto data:', error)
        const sampleGainers: CryptoData[] = [{ id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 45280, price_change_percentage_24h: 8.5, market_cap: 885000000000, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', market_cap_rank: 1 }]
        const sampleLosers: CryptoData[] = [{ id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.45, price_change_percentage_24h: -4.2, market_cap: 15800000000, image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png', market_cap_rank: 8 }]
        setTopGainers(sampleGainers)
        setTopLosers(sampleLosers)
      } finally {
        setCryptoLoading(false)
      }
    }
    fetchCryptoData()
    const interval = setInterval(fetchCryptoData, 60 * 1000)
    return () => clearInterval(interval)
  }, [gainersTimeframe, losersTimeframe])

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

            {/* Three Column Row: Economic Calendar, Heatmap, Trending */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Economic Calendar */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">📅</span>
                  <h2 className="text-xl font-semibold text-krtext">Economic Calendar</h2>
                </div>
                <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-6 h-[500px]">
                  <div ref={calendarRef} className="h-full w-full"></div>
                </div>
              </div>

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
                <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-6 h-[500px]">
                  <div ref={heatmapRef} className="h-full w-full"></div>
                </div>
              </div>

              {/* Top Trending Coins */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">⭐</span>
                  <h2 className="text-xl font-semibold text-krtext">Top Trending</h2>
                </div>
                <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-6 h-[500px]">
                  <div ref={trendingRef} className="h-full w-full"></div>
                </div>
              </div>
            </div>

            {/* Two Column Row: Top Gainers & Top Losers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Crypto Gainers */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚀</span>
                    <h3 className="text-lg font-semibold text-krtext">Top Gainers</h3>
                  </div>
                  <select
                    value={gainersTimeframe}
                    onChange={(e) => setGainersTimeframe(e.target.value as '1h' | '24h' | '7d')}
                    className="bg-krcard border border-krborder rounded-lg px-2 py-1 text-xs text-krtext focus:outline-none focus:border-krgold"
                  >
                    <option value="1h">1h</option>
                    <option value="24h">24h</option>
                    <option value="7d">7d</option>
                  </select>
                </div>
                <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-4">
                  {cryptoLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-krgold"></div>
                    </div>
                  ) : (
                    <div className="space-y-3 crypto-list-scroll max-h-[400px] overflow-y-auto">
                      {topGainers.slice(0, 10).map((coin, index) => (
                        <div key={coin.id} className="flex items-center justify-between p-3 bg-krblack/40 rounded-lg hover:bg-krblack/60 transition-all">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-krgold font-bold w-6">#{index + 1}</span>
                            <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                            <div>
                              <div className="font-medium text-sm text-krtext">{coin.name}</div>
                              <div className="text-xs text-krmuted uppercase">{coin.symbol}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-krtext">
                              ${coin.current_price.toLocaleString()}
                            </div>
                            <div className="text-xs text-green-400 font-medium flex items-center gap-1">
                              <TrendingUp size={12} />
                              +{coin.price_change_percentage_24h.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Top Crypto Losers */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚨</span>
                    <h3 className="text-lg font-semibold text-krtext">Top Losers</h3>
                  </div>
                  <select
                    value={losersTimeframe}
                    onChange={(e) => setLosersTimeframe(e.target.value as '1h' | '24h' | '7d')}
                    className="bg-krcard border border-krborder rounded-lg px-2 py-1 text-xs text-krtext focus:outline-none focus:border-krgold"
                  >
                    <option value="1h">1h</option>
                    <option value="24h">24h</option>
                    <option value="7d">7d</option>
                  </select>
                </div>
                <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-4">
                  {cryptoLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-krgold"></div>
                    </div>
                  ) : (
                    <div className="space-y-3 crypto-list-scroll max-h-[400px] overflow-y-auto">
                      {topLosers.slice(0, 10).map((coin, index) => (
                        <div key={coin.id} className="flex items-center justify-between p-3 bg-krblack/40 rounded-lg hover:bg-krblack/60 transition-all">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-krgold font-bold w-6">#{index + 1}</span>
                            <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                            <div>
                              <div className="font-medium text-sm text-krtext">{coin.name}</div>
                              <div className="text-xs text-krmuted uppercase">{coin.symbol}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-krtext">
                              ${coin.current_price.toLocaleString()}
                            </div>
                            <div className="text-xs text-red-400 font-medium flex items-center gap-1">
                              <TrendingDown size={12} />
                              {coin.price_change_percentage_24h.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Data Sources Footer */}
          <div className="mt-8 pt-6 border-t border-krborder">
            <div className="text-xs text-krmuted text-center">
              <span className="font-semibold">Data Sources:</span> Economic calendar, crypto heatmap, screener & trending powered by{' '}
              <span className="text-krgold font-medium">TradingView</span> • Top gainers/losers from{' '}
              <span className="text-krgold font-medium">CoinGecko</span> • Screener filtered to Binance, Bybit & OKX exchanges • Updates every{' '}
              <span className="text-green-400">1 minute</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
