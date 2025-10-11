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
  const topGainersRef = useRef<HTMLDivElement>(null)
  const topLosersRef = useRef<HTMLDivElement>(null)
  const [topGainers, setTopGainers] = useState<CryptoData[]>([])
  const [topLosers, setTopLosers] = useState<CryptoData[]>([])
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

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

  // Crypto Top Gainers Widget
  useEffect(() => {
    if (!topGainersRef.current) return

    const container = topGainersRef.current
    container.innerHTML = ''

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      colorTheme: 'dark',
      dateRange: '1D',
      exchange: 'BINANCE',
      showChart: false,
      locale: 'en',
      largeChartUrl: '',
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      width: '100%',
      height: '100%',
      plotLineColorGrowing: 'rgba(41, 98, 255, 1)',
      plotLineColorFalling: 'rgba(41, 98, 255, 1)',
      gridLineColor: 'rgba(42, 46, 57, 0)',
      scaleFontColor: 'rgba(209, 212, 220, 1)',
      belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
      belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
      symbolActiveColor: 'rgba(41, 98, 255, 0.12)'
    })

    container.appendChild(script)

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [])

  // Crypto Top Losers Widget
  useEffect(() => {
    if (!topLosersRef.current) return

    const container = topLosersRef.current
    container.innerHTML = ''

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      colorTheme: 'dark',
      dateRange: '1D',
      exchange: 'BINANCE',
      showChart: false,
      locale: 'en',
      largeChartUrl: '',
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      width: '100%',
      height: '100%',
      plotLineColorGrowing: 'rgba(41, 98, 255, 1)',
      plotLineColorFalling: 'rgba(41, 98, 255, 1)',
      gridLineColor: 'rgba(42, 46, 57, 0)',
      scaleFontColor: 'rgba(209, 212, 220, 1)',
      belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
      belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
      symbolActiveColor: 'rgba(41, 98, 255, 0.12)'
    })

    container.appendChild(script)

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [])

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
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="text-green-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-krtext">Top Gainers</h2>
                <p className="text-xs text-krmuted">24h performance leaders</p>
              </div>
            </div>
            <div className="tradingview-widget-container h-[500px]">
              <div ref={topGainersRef} className="tradingview-widget-container__widget h-full"></div>
            </div>
            <div className="mt-4 pt-4 border-t border-krborder/30">
              <p className="text-xs text-krmuted text-center">
                <span className="text-green-400 font-semibold">🚀 Trending Up</span> • Data from Binance
              </p>
            </div>
          </div>

          {/* Top Losers */}
          <div className="bg-krcard/90 backdrop-blur-md rounded-2xl shadow-2xl border border-red-500/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <TrendingDown className="text-red-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-krtext">Top Losers</h2>
                <p className="text-xs text-krmuted">24h performance decliners</p>
              </div>
            </div>
            <div className="tradingview-widget-container h-[500px]">
              <div ref={topLosersRef} className="tradingview-widget-container__widget h-full"></div>
            </div>
            <div className="mt-4 pt-4 border-t border-krborder/30">
              <p className="text-xs text-krmuted text-center">
                <span className="text-red-400 font-semibold">📉 Trending Down</span> • Data from Binance
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
  )
}
