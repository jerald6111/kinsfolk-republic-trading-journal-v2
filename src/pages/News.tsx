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
    const baseUrl = 'https://source.unsplash.com/400x250/?'
    
    const keywords: Record<string, string[]> = {
      crypto: ['bitcoin', 'cryptocurrency', 'blockchain', 'digital currency', 'ethereum'],
      stocks: ['stock market', 'trading', 'business', 'finance', 'wall street'],
      forex: ['currency', 'exchange', 'money', 'global finance', 'international trade'],
      world: ['global news', 'international', 'world', 'politics', 'economy']
    }
    
    // Extract key terms from title for more contextual images
    const titleWords = title.toLowerCase()
    let contextualKeywords = keywords[category as keyof typeof keywords] || ['news', 'business']
    
    // Add specific keywords based on title content
    if (titleWords.includes('oil') || titleWords.includes('energy')) {
      contextualKeywords = ['oil', 'energy', 'petroleum']
    } else if (titleWords.includes('gold') || titleWords.includes('precious')) {
      contextualKeywords = ['gold', 'precious metals', 'investment']
    } else if (titleWords.includes('tech') || titleWords.includes('ai') || titleWords.includes('nvidia')) {
      contextualKeywords = ['technology', 'computer', 'innovation']
    } else if (titleWords.includes('bank') || titleWords.includes('federal')) {
      contextualKeywords = ['banking', 'federal reserve', 'finance']
    }
    
    const randomKeyword = contextualKeywords[Math.floor(Math.random() * contextualKeywords.length)]
    return `${baseUrl}${encodeURIComponent(randomKeyword)}`
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

  // Category display configuration  
  const categories = [
    { id: 'crypto' as const, label: 'Crypto', color: 'text-orange-400', icon: '🔥' },
    { id: 'stocks' as const, label: 'Stocks', color: 'text-blue-400', icon: '📈' },
    { id: 'forex' as const, label: 'Forex', color: 'text-green-400', icon: '💱' },
    { id: 'world' as const, label: 'Global', color: 'text-purple-400', icon: '🌍' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
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
          <div className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm rounded-xl p-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeCategory === category.id
                    ? 'bg-krgold text-black shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
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

        {/* Featured News Section */}
        {!loading && featuredNews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-krgold">Featured Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredNews.map((article) => (
                <div
                  key={article.id}
                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl border border-krgold/20 overflow-hidden hover:border-krgold/40 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedArticle(article)}
                >
                  {article.image && (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = generateNewsImage(article.title, article.category);
                      }}
                    />
                  )}
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
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden hover:border-krgold/50 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedArticle(article)}
              >
                {article.image && (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = generateNewsImage(article.title, article.category);
                    }}
                  />
                )}
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-krgold/30">
              <div className="sticky top-0 bg-gradient-to-r from-gray-800 to-gray-900 p-6 border-b border-gray-700/50 backdrop-blur-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedArticle.title}</h2>
                    <div className="flex items-center space-x-4 text-sm text-krmuted">
                      <span className="text-krgold font-medium">{selectedArticle.source}</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(selectedArticle.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="text-gray-400 hover:text-white transition-colors text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {selectedArticle.image && (
                  <img
                    src={selectedArticle.image}
                    alt={selectedArticle.title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = generateNewsImage(selectedArticle.title, selectedArticle.category);
                    }}
                  />
                )}
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed text-lg">
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
            <span className="text-orange-400 mx-2">🔥 Crypto</span> • 
            <span className="text-blue-400 mx-2">📈 Stocks</span> • 
            <span className="text-green-400 mx-2">💱 Forex</span> • 
            <span className="text-purple-400 mx-2">🌍 Global</span> • 
            LIVE updates every 1 minute from RSS feeds
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