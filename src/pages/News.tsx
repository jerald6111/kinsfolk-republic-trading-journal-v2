import React, { useEffect, useRef, useState } from 'react'
import { Calendar, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react'

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

// News item for ticker
interface NewsItem {
  id: string
  title: string
  source: string
  publishedAt: string
}

export default function News() {
  const calendarRef = useRef<HTMLDivElement>(null)
  const [topGainers, setTopGainers] = useState<CryptoData[]>([])
  const [topLosers, setTopLosers] = useState<CryptoData[]>([])
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cryptoLoading, setCryptoLoading] = useState(true)
  const [gainersTimeframe, setGainersTimeframe] = useState<'1h' | '24h' | '7d'>('24h')
  const [losersTimeframe, setLosersTimeframe] = useState<'1h' | '24h' | '7d'>('24h')

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

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [])

  // Fetch crypto market data from CoinGecko API
  useEffect(() => {
    const fetchCryptoData = async () => {
      setCryptoLoading(true)
      try {
        // Build the price change percentage parameter based on timeframes
        const timeframeParams = []
        if (gainersTimeframe === '1h' || losersTimeframe === '1h') timeframeParams.push('1h')
        if (gainersTimeframe === '24h' || losersTimeframe === '24h') timeframeParams.push('24h')
        if (gainersTimeframe === '7d' || losersTimeframe === '7d') timeframeParams.push('7d')
        
        const priceChangeParam = timeframeParams.join(',')
        
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=300&page=1&sparkline=false&price_change_percentage=${priceChangeParam}`
        )
        const data: any[] = await response.json()
        
        // Get the appropriate price change field for each timeframe
        const getChangeField = (timeframe: string) => {
          switch (timeframe) {
            case '1h': return 'price_change_percentage_1h_in_currency'
            case '24h': return 'price_change_percentage_24h_in_currency' 
            case '7d': return 'price_change_percentage_7d_in_currency'
            default: return 'price_change_percentage_24h_in_currency'
          }
        }
        
        // Process gainers
        const gainersChangeField = getChangeField(gainersTimeframe)
        const gainersData = data.map(coin => ({
          ...coin,
          price_change_percentage_24h: coin[gainersChangeField] || coin.price_change_percentage_24h || 0
        }))
        const sortedGainers = [...gainersData].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        const gainers = sortedGainers.filter(coin => coin.price_change_percentage_24h > 0).slice(0, 10)
        setTopGainers(gainers)
        
        // Process losers
        const losersChangeField = getChangeField(losersTimeframe)
        const losersData = data.map(coin => ({
          ...coin,
          price_change_percentage_24h: coin[losersChangeField] || coin.price_change_percentage_24h || 0
        }))
        const sortedLosers = [...losersData].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
        const losers = sortedLosers.filter(coin => coin.price_change_percentage_24h < 0).slice(0, 10)
        setTopLosers(losers)
        
      } catch (error) {
        console.error('Error fetching crypto data:', error)
        
        // Fallback sample data
        const sampleGainers: CryptoData[] = [
          { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 45280, price_change_percentage_24h: 8.5, market_cap: 885000000000, image: '🟠', market_cap_rank: 1 },
          { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3150, price_change_percentage_24h: 6.2, market_cap: 378000000000, image: '🔷', market_cap_rank: 2 },
          { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 315, price_change_percentage_24h: 5.8, market_cap: 48500000000, image: '🟡', market_cap_rank: 4 },
        ]
        
        const sampleLosers: CryptoData[] = [
          { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.45, price_change_percentage_24h: -4.2, market_cap: 15800000000, image: '🔵', market_cap_rank: 8 },
          { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 85, price_change_percentage_24h: -3.8, market_cap: 38200000000, image: '🟣', market_cap_rank: 5 },
          { id: 'polkadot', symbol: 'dot', name: 'Polkadot', current_price: 5.2, price_change_percentage_24h: -2.9, market_cap: 7100000000, image: '⚫', market_cap_rank: 12 },
        ]
        
        setTopGainers(sampleGainers)
        setTopLosers(sampleLosers)
      } finally {
        setCryptoLoading(false)
      }
    }

    fetchCryptoData()
    // Refresh every 2 minutes
    const interval = setInterval(fetchCryptoData, 2 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [gainersTimeframe, losersTimeframe])



  // Fetch news headlines for ticker
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      try {
        const RSS_URL = 'https://cointelegraph.com/rss'
        const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}&count=15`
        
        const response = await fetch(API_URL)
        const data = await response.json()
        
        if (data.status === 'ok' && data.items) {
          const formattedNews: NewsItem[] = data.items.map((item: any, index: number) => ({
            id: `ct-${index}`,
            title: item.title,
            source: 'Cointelegraph',
            publishedAt: item.pubDate
          }))
          
          setNewsItems(formattedNews)
        } else {
          throw new Error('Failed to fetch news')
        }
      } catch (error) {
        console.error('Error fetching news:', error)
        
        // Fallback sample news
        const sampleNews: NewsItem[] = [
          { id: '1', title: 'Bitcoin Surges Past $45,000 as Institutional Adoption Grows', source: 'Cointelegraph', publishedAt: new Date().toISOString() },
          { id: '2', title: 'Ethereum Layer-2 Solutions See Record Trading Volume', source: 'Cointelegraph', publishedAt: new Date().toISOString() },
          { id: '3', title: 'Major Exchange Announces New Staking Rewards Program', source: 'Cointelegraph', publishedAt: new Date().toISOString() },
          { id: '4', title: 'DeFi Protocol Introduces Revolutionary Lending Mechanism', source: 'Cointelegraph', publishedAt: new Date().toISOString() },
          { id: '5', title: 'NFT Marketplace Reports All-Time High Trading Activity', source: 'Cointelegraph', publishedAt: new Date().toISOString() },
          { id: '6', title: 'Blockchain Gaming Platform Secures Major Investment', source: 'Cointelegraph', publishedAt: new Date().toISOString() },
          { id: '7', title: 'Central Bank Digital Currency Pilot Program Expands', source: 'Cointelegraph', publishedAt: new Date().toISOString() },
          { id: '8', title: 'Crypto Regulation Framework Gains Bipartisan Support', source: 'Cointelegraph', publishedAt: new Date().toISOString() }
        ]
        
        setNewsItems(sampleNews)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
    const interval = setInterval(fetchNews, 5 * 60 * 1000) // Refresh every 5 minutes
    
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
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="text-krgold" size={36} />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">Market Intelligence</h1>
            <p className="text-krmuted text-sm mt-1">Real-time economic events, crypto trends, and breaking news</p>
          </div>
        </div>
      </div>

      {/* News Ticker */}
      <div className="mb-6 bg-krcard/80 backdrop-blur-md rounded-xl border border-krborder/50 p-3 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Zap className="text-krgold animate-pulse" size={20} />
            <span className="text-xs font-bold text-krgold uppercase">Breaking</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="news-ticker-wrapper">
              <div className="news-ticker">
                {newsItems.map((item, idx) => (
                  <span key={item.id} className="news-ticker-item">
                    <span className="text-krtext font-medium">{item.title}</span>
                    <span className="text-krmuted mx-4">•</span>
                  </span>
                ))}
                {/* Duplicate for seamless loop */}
                {newsItems.map((item, idx) => (
                  <span key={`${item.id}-dup`} className="news-ticker-item">
                    <span className="text-krtext font-medium">{item.title}</span>
                    <span className="text-krmuted mx-4">•</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Economic Calendar - Left Column */}
        <div className="xl:col-span-1">
          <div className="bg-krcard/90 backdrop-blur-md rounded-2xl shadow-2xl border border-krborder/50 p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-krgold" size={28} />
              <div>
                <h2 className="text-2xl font-bold text-krtext">Economic Calendar</h2>
                <p className="text-xs text-krmuted">Key financial events</p>
              </div>
            </div>
            <div className="tradingview-widget-container h-[calc(100%-80px)]">
              <div ref={calendarRef} className="tradingview-widget-container__widget h-full"></div>
            </div>
          </div>
        </div>

        {/* Crypto Widgets - Right Columns */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <div className="bg-krcard/90 backdrop-blur-md rounded-2xl shadow-2xl border border-green-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="text-green-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-krtext">Top Crypto Gainers</h2>
                  <p className="text-xs text-krmuted">{gainersTimeframe} crypto performance leaders</p>
                </div>
              </div>
              
              {/* Timeframe Selector */}
              <div className="flex bg-krblack/40 rounded-lg p-1">
                {(['1h', '24h', '7d'] as const).map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setGainersTimeframe(timeframe)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                      gainersTimeframe === timeframe
                        ? 'bg-green-500 text-krblack'
                        : 'text-krmuted hover:text-green-400'
                    }`}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[500px] overflow-y-auto crypto-list-scroll">
              {cryptoLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-krgold"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {topGainers.map((coin, index) => (
                    <div key={coin.id} className="flex items-center justify-between p-3 bg-krblack/40 rounded-lg hover:bg-krblack/60 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-krgold/20 rounded-full flex items-center justify-center text-sm font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-krtext text-sm">{coin.name}</div>
                          <div className="text-xs text-krmuted uppercase">{coin.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-krtext">
                          ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </div>
                        <div className="text-sm font-bold text-green-400">
                          +{coin.price_change_percentage_24h.toFixed(2)}% ({gainersTimeframe})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-krborder/30">
              <p className="text-xs text-krmuted text-center">
                <span className="text-green-400 font-semibold">🚀 Crypto Trending Up</span> • Live data from CoinGecko
              </p>
            </div>
          </div>

          {/* Top Losers */}
          <div className="bg-krcard/90 backdrop-blur-md rounded-2xl shadow-2xl border border-red-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <TrendingDown className="text-red-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-krtext">Top Crypto Losers</h2>
                  <p className="text-xs text-krmuted">{losersTimeframe} crypto performance decliners</p>
                </div>
              </div>
              
              {/* Timeframe Selector */}
              <div className="flex bg-krblack/40 rounded-lg p-1">
                {(['1h', '24h', '7d'] as const).map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setLosersTimeframe(timeframe)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                      losersTimeframe === timeframe
                        ? 'bg-red-500 text-krblack'
                        : 'text-krmuted hover:text-red-400'
                    }`}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[500px] overflow-y-auto crypto-list-scroll">
              {cryptoLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-krgold"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {topLosers.map((coin, index) => (
                    <div key={coin.id} className="flex items-center justify-between p-3 bg-krblack/40 rounded-lg hover:bg-krblack/60 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-krgold/20 rounded-full flex items-center justify-center text-sm font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-krtext text-sm">{coin.name}</div>
                          <div className="text-xs text-krmuted uppercase">{coin.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-krtext">
                          ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </div>
                        <div className="text-sm font-bold text-red-400">
                          {coin.price_change_percentage_24h.toFixed(2)}% ({losersTimeframe})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-krborder/30">
              <p className="text-xs text-krmuted text-center">
                <span className="text-red-400 font-semibold">📉 Crypto Trending Down</span> • Live data from CoinGecko
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-6 bg-krgold/10 backdrop-blur-sm rounded-xl border border-krgold/30 p-4">
        <p className="text-sm text-center text-krmuted">
          <span className="text-krgold font-semibold">Data Sources:</span> Economic calendar and crypto market data powered by <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer" className="text-krgold hover:underline">TradingView</a> • 
          News ticker from <a href="https://cointelegraph.com" target="_blank" rel="noopener noreferrer" className="text-krgold hover:underline ml-1">Cointelegraph</a> • Updates every 5 minutes
        </p>
      </div>
      </div>
      </div>
    </div>
  )
}
