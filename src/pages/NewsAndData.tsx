import React, { useEffect, useRef, useState } from 'react'
import { Calendar, TrendingUp, TrendingDown, Activity, Zap, Globe, DollarSign, Bitcoin, BarChart3 } from 'lucide-react'

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
  category: 'crypto' | 'stocks' | 'forex' | 'world'
}

export default function NewsAndData() {
  const calendarRef = useRef<HTMLDivElement>(null)
  const [topGainers, setTopGainers] = useState<CryptoData[]>([])
  const [topLosers, setTopLosers] = useState<CryptoData[]>([])
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cryptoLoading, setCryptoLoading] = useState(true)
  const [gainersTimeframe, setGainersTimeframe] = useState<'1h' | '24h' | '7d'>('24h')
  const [losersTimeframe, setLosersTimeframe] = useState<'1h' | '24h' | '7d'>('24h')
  const [activeNewsCategory, setActiveNewsCategory] = useState<'crypto' | 'stocks' | 'forex' | 'world'>('crypto')

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

  // Fetch news headlines with multiple categories
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      try {
        // Sample multi-category news data
        const multiCategoryNews: NewsItem[] = [
          // Crypto News (Main Category)
          { id: '1', title: 'Bitcoin Surges Past $45,000 as Institutional Adoption Grows', source: 'Cointelegraph', publishedAt: new Date().toISOString(), category: 'crypto' },
          { id: '2', title: 'Ethereum Layer-2 Solutions See Record Trading Volume', source: 'CoinDesk', publishedAt: new Date().toISOString(), category: 'crypto' },
          { id: '3', title: 'Major Exchange Announces New Staking Rewards Program', source: 'Decrypt', publishedAt: new Date().toISOString(), category: 'crypto' },
          { id: '4', title: 'DeFi Protocol Introduces Revolutionary Lending Mechanism', source: 'The Block', publishedAt: new Date().toISOString(), category: 'crypto' },
          { id: '5', title: 'NFT Marketplace Reports All-Time High Trading Activity', source: 'Cointelegraph', publishedAt: new Date().toISOString(), category: 'crypto' },
          { id: '6', title: 'Blockchain Gaming Platform Secures Major Investment', source: 'CoinDesk', publishedAt: new Date().toISOString(), category: 'crypto' },
          
          // Stocks News
          { id: '7', title: 'Tech Giants Rally as Q4 Earnings Exceed Expectations', source: 'MarketWatch', publishedAt: new Date().toISOString(), category: 'stocks' },
          { id: '8', title: 'S&P 500 Reaches New All-Time High Amid Economic Optimism', source: 'Bloomberg', publishedAt: new Date().toISOString(), category: 'stocks' },
          { id: '9', title: 'Energy Sector Leads Market Gains Following Oil Price Surge', source: 'CNBC', publishedAt: new Date().toISOString(), category: 'stocks' },
          { id: '10', title: 'Pharmaceutical Stocks Jump on Breakthrough Drug Approval', source: 'Reuters', publishedAt: new Date().toISOString(), category: 'stocks' },
          
          // Forex News
          { id: '11', title: 'USD Strengthens Against Major Currencies After Fed Comments', source: 'ForexLive', publishedAt: new Date().toISOString(), category: 'forex' },
          { id: '12', title: 'EUR/USD Falls as ECB Maintains Dovish Stance', source: 'DailyFX', publishedAt: new Date().toISOString(), category: 'forex' },
          { id: '13', title: 'GBP Volatile Following Bank of England Rate Decision', source: 'FX Street', publishedAt: new Date().toISOString(), category: 'forex' },
          { id: '14', title: 'Japanese Yen Weakens on Inflation Data Release', source: 'Investing.com', publishedAt: new Date().toISOString(), category: 'forex' },
          
          // World Economic News
          { id: '15', title: 'Global Inflation Rates Show Signs of Stabilization', source: 'Financial Times', publishedAt: new Date().toISOString(), category: 'world' },
          { id: '16', title: 'IMF Raises Global Growth Forecast for 2025', source: 'Wall Street Journal', publishedAt: new Date().toISOString(), category: 'world' },
          { id: '17', title: 'Central Banks Coordinate on Digital Currency Initiatives', source: 'Reuters', publishedAt: new Date().toISOString(), category: 'world' },
          { id: '18', title: 'Emerging Markets See Capital Inflows Amid Risk-On Sentiment', source: 'Bloomberg', publishedAt: new Date().toISOString(), category: 'world' },
        ]
        
        setNewsItems(multiCategoryNews)
      } catch (error) {
        console.error('Error fetching news:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
    const interval = setInterval(fetchNews, 5 * 60 * 1000) // Refresh every 5 minutes
    
    return () => clearInterval(interval)
  }, [])

  // Filter news by active category
  const filteredNews = newsItems.filter(item => item.category === activeNewsCategory)
  
  // Get news for ticker (crypto first, then mix of other categories)
  const tickerNews = [
    ...newsItems.filter(item => item.category === 'crypto').slice(0, 4),
    ...newsItems.filter(item => item.category === 'stocks').slice(0, 2),
    ...newsItems.filter(item => item.category === 'forex').slice(0, 1),
    ...newsItems.filter(item => item.category === 'world').slice(0, 1),
  ]

  const categoryIcons = {
    crypto: <Bitcoin className="w-5 h-5" />,
    stocks: <BarChart3 className="w-5 h-5" />,
    forex: <DollarSign className="w-5 h-5" />,
    world: <Globe className="w-5 h-5" />
  }

  const categoryColors = {
    crypto: 'border-orange-500/20 bg-orange-500/10 text-orange-400',
    stocks: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    forex: 'border-green-500/20 bg-green-500/10 text-green-400',
    world: 'border-purple-500/20 bg-purple-500/10 text-purple-400'
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
              <Activity className="text-krgold" size={36} />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">News & Data Center</h1>
                <p className="text-krmuted text-sm mt-1">Multi-market intelligence, economic events, and live trading insights</p>
              </div>
            </div>
          </div>

          {/* News Ticker */}
          <div className="mb-6 bg-krcard/80 backdrop-blur-md rounded-xl border border-krborder/50 p-3 overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Zap className="text-krgold animate-pulse" size={20} />
                <span className="text-xs font-bold text-krgold uppercase">Live Feed</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="news-ticker-wrapper">
                  <div className="news-ticker">
                    {tickerNews.map((item, idx) => (
                      <span key={item.id} className="news-ticker-item">
                        <span className="text-krtext font-medium">{item.title}</span>
                        <span className="text-krmuted mx-4">•</span>
                      </span>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {tickerNews.map((item, idx) => (
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

          {/* News Categories Section */}
          <div className="mb-6 bg-krcard/90 backdrop-blur-md rounded-2xl shadow-2xl border border-krborder/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-krtext">Market News</h2>
              <div className="flex bg-krblack/40 rounded-lg p-1 gap-1">
                {(['crypto', 'stocks', 'forex', 'world'] as const).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveNewsCategory(category)}
                    className={`px-3 py-2 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${
                      activeNewsCategory === category
                        ? 'bg-krgold text-krblack'
                        : 'text-krmuted hover:text-krtext'
                    }`}
                  >
                    {categoryIcons[category]}
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto crypto-list-scroll">
              {filteredNews.slice(0, 12).map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${categoryColors[item.category]}`}
                >
                  <div className="flex items-start gap-3">
                    {categoryIcons[item.category]}
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{item.title}</h3>
                      <div className="flex items-center justify-between text-xs text-krmuted">
                        <span>{item.source}</span>
                        <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Data Grid */}
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
              Multi-market news aggregated from premium sources • Updates every 5 minutes
            </p>
          </div>
        </div>
      </div>

      {/* News Ticker Styles */}
      <style>{`
        .news-ticker-wrapper {
          overflow: hidden;
        }
        .news-ticker {
          display: flex;
          animation: scroll-left 120s linear infinite;
          white-space: nowrap;
        }
        .news-ticker-item {
          flex-shrink: 0;
        }
        @keyframes scroll-left {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .crypto-list-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .crypto-list-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 2px;
        }
        .crypto-list-scroll::-webkit-scrollbar-thumb {
          background: rgba(218, 165, 32, 0.3);
          border-radius: 2px;
        }
        .crypto-list-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(218, 165, 32, 0.5);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}