import { useState, useEffect, useMemo } from 'react'
import { Calendar, ExternalLink } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  source: string
  publishedAt: string
  category: 'crypto' | 'stocks' | 'forex' | 'world'
  summary: string
  url?: string
  image?: string
}

export default function News() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([])
  const [activeCategory, setActiveCategory] = useState<'crypto' | 'stocks' | 'forex' | 'world'>('crypto')
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null)

  // Generate contextual image for news articles
  const generateNewsImage = (title: string, category: string): string => {
    // Use specific Unsplash photo IDs for different categories to ensure reliability
    const categoryImages: Record<string, string[]> = {
      crypto: [
        'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop&auto=format&q=80', // Bitcoin
        'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=250&fit=crop&auto=format&q=80', // Crypto
        'https://images.unsplash.com/photo-1518183214770-9cffbec72538?w=400&h=250&fit=crop&auto=format&q=80'  // Digital
      ],
      stocks: [
        'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=250&fit=crop&auto=format&q=80', // Trading
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop&auto=format&q=80', // Finance
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop&auto=format&q=80'  // Business
      ],
      forex: [
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=250&fit=crop&auto=format&q=80', // Currency
        'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&h=250&fit=crop&auto=format&q=80', // Money
        'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=400&h=250&fit=crop&auto=format&q=80'  // Exchange
      ],
      world: [
        'https://images.unsplash.com/photo-1569025690938-a00729c9e2d5?w=400&h=250&fit=crop&auto=format&q=80', // Global
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop&auto=format&q=80', // News
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=250&fit=crop&auto=format&q=80'  // World
      ]
    }
    
    const images = categoryImages[category as keyof typeof categoryImages] || categoryImages.world
    return images[Math.floor(Math.random() * images.length)]
  }

  // Fetch live news from RSS feeds
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        const allNews: NewsItem[] = []

        // CRYPTO NEWS - CoinTelegraph RSS
        try {
          const cryptoResponse = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss')
          const cryptoData = await cryptoResponse.json()
          
          if (cryptoData.items) {
            const cryptoNews = cryptoData.items.slice(0, 12).map((item: any) => ({
              id: `crypto-${Date.now()}-${Math.random()}`,
              title: item.title,
              source: 'CoinTelegraph',
              publishedAt: item.pubDate,
              category: 'crypto' as const,
              summary: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
              url: item.link,
              image: generateNewsImage(item.title, 'crypto')
            }))
            allNews.push(...cryptoNews)
          }
        } catch (error) {
          console.error('Failed to fetch crypto news:', error)
        }

        // STOCKS NEWS - MarketWatch RSS
        try {
          const stocksResponse = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://feeds.marketwatch.com/marketwatch/topstories/')
          const stocksData = await stocksResponse.json()
          
          if (stocksData.items) {
            const stocksNews = stocksData.items.slice(0, 12).map((item: any) => ({
              id: `stocks-${Date.now()}-${Math.random()}`,
              title: item.title,
              source: 'MarketWatch',
              publishedAt: item.pubDate,
              category: 'stocks' as const,
              summary: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
              url: item.link,
              image: generateNewsImage(item.title, 'stocks')
            }))
            allNews.push(...stocksNews)
          }
        } catch (error) {
          console.error('Failed to fetch stocks news:', error)
        }

        // FOREX NEWS - ForexLive RSS  
        try {
          const forexResponse = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.forexlive.com/feed/')
          const forexData = await forexResponse.json()
          
          if (forexData.items) {
            const forexNews = forexData.items.slice(0, 12).map((item: any) => ({
              id: `forex-${Date.now()}-${Math.random()}`,
              title: item.title,
              source: 'ForexLive',
              publishedAt: item.pubDate,
              category: 'forex' as const,
              summary: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
              url: item.link,
              image: generateNewsImage(item.title, 'forex')
            }))
            allNews.push(...forexNews)
          }
        } catch (error) {
          console.error('Failed to fetch forex news:', error)
        }

        // WORLD NEWS - Reuters RSS
        try {
          const worldResponse = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://feeds.reuters.com/reuters/businessNews')
          const worldData = await worldResponse.json()
          
          if (worldData.items) {
            const worldNews = worldData.items.slice(0, 12).map((item: any) => ({
              id: `world-${Date.now()}-${Math.random()}`,
              title: item.title,
              source: 'Reuters',
              publishedAt: item.pubDate,
              category: 'world' as const,
              summary: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
              url: item.link,
              image: generateNewsImage(item.title, 'world')
            }))
            allNews.push(...worldNews)
          }
        } catch (error) {
          console.error('Failed to fetch world news:', error)
        }

        // Set all news data
        setNewsItems(allNews)
        
        // Set featured news (crypto as main focus)  
        const featured = allNews.filter(item => item.category === 'crypto').slice(0, 3)
        setFeaturedNews(featured)
        
      } catch (error) {
        console.error('Failed to fetch live news:', error)
        // No static fallback - live RSS feeds only per user requirement
        setNewsItems([])
        setFeaturedNews([])
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
    const interval = setInterval(fetchNews, 60 * 1000) // Refresh every 1 minute for truly LIVE updates
    
    return () => clearInterval(interval)
  }, [])

  // Get news filtered by category with crypto as main focus - memoized to prevent stale state
  const filteredNews = useMemo(() => {
    return newsItems.filter(item => item.category === activeCategory)
  }, [newsItems, activeCategory])
  
  // Get ticker news prioritizing crypto - memoized to prevent state contamination
  const tickerNews = useMemo(() => [
    ...newsItems.filter(item => item.category === 'crypto').slice(0, 4),
    ...newsItems.filter(item => item.category === 'stocks').slice(0, 2),
    ...newsItems.filter(item => item.category === 'forex').slice(0, 1),
    ...newsItems.filter(item => item.category === 'world').slice(0, 1)
  ], [newsItems])

  // Category display configuration - Using proper Kinsfolk Republic theme colors
  const categories = [
    { id: 'crypto' as const, label: 'Crypto', color: 'text-krgold', icon: '🔥' },
    { id: 'stocks' as const, label: 'Stocks', color: 'text-krsuccess', icon: '📈' },
    { id: 'forex' as const, label: 'Forex', color: 'text-kryellow', icon: '💱' },
    { id: 'world' as const, label: 'Global', color: 'text-krwhite', icon: '🌍' }
  ]

  return (
    <div className="min-h-screen bg-krbg text-krtext">
      {/* News Ticker */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-krgold/30 py-2">
        <div className="news-ticker-wrapper">
          <div className="news-ticker">
            {tickerNews.map((item, index) => (
              <div key={`${item.id}-${index}`} className="news-ticker-item px-8">
                <span className="text-krgold font-semibold">{item.source}:</span>
                <span className="ml-2 text-white">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-krgold to-orange-400 bg-clip-text text-transparent">
            Live Market News
          </h1>
          <p className="text-krmuted text-lg">
            Real-time updates from global financial markets • 1-minute refresh intervals
          </p>
        </div>

        {/* Category Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-krgray/20 backdrop-blur-sm rounded-xl p-1 border border-krgold/20">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeCategory === category.id
                    ? 'bg-krgold text-krblack shadow-lg shadow-krgold/20'
                    : 'text-krmuted hover:text-krgold hover:bg-krgray/30'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-krgold"></div>
            <span className="ml-4 text-krmuted">Fetching live news feeds...</span>
          </div>
        )}

        {/* Featured News Section - Only show for crypto category */}
        {!loading && activeCategory === 'crypto' && featuredNews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-krgold">Featured Crypto Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredNews.map((article) => (
                <div
                  key={article.id}
                  className="bg-krgray/10 backdrop-blur-sm rounded-xl border border-krgold/30 overflow-hidden hover:border-krgold/60 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="relative h-48 bg-gradient-to-r from-krgold/20 to-krgold/10 flex items-center justify-center">
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="flex items-center justify-center h-48 text-krgold"><span class="text-4xl">${categories.find(c => c.id === article.category)?.icon || '📰'}</span></div>`;
                          }
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-48 text-krgold">
                        <span className="text-4xl">{categories.find(c => c.id === article.category)?.icon || '📰'}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-white">
                      {article.title}
                    </h3>
                    <p className="text-krmuted text-sm mb-3 line-clamp-3">
                      {article.summary}
                    </p>
                    <div className="flex justify-between items-center text-xs text-krmuted">
                      <span className="text-krgold font-medium">{article.source}</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* News Grid */}
        {!loading && filteredNews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((article) => (
              <div
                key={article.id}
                className="bg-krgray/10 backdrop-blur-sm rounded-xl border border-krgray/30 overflow-hidden hover:border-krgold/50 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="relative h-48 bg-gradient-to-r from-krgold/20 to-krgold/10 flex items-center justify-center">
                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const parent = img.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="flex items-center justify-center h-48 text-krgold"><span class="text-4xl">${categories.find(c => c.id === article.category)?.icon || '📰'}</span></div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-krgold">
                      <span className="text-4xl">{categories.find(c => c.id === article.category)?.icon || '📰'}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-white group-hover:text-krgold transition-colors duration-200">
                    {article.title}
                  </h3>
                  <p className="text-krmuted text-sm mb-3 line-clamp-3">
                    {article.summary}
                  </p>
                  <div className="flex justify-between items-center text-xs text-krmuted">
                    <span className="text-krgold font-medium">{article.source}</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-krgold" />
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredNews.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-400">No news available</h3>
            <p className="text-krmuted">Live news feeds are currently loading or unavailable.</p>
          </div>
        )}

        {/* Article Modal */}
        {selectedArticle && (
          <div className="fixed inset-0 bg-krblack/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-krgray/20 backdrop-blur-md rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-krgold/40 shadow-2xl shadow-krgold/20">
              <div className="sticky top-0 bg-krgray/30 backdrop-blur-md p-6 border-b border-krgold/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedArticle.title}</h2>
                    <div className="flex items-center space-x-4 text-sm text-krmuted">
                      <span className="text-krgold font-medium">{selectedArticle.source}</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-krgold" />
                        <span>{new Date(selectedArticle.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="text-krmuted hover:text-krgold transition-colors text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="relative h-64 bg-gradient-to-r from-krgold/20 to-krgold/10 rounded-lg mb-6 flex items-center justify-center">
                  {selectedArticle.image ? (
                    <img
                      src={selectedArticle.image}
                      alt={selectedArticle.title}
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const parent = img.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="flex items-center justify-center h-64 text-krgold"><span class="text-6xl">${categories.find(c => c.id === selectedArticle.category)?.icon || '📰'}</span></div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-krgold">
                      <span className="text-6xl">{categories.find(c => c.id === selectedArticle.category)?.icon || '📰'}</span>
                    </div>
                  )}
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-white leading-relaxed text-lg">
                    {selectedArticle.summary}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 bg-krgold/10 backdrop-blur-sm rounded-xl border border-krgold/30 p-4">
          <p className="text-sm text-center text-krmuted">
            <span className="text-krgold font-semibold">Multi-Market News Coverage:</span> 
            <span className="text-krgold mx-2">🔥 Crypto</span> • 
            <span className="text-krsuccess mx-2">📈 Stocks</span> • 
            <span className="text-kryellow mx-2">💱 Forex</span> • 
            <span className="text-krwhite mx-2">🌍 Global</span> • 
            <span className="text-krgold">LIVE updates every 1 minute from RSS feeds</span>
          </p>
        </div>
      </div>

      {/* News Ticker Styles */}
      <style>{`
        .news-ticker-wrapper {
          overflow: hidden;
        }
        .news-ticker {
          display: flex;
          animation: scroll-left 20s linear infinite;
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}