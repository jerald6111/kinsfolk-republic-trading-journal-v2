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
  const [activeCategory, setActiveCategory] = useState<'crypto' | 'stocks' | 'forex' | 'world'>('crypto')
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [fetchingNew, setFetchingNew] = useState(false)
  const articlesPerPage = 12

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
    const fetchNews = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true)
        } else {
          setFetchingNew(true)
        }
        const newArticles: NewsItem[] = []

        // CRYPTO NEWS - CoinTelegraph RSS
        try {
          const cryptoResponse = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss')
          const cryptoData = await cryptoResponse.json()
          
          if (cryptoData.items) {
            const cryptoNews = cryptoData.items.map((item: any) => ({
              id: `crypto-${Date.now()}-${Math.random()}`,
              title: item.title,
              source: 'CoinTelegraph',
              publishedAt: item.pubDate,
              category: 'crypto' as const,
              summary: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
              url: item.link,
              image: item.enclosure?.link || item.thumbnail || generateNewsImage(item.title, 'crypto')
            }))
            newArticles.push(...cryptoNews)
          }
        } catch (error) {
          console.error('Failed to fetch crypto news:', error)
        }

        // STOCKS NEWS - MarketWatch RSS
        try {
          const stocksResponse = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://feeds.marketwatch.com/marketwatch/topstories/')
          const stocksData = await stocksResponse.json()
          
          if (stocksData.items) {
            const stocksNews = stocksData.items.map((item: any) => ({
              id: `stocks-${Date.now()}-${Math.random()}`,
              title: item.title,
              source: 'MarketWatch',
              publishedAt: item.pubDate,
              category: 'stocks' as const,
              summary: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
              url: item.link,
              image: item.enclosure?.link || item.thumbnail || generateNewsImage(item.title, 'stocks')
            }))
            newArticles.push(...stocksNews)
          }
        } catch (error) {
          console.error('Failed to fetch stocks news:', error)
        }

        // FOREX NEWS - ForexLive RSS  
        try {
          const forexResponse = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.forexlive.com/feed/')
          const forexData = await forexResponse.json()
          
          if (forexData.items) {
            const forexNews = forexData.items.map((item: any) => ({
              id: `forex-${Date.now()}-${Math.random()}`,
              title: item.title,
              source: 'ForexLive',
              publishedAt: item.pubDate,
              category: 'forex' as const,
              summary: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
              url: item.link,
              image: item.enclosure?.link || item.thumbnail || generateNewsImage(item.title, 'forex')
            }))
            newArticles.push(...forexNews)
          }
        } catch (error) {
          console.error('Failed to fetch forex news:', error)
        }

        // WORLD NEWS - BBC World News RSS (Better Global Coverage)
        try {
          const worldResponse = await fetch('https://api.rss2json.com/v1/api.json?rss_url=http://feeds.bbci.co.uk/news/world/rss.xml')
          const worldData = await worldResponse.json()
          
          if (worldData.items) {
            const worldNews = worldData.items.map((item: any) => ({
              id: `world-${Date.now()}-${Math.random()}`,
              title: item.title,
              source: 'BBC News',
              publishedAt: item.pubDate,
              category: 'world' as const,
              summary: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
              url: item.link,
              image: item.enclosure?.link || item.thumbnail || generateNewsImage(item.title, 'world')
            }))
            allNews.push(...worldNews)
          }
        } catch (error) {
          console.error('Failed to fetch world news:', error)
          // Try alternative global news source
          try {
            const altResponse = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://feeds.npr.org/1001/rss.xml')
            const altData = await altResponse.json()
            
            if (altData.items) {
              const worldNews = altData.items.map((item: any) => ({
                id: `world-${Date.now()}-${Math.random()}`,
                title: item.title,
                source: 'NPR',
                publishedAt: item.pubDate,
                category: 'world' as const,
                summary: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
                url: item.link,
                image: item.enclosure?.link || item.thumbnail || generateNewsImage(item.title, 'world')
              }))
              newArticles.push(...worldNews)
            }
          } catch (altError) {
            console.error('Failed to fetch alternative world news:', altError)
          }
        }

        // Stack new articles with existing ones (avoid duplicates)
        setNewsItems(prevItems => {
          const existingIds = new Set(prevItems.map(item => item.url || item.title))
          const uniqueNewArticles = newArticles.filter(article => 
            !existingIds.has(article.url || article.title)
          )
          
          // Add new articles to the beginning and keep recent 200 articles max
          const combined = [...uniqueNewArticles, ...prevItems]
          return combined.slice(0, 200) // Keep last 200 articles for performance
        })
        
      } catch (error) {
        console.error('Failed to fetch live news:', error)
        // Don't clear existing articles on error - keep what we have
      } finally {
        setLoading(false)
        setFetchingNew(false)
      }
    }

    fetchNews(true) // Initial load
    const interval = setInterval(() => fetchNews(false), 60 * 1000) // Refresh every 1 minute for truly LIVE updates
    
    return () => clearInterval(interval)
  }, [])

  // Get news filtered by category with crypto as main focus - memoized to prevent stale state
  const filteredNews = useMemo(() => {
    return newsItems.filter(item => item.category === activeCategory)
  }, [newsItems, activeCategory])

  // Pagination logic
  const totalPages = Math.ceil(filteredNews.length / articlesPerPage)
  const paginatedNews = useMemo(() => {
    const startIndex = (currentPage - 1) * articlesPerPage
    return filteredNews.slice(startIndex, startIndex + articlesPerPage)
  }, [filteredNews, currentPage, articlesPerPage])

  // Reset pagination when category changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeCategory])
  
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-krblack to-gray-950 text-krtext relative overflow-hidden">
      {/* Animated gradient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-krgold/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-kryellow/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* News Ticker */}
        <div className="bg-krblack/50 backdrop-blur-sm border-b border-krgold/30 py-2">
        <div className="news-ticker-wrapper">
          <div className="news-ticker">
            {tickerNews.map((item, index) => (
              <div key={`${item.id}-${index}`} className="news-ticker-item px-8">
                <span className="text-krgold font-semibold">{item.source}:</span>
                <span className="ml-2 text-krtext">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-krgold to-kryellow flex items-center justify-center">
              <span className="text-krblack font-bold text-sm">📰</span>
            </div>
            <h1 className="text-3xl font-bold text-krtext">Market News</h1>
            {fetchingNew && (
              <div className="ml-4 flex items-center gap-2 text-krgold text-sm">
                <div className="animate-spin w-4 h-4 border-2 border-krgold border-t-transparent rounded-full"></div>
                <span>Fetching latest news...</span>
              </div>
            )}
          </div>
          <p className="text-krmuted text-lg">
            Multi-market intelligence, economic events, and live trading insights • Updates every minute
          </p>
        </div>

        {/* Category Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeCategory === category.id
                    ? 'bg-krgold text-krblack shadow-lg shadow-krgold/20'
                    : 'bg-krcard border border-krborder text-krtext hover:border-krgold/50 hover:bg-krgold/10'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
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



        {/* News Grid - Paginated articles */}
        {!loading && paginatedNews.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-krtext">
                {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} News 
                <span className="text-krmuted text-sm font-normal ml-2">
                  ({filteredNews.length} articles)
                </span>
              </h2>
              <div className="text-sm text-krmuted">
                Page {currentPage} of {totalPages}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedNews.map((article, index) => (
              <div
                key={article.id}
                className="bg-krcard border border-krborder rounded-lg overflow-hidden hover:border-krgold/50 transition-all duration-200 cursor-pointer group"
                onClick={() => setSelectedArticle(article)}
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-krgray/20 overflow-hidden">
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
                          parent.innerHTML = `<div class="flex items-center justify-center h-48 text-krgold bg-krgray/20"><span class="text-4xl">${categories.find(c => c.id === article.category)?.icon || '📰'}</span></div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-krgold bg-krgray/20">
                      <span className="text-4xl">{categories.find(c => c.id === article.category)?.icon || '📰'}</span>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2">
                    <div className="bg-krblack/80 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1">
                      <span className="text-krgold text-xs">{categories.find(c => c.id === article.category)?.icon}</span>
                      <span className="text-krtext text-xs font-medium capitalize">{article.category}</span>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-krtext group-hover:text-krgold transition-colors duration-200 line-clamp-2 mb-3">
                    {article.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-xs text-krmuted">
                    <span className="text-krgold font-medium">{article.source}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm bg-krcard border border-krborder rounded-lg text-krtext hover:border-krgold/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-krgold text-krblack font-medium'
                          : 'bg-krcard border border-krborder text-krtext hover:border-krgold/50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm bg-krcard border border-krborder rounded-lg text-krtext hover:border-krgold/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
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
            <div className="bg-krcard border border-krborder rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-krborder">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-krtext mb-2">{selectedArticle.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-krmuted">
                      <span className="text-krgold font-medium">{selectedArticle.source}</span>
                      <span>{new Date(selectedArticle.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="text-krmuted hover:text-krgold transition-colors text-xl ml-4"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {selectedArticle.image && (
                  <div className="relative h-48 bg-krgray/20 rounded-lg mb-4 overflow-hidden">
                    <img
                      src={selectedArticle.image}
                      alt={selectedArticle.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <p className="text-krtext leading-relaxed">
                  {selectedArticle.summary}
                </p>
                {selectedArticle.url && selectedArticle.url !== '#' && (
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 text-krgold hover:text-kryellow transition-colors"
                  >
                    Read Full Article <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 bg-krcard border border-krborder rounded-lg p-4">
          <p className="text-sm text-center text-krmuted">
            <span className="text-krgold font-semibold">Live Feed Sources:</span> 
            <span className="text-krgold mx-1">CoinTelegraph</span> • 
            <span className="text-krsuccess mx-1">MarketWatch</span> • 
            <span className="text-kryellow mx-1">ForexLive</span> • 
            <span className="text-krtext mx-1">BBC News</span> • 
            <span className="text-krgold">Updated every minute</span>
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