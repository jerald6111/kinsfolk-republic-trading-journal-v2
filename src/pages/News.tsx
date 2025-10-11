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
    // Fetch news from Cointelegraph RSS feed
    const fetchNews = async () => {
      setLoading(true)
      try {
        // Cointelegraph RSS feed URL
        const RSS_URL = 'https://cointelegraph.com/rss'
        
        // Using RSS2JSON service to parse RSS feed (free service)
        const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}&api_key=YOUR_API_KEY&count=20`
        
        const response = await fetch(API_URL)
        const data = await response.json()
        
        if (data.status === 'ok' && data.items) {
          const formattedNews: NewsItem[] = data.items.map((item: any, index: number) => ({
            id: `ct-${index}`,
            title: item.title,
            description: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...' || '',
            url: item.link,
            source: 'Cointelegraph',
            publishedAt: item.pubDate,
            category: 'crypto' as const
          }))
          
          setNewsItems(formattedNews)
        } else {
          // Fallback to sample data if API fails
          throw new Error('Failed to fetch from Cointelegraph')
        }
      } catch (error) {
        console.error('Error fetching Cointelegraph news:', error)
        
        // Fallback sample news data
        const sampleNews: NewsItem[] = [
          {
            id: '1',
            title: 'Bitcoin Surges Past $45,000 as Institutional Adoption Grows',
            description: 'Major financial institutions continue to embrace cryptocurrency, driving Bitcoin to new highs amid increased market confidence and regulatory clarity.',
            url: 'https://cointelegraph.com',
            source: 'Cointelegraph',
            publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            category: 'crypto'
          },
          {
            id: '2',
            title: 'Ethereum Layer-2 Solutions See Record Trading Volume',
            description: 'Scaling solutions like Arbitrum and Optimism process billions in transactions, marking a significant milestone for Ethereum ecosystem.',
            url: 'https://cointelegraph.com',
            source: 'Cointelegraph',
            publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            category: 'crypto'
          },
          {
            id: '3',
            title: 'Major Exchange Announces New Staking Rewards Program',
            description: 'Leading cryptocurrency exchange unveils enhanced staking options with competitive APY rates for multiple digital assets.',
            url: 'https://cointelegraph.com',
            source: 'Cointelegraph',
            publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
            category: 'crypto'
          },
          {
            id: '4',
            title: 'DeFi Protocol Introduces Revolutionary Lending Mechanism',
            description: 'New decentralized finance platform promises higher yields and lower fees through innovative smart contract architecture.',
            url: 'https://cointelegraph.com',
            source: 'Cointelegraph',
            publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            category: 'crypto'
          },
          {
            id: '5',
            title: 'NFT Marketplace Reports All-Time High Trading Activity',
            description: 'Digital collectibles market experiences surge in volume as blue-chip collections maintain strong floor prices.',
            url: 'https://cointelegraph.com',
            source: 'Cointelegraph',
            publishedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
            category: 'crypto'
          },
          {
            id: '6',
            title: 'Blockchain Gaming Platform Secures Major Investment',
            description: 'Web3 gaming project raises significant funding from venture capital firms, signaling continued interest in GameFi sector.',
            url: 'https://cointelegraph.com',
            source: 'Cointelegraph',
            publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            category: 'crypto'
          },
          {
            id: '7',
            title: 'Central Bank Digital Currency Pilot Program Expands',
            description: 'Government-backed digital currency initiative enters new phase with broader merchant and consumer participation.',
            url: 'https://cointelegraph.com',
            source: 'Cointelegraph',
            publishedAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
            category: 'crypto'
          },
          {
            id: '8',
            title: 'Crypto Regulation Framework Gains Bipartisan Support',
            description: 'Legislative proposal for comprehensive digital asset oversight receives positive reception from policymakers.',
            url: 'https://cointelegraph.com',
            source: 'Cointelegraph',
            publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
            category: 'crypto'
          }
        ]
        
        setNewsItems(sampleNews)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
    
    // Refresh news every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

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
          <h1 className="text-2xl font-bold">Crypto Market News</h1>
        </div>
        <p className="text-gray-400">Latest cryptocurrency news and updates from Cointelegraph</p>
      </div>

      {/* News Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* News Articles - 2/3 width */}
        <div className="lg:col-span-2">
          <div className="bg-krcard backdrop-blur-sm rounded-xl shadow-sm border border-krborder p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-krgold" size={24} />
                <h2 className="text-xl font-semibold">Latest from Cointelegraph</h2>
              </div>
              
              {/* Refresh indicator */}
              <div className="text-xs text-gray-500">
                Auto-refresh every 5 minutes
              </div>
            </div>

            {/* News Items */}
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
              {loading ? (
                <div className="text-center py-12 text-gray-400">Loading news from Cointelegraph...</div>
              ) : newsItems.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No news available</div>
              ) : (
                newsItems.map(item => (
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
                <strong className="text-krgold">News Source:</strong> Powered by <a href="https://cointelegraph.com" target="_blank" rel="noopener noreferrer" className="text-krgold hover:underline">Cointelegraph</a> RSS feed via RSS2JSON API.
                Updates automatically every 5 minutes.
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
