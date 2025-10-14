import React, { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown, Flame } from 'lucide-react'

// Mini Sparkline Component
const MiniSparkline: React.FC<{ data: number[]; isPositive: boolean }> = ({ data, isPositive }) => {
  if (!data || data.length === 0) return <div className="w-24 h-8"></div>

  const width = 96
  const height = 32
  const padding = 2

  const minValue = Math.min(...data)
  const maxValue = Math.max(...data)
  const range = maxValue - minValue || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - 2 * padding) + padding
    const y = height - padding - ((value - minValue) / range) * (height - 2 * padding)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? '#10b981' : '#ef4444'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Crypto data types
interface CryptoData {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_1h_in_currency?: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency?: number
  market_cap: number
  total_volume: number
  image: string
  market_cap_rank: number
  sparkline_in_7d?: {
    price: number[]
  }
}

interface TrendingCoin {
  item: {
    id: string
    coin_id: number
    name: string
    symbol: string
    market_cap_rank: number
    thumb: string
    small: string
    large: string
    slug: string
    price_btc: number
    score: number
  }
}

export default function MarketData() {
  const calendarRef = useRef<HTMLDivElement>(null)
  const heatmapRef = useRef<HTMLDivElement>(null)
  const [heatmapMetric, setHeatmapMetric] = useState<'change' | 'volume' | 'open_interest'>('change')
  
  // CoinGecko data states
  const [cryptoRankings, setCryptoRankings] = useState<CryptoData[]>([])
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([])
  const [topGainers, setTopGainers] = useState<CryptoData[]>([])
  const [topLosers, setTopLosers] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)
  const [rankingLoading, setRankingLoading] = useState(true)

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

  // Fetch CoinGecko Crypto Rankings (Top 300 by Market Cap)
  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setRankingLoading(true)
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=true&price_change_percentage=1h,24h,7d'
        )
        const data1: CryptoData[] = await response.json()
        
        // Fetch page 2 to get coins 251-300
        const response2 = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=2&sparkline=true&price_change_percentage=1h,24h,7d'
        )
        const data2: CryptoData[] = await response2.json()
        
        // Combine both pages
        setCryptoRankings([...data1, ...data2])
      } catch (error) {
        console.error('Error fetching crypto rankings:', error)
      } finally {
        setRankingLoading(false)
      }
    }

    fetchRankings()
    const interval = setInterval(fetchRankings, 60000) // Update every 60 seconds
    return () => clearInterval(interval)
  }, [])

  // Fetch CoinGecko Trending Coins
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://api.coingecko.com/api/v3/search/trending')
        const data = await response.json()
        setTrendingCoins(data.coins || [])
      } catch (error) {
        console.error('Error fetching trending coins:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
    const interval = setInterval(fetchTrending, 60000) // Update every 60 seconds
    return () => clearInterval(interval)
  }, [])

  // Fetch CoinGecko Market Data (Gainers & Losers)
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h'
        )
        const data: CryptoData[] = await response.json()
        
        // Sort for top gainers (highest positive change)
        const gainers = [...data]
          .filter(coin => coin.price_change_percentage_24h > 0)
          .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
          .slice(0, 10)
        
        // Sort for top losers (most negative change)
        const losers = [...data]
          .filter(coin => coin.price_change_percentage_24h < 0)
          .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
          .slice(0, 10)
        
        setTopGainers(gainers)
        setTopLosers(losers)
      } catch (error) {
        console.error('Error fetching market data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 60000) // Update every 60 seconds
    return () => clearInterval(interval)
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
            {/* Full Width: Cryptocurrency by Ranking */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📈</span>
                  <h2 className="text-xl font-semibold text-krtext">Cryptocurrency by Ranking</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-krgold/10 border border-krgold/30 rounded-lg">
                  <span className="text-xs font-semibold text-krgold">Top 300 by Market Cap</span>
                </div>
              </div>
              <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-6 h-[700px] overflow-y-auto scrollbar-custom">
                {rankingLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-krmuted">Loading cryptocurrency rankings...</div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-krblack/90 backdrop-blur-sm z-10">
                        <tr className="border-b border-krborder">
                          <th className="text-left py-3 px-4 text-krmuted font-semibold">#</th>
                          <th className="text-left py-3 px-4 text-krmuted font-semibold">Coin</th>
                          <th className="text-right py-3 px-4 text-krmuted font-semibold">Price</th>
                          <th className="text-right py-3 px-4 text-krmuted font-semibold">1h</th>
                          <th className="text-right py-3 px-4 text-krmuted font-semibold">24h</th>
                          <th className="text-right py-3 px-4 text-krmuted font-semibold">7d</th>
                          <th className="text-right py-3 px-4 text-krmuted font-semibold">24h Volume</th>
                          <th className="text-right py-3 px-4 text-krmuted font-semibold">Market Cap</th>
                          <th className="text-center py-3 px-4 text-krmuted font-semibold">Last 7 Days</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cryptoRankings.map((coin, index) => (
                          <tr key={coin.id} className="border-b border-krborder/30 hover:bg-krgold/5 transition-colors">
                            <td className="py-3 px-4 text-krmuted font-semibold">{index + 1}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                                <div>
                                  <div className="font-semibold text-krtext">{coin.name}</div>
                                  <div className="text-xs text-krmuted">{coin.symbol.toUpperCase()}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-krtext">
                              ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                            </td>
                            <td className={`py-3 px-4 text-right font-bold ${(coin.price_change_percentage_1h_in_currency || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {coin.price_change_percentage_1h_in_currency ? 
                                `${coin.price_change_percentage_1h_in_currency >= 0 ? '+' : ''}${coin.price_change_percentage_1h_in_currency.toFixed(2)}%` 
                                : 'N/A'}
                            </td>
                            <td className={`py-3 px-4 text-right font-bold ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                            </td>
                            <td className={`py-3 px-4 text-right font-bold ${(coin.price_change_percentage_7d_in_currency || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {coin.price_change_percentage_7d_in_currency ? 
                                `${coin.price_change_percentage_7d_in_currency >= 0 ? '+' : ''}${coin.price_change_percentage_7d_in_currency.toFixed(2)}%` 
                                : 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-right text-krtext">
                              ${(coin.total_volume / 1e9).toFixed(2)}B
                            </td>
                            <td className="py-3 px-4 text-right text-krtext">
                              ${(coin.market_cap / 1e9).toFixed(2)}B
                            </td>
                            <td className="py-3 px-4 text-center">
                              {coin.sparkline_in_7d?.price ? (
                                <MiniSparkline 
                                  data={coin.sparkline_in_7d.price} 
                                  isPositive={(coin.price_change_percentage_7d_in_currency || 0) >= 0}
                                />
                              ) : (
                                <div className="w-24 h-8 flex items-center justify-center text-krmuted text-xs">N/A</div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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

            {/* Two Column Row: Heatmap & Trending Coins */}
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

              {/* Trending Coins */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Flame className="w-6 h-6 text-orange-500" />
                  <h2 className="text-xl font-semibold text-krtext">🔥 Trending Coins</h2>
                </div>
                <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-6 h-[600px] overflow-y-auto scrollbar-custom">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-krmuted">Loading trending coins...</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {trendingCoins.slice(0, 7).map((trending, index) => (
                        <div key={trending.item.id} className="flex items-center gap-4 p-3 bg-krblack/40 rounded-lg border border-krborder/50 hover:border-krgold/30 transition-colors">
                          <span className="text-krmuted font-semibold text-sm min-w-[24px]">#{index + 1}</span>
                          <img src={trending.item.small} alt={trending.item.name} className="w-8 h-8 rounded-full" />
                          <div className="flex-1">
                            <div className="font-semibold text-krtext">{trending.item.name}</div>
                            <div className="text-xs text-krmuted">{trending.item.symbol.toUpperCase()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-krmuted">Rank</div>
                            <div className="text-sm font-semibold text-krgold">#{trending.item.market_cap_rank || 'N/A'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Two Column Row: Top Gainers & Top Losers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Crypto Gainers */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  <h2 className="text-xl font-semibold text-krtext">🚀 Top Gainers</h2>
                </div>
                <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-6 h-[600px] overflow-y-auto scrollbar-custom">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-krmuted">Loading top gainers...</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {topGainers.map((coin, index) => (
                        <div key={coin.id} className="flex items-center gap-4 p-3 bg-krblack/40 rounded-lg border border-krborder/50 hover:border-green-500/30 transition-colors">
                          <span className="text-krmuted font-semibold text-sm min-w-[24px]">#{index + 1}</span>
                          <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                          <div className="flex-1">
                            <div className="font-semibold text-krtext">{coin.name}</div>
                            <div className="text-xs text-krmuted">{coin.symbol.toUpperCase()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-krtext">${coin.current_price.toLocaleString()}</div>
                            <div className="text-sm font-bold text-green-500">+{coin.price_change_percentage_24h.toFixed(2)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Top Crypto Losers */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingDown className="w-6 h-6 text-red-500" />
                  <h2 className="text-xl font-semibold text-krtext">🚨 Top Losers</h2>
                </div>
                <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-6 h-[600px] overflow-y-auto scrollbar-custom">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-krmuted">Loading top losers...</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {topLosers.map((coin, index) => (
                        <div key={coin.id} className="flex items-center gap-4 p-3 bg-krblack/40 rounded-lg border border-krborder/50 hover:border-red-500/30 transition-colors">
                          <span className="text-krmuted font-semibold text-sm min-w-[24px]">#{index + 1}</span>
                          <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                          <div className="flex-1">
                            <div className="font-semibold text-krtext">{coin.name}</div>
                            <div className="text-xs text-krmuted">{coin.symbol.toUpperCase()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-krtext">${coin.current_price.toLocaleString()}</div>
                            <div className="text-sm font-bold text-red-500">{coin.price_change_percentage_24h.toFixed(2)}%</div>
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
              <span className="font-semibold">Data Sources:</span> Market data powered by{' '}
              <span className="text-krgold font-medium">CoinGecko</span> &{' '}
              <span className="text-krgold font-medium">TradingView</span> • Real-time updates every 60 seconds • Top 300 cryptocurrencies with 7-day sparkline charts
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
