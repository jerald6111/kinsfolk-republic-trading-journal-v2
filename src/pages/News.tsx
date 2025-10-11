import React, { useEffect, useRef, useState } from 'react'
import { Calendar, Newspaper, TrendingUp, ExternalLink, Clock } from 'lucide-react'

// News item type
interface NewsItem {
  id: string
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  category: 'crypto' | 'stocks' | 'forex'
}

export default function News() {
  const calendarRef = useRef<HTMLDivElement>(null)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<'all' | 'crypto' | 'stocks' | 'forex'>('all')

  useEffect(() => {
    // Economic Calendar Widget
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

  useEffect(() => {
    // Fetch news from multiple sources
    const fetchNews = async () => {
      setLoading(true)
      try {
        // Sample news data - In production, replace with actual API calls
        // You can use: CryptoPanic API, NewsAPI, Finnhub, or Alpha Vantage
        const sampleNews: NewsItem[] = [
          {
            id: '1',
            title: 'Bitcoin Surges Past $45,000 as Institutional Adoption Grows',
            description: 'Major financial institutions continue to embrace cryptocurrency, driving Bitcoin to new highs amid increased market confidence.',
            url: 'https://example.com/news/1',
            source: 'CoinDesk',
            publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            category: 'crypto'
          },
          {
            id: '2',
            title: 'Federal Reserve Hints at Interest Rate Changes',
            description: 'The Fed signals potential policy shifts that could impact global markets and currency valuations significantly.',
            url: 'https://example.com/news/2',
            source: 'Bloomberg',
            publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            category: 'forex'
          },
          {
            id: '3',
            title: 'Ethereum 2.0 Upgrade Shows Promising Results',
            description: 'Network efficiency improvements and reduced gas fees mark successful implementation of major protocol updates.',
            url: 'https://example.com/news/3',
            source: 'CryptoNews',
            publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
            category: 'crypto'
          },
          {
            id: '4',
            title: 'Tech Stocks Rally on Positive Earnings Reports',
            description: 'Leading technology companies exceed expectations, boosting investor sentiment across the sector.',
            url: 'https://example.com/news/4',
            source: 'Reuters',
            publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            category: 'stocks'
          },
          {
            id: '5',
            title: 'DeFi Platform Launches New Yield Farming Protocol',
            description: 'Innovative decentralized finance solution promises higher returns with enhanced security features.',
            url: 'https://example.com/news/5',
            source: 'DeFi Pulse',
            publishedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
            category: 'crypto'
          },
          {
            id: '6',
            title: 'EUR/USD Reaches Key Support Level Amid Economic Data',
            description: 'Currency pair shows volatility as traders react to latest economic indicators from Europe and US.',
            url: 'https://example.com/news/6',
            source: 'FX Street',
            publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            category: 'forex'
          }
        ]
        
        setNewsItems(sampleNews)
      } catch (error) {
        console.error('Error fetching news:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  const filteredNews = activeCategory === 'all' 
    ? newsItems 
    : newsItems.filter(item => item.category === activeCategory)

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'crypto': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'stocks': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'forex': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-krcard/30 backdrop-blur-sm text-krtext p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Newspaper className="text-krgold" size={32} />
          <h1 className="text-2xl font-bold">Market News</h1>
        </div>
        <p className="text-gray-400">Stay updated with the latest developments in crypto, stocks, and forex markets</p>
      </div>

      {/* News Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* News Articles - 2/3 width */}
        <div className="lg:col-span-2">
          <div className="bg-krcard backdrop-blur-sm rounded-xl shadow-sm border border-krborder p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-krgold" size={24} />
                <h2 className="text-xl font-semibold">Latest News</h2>
              </div>
              
              {/* Category Filter */}
              <div className="flex gap-2">
                {['all', 'crypto', 'stocks', 'forex'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat as any)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      activeCategory === cat 
                        ? 'bg-krgold text-krblack' 
                        : 'bg-krblack/50 text-gray-400 hover:text-krtext'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* News Items */}
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
              {loading ? (
                <div className="text-center py-12 text-gray-400">Loading news...</div>
              ) : filteredNews.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No news available</div>
              ) : (
                filteredNews.map(item => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-krblack/30 rounded-lg p-4 border border-krborder hover:border-krgold/50 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-krtext group-hover:text-krgold transition-colors flex-1">
                        {item.title}
                      </h3>
                      <ExternalLink size={16} className="text-gray-400 group-hover:text-krgold transition-colors flex-shrink-0 mt-1" />
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(item.category)}`}>
                        {item.category.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{item.source}</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        {formatTimeAgo(item.publishedAt)}
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>

            {/* API Integration Note */}
            <div className="mt-4 p-3 bg-krgold/10 border border-krgold/30 rounded-lg">
              <p className="text-sm text-gray-400">
                <strong className="text-krgold">API Integration:</strong> Connect to CryptoPanic, NewsAPI, or Finnhub for real-time news feeds.
                Current data is sample content for demonstration.
              </p>
            </div>
          </div>
        </div>

        {/* Economic Calendar - 1/3 width */}
        <div className="lg:col-span-1">
          <div className="bg-krcard backdrop-blur-sm rounded-xl shadow-sm border border-krborder p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-krgold" size={24} />
              <h2 className="text-xl font-semibold">Economic Calendar</h2>
            </div>
            <p className="text-sm text-gray-400 mb-4">Medium to High Impact Events</p>
            <div className="tradingview-widget-container">
              <div ref={calendarRef} className="tradingview-widget-container__widget"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
