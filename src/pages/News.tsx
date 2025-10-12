import React, { useEffect, useState } from 'react'
import { Zap, Globe, DollarSign, Bitcoin, BarChart3, TrendingUp, Clock, ExternalLink } from 'lucide-react'

// News item interface with categories
interface NewsItem {
  id: string
  title: string
  source: string
  publishedAt: string
  category: 'crypto' | 'stocks' | 'forex' | 'world'
  summary?: string
  url?: string
}

export default function News() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<'crypto' | 'stocks' | 'forex' | 'world'>('crypto')
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([])
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null)

  // Fetch comprehensive news data
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      try {
        // Enhanced multi-category news with summaries
        const comprehensiveNews: NewsItem[] = [
          // Crypto News (Main focus)
          { 
            id: '1', 
            title: 'Bitcoin Surges Past $45,000 as Institutional Adoption Grows', 
            source: 'Cointelegraph', 
            publishedAt: new Date().toISOString(), 
            category: 'crypto',
            summary: 'Major financial institutions continue to add Bitcoin to their portfolios, driving price momentum and market confidence.',
            url: '#'
          },
          { 
            id: '2', 
            title: 'Ethereum Layer-2 Solutions See Record Trading Volume', 
            source: 'CoinDesk', 
            publishedAt: new Date().toISOString(), 
            category: 'crypto',
            summary: 'Arbitrum and Optimism report unprecedented transaction volumes as users seek lower gas fees.',
            url: '#'
          },
          { 
            id: '3', 
            title: 'Major Exchange Announces New Staking Rewards Program', 
            source: 'Decrypt', 
            publishedAt: new Date().toISOString(), 
            category: 'crypto',
            summary: 'Enhanced staking yields and new supported tokens attract retail and institutional investors.',
            url: '#'
          },
          { 
            id: '4', 
            title: 'DeFi Protocol Introduces Revolutionary Lending Mechanism', 
            source: 'The Block', 
            publishedAt: new Date().toISOString(), 
            category: 'crypto',
            summary: 'New protocol offers dynamic interest rates and cross-chain compatibility for borrowers and lenders.',
            url: '#'
          },
          { 
            id: '5', 
            title: 'NFT Marketplace Reports All-Time High Trading Activity', 
            source: 'Cointelegraph', 
            publishedAt: new Date().toISOString(), 
            category: 'crypto',
            summary: 'Digital art and collectibles market shows resilience with increasing mainstream adoption.',
            url: '#'
          },
          { 
            id: '6', 
            title: 'Blockchain Gaming Platform Secures Major Investment', 
            source: 'CoinDesk', 
            publishedAt: new Date().toISOString(), 
            category: 'crypto',
            summary: 'Gaming studio raises $50M to develop next-generation play-to-earn blockchain games.',
            url: '#'
          },
          
          // Stocks News
          { 
            id: '7', 
            title: 'Tech Giants Rally as Q4 Earnings Exceed Expectations', 
            source: 'MarketWatch', 
            publishedAt: new Date().toISOString(), 
            category: 'stocks',
            summary: 'Apple, Microsoft, and Google report strong quarterly results, driving NASDAQ to new highs.',
            url: '#'
          },
          { 
            id: '8', 
            title: 'S&P 500 Reaches New All-Time High Amid Economic Optimism', 
            source: 'Bloomberg', 
            publishedAt: new Date().toISOString(), 
            category: 'stocks',
            summary: 'Positive economic indicators and corporate earnings fuel investor confidence across major indices.',
            url: '#'
          },
          { 
            id: '9', 
            title: 'Energy Sector Leads Market Gains Following Oil Price Surge', 
            source: 'CNBC', 
            publishedAt: new Date().toISOString(), 
            category: 'stocks',
            summary: 'Crude oil prices climb as global demand increases and supply constraints persist.',
            url: '#'
          },
          { 
            id: '10', 
            title: 'Pharmaceutical Stocks Jump on Breakthrough Drug Approval', 
            source: 'Reuters', 
            publishedAt: new Date().toISOString(), 
            category: 'stocks',
            summary: 'FDA approves innovative treatment for rare disease, boosting biotech sector valuations.',
            url: '#'
          },
          
          // Forex News
          { 
            id: '11', 
            title: 'USD Strengthens Against Major Currencies After Fed Comments', 
            source: 'ForexLive', 
            publishedAt: new Date().toISOString(), 
            category: 'forex',
            summary: 'Federal Reserve hints at continued hawkish stance, supporting dollar strength across currency pairs.',
            url: '#'
          },
          { 
            id: '12', 
            title: 'EUR/USD Falls as ECB Maintains Dovish Stance', 
            source: 'DailyFX', 
            publishedAt: new Date().toISOString(), 
            category: 'forex',
            summary: 'European Central Bank signals cautious approach to rate changes amid economic uncertainty.',
            url: '#'
          },
          { 
            id: '13', 
            title: 'GBP Volatile Following Bank of England Rate Decision', 
            source: 'FX Street', 
            publishedAt: new Date().toISOString(), 
            category: 'forex',
            summary: 'British pound experiences increased volatility as BoE delivers mixed signals on future policy.',
            url: '#'
          },
          { 
            id: '14', 
            title: 'Japanese Yen Weakens on Inflation Data Release', 
            source: 'Investing.com', 
            publishedAt: new Date().toISOString(), 
            category: 'forex',
            summary: 'Lower-than-expected inflation figures raise questions about Bank of Japan monetary policy.',
            url: '#'
          },
          
          // World Economic News
          { 
            id: '15', 
            title: 'Global Inflation Rates Show Signs of Stabilization', 
            source: 'Financial Times', 
            publishedAt: new Date().toISOString(), 
            category: 'world',
            summary: 'International economic data suggests inflationary pressures may be beginning to ease globally.',
            url: '#'
          },
          { 
            id: '16', 
            title: 'IMF Raises Global Growth Forecast for 2025', 
            source: 'Wall Street Journal', 
            publishedAt: new Date().toISOString(), 
            category: 'world',
            summary: 'International Monetary Fund revises economic projections upward citing improving conditions.',
            url: '#'
          },
          { 
            id: '17', 
            title: 'Central Banks Coordinate on Digital Currency Initiatives', 
            source: 'Reuters', 
            publishedAt: new Date().toISOString(), 
            category: 'world',
            summary: 'Major central banks announce collaboration framework for cross-border digital currency projects.',
            url: '#'
          },
          { 
            id: '18', 
            title: 'Emerging Markets See Capital Inflows Amid Risk-On Sentiment', 
            source: 'Bloomberg', 
            publishedAt: new Date().toISOString(), 
            category: 'world',
            summary: 'Developing economies attract increased investment as global risk appetite improves.',
            url: '#'
          },
        ]
        
        setNewsItems(comprehensiveNews)
        
        // Set featured news (crypto as main focus)
        const featured = comprehensiveNews.filter(item => item.category === 'crypto').slice(0, 3)
        setFeaturedNews(featured)
        
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

  // Get news filtered by category with crypto as main focus
  const filteredNews = newsItems.filter(item => item.category === activeCategory)
  
  // Get ticker news prioritizing crypto
  const tickerNews = [
    ...newsItems.filter(item => item.category === 'crypto').slice(0, 4),
    ...newsItems.filter(item => item.category === 'stocks').slice(0, 2),
    ...newsItems.filter(item => item.category === 'forex').slice(0, 1),
    ...newsItems.filter(item => item.category === 'world').slice(0, 1)
  ]

  const categoryIcons = {
    crypto: <Bitcoin className="w-5 h-5" />,
    stocks: <BarChart3 className="w-5 h-5" />,
    forex: <DollarSign className="w-5 h-5" />,
    world: <Globe className="w-5 h-5" />
  }

  const categoryColors = {
    crypto: 'from-orange-500/20 to-yellow-500/20 border-orange-500/30',
    stocks: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    forex: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    world: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30'
  }

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
              <Globe className="text-krgold" size={36} />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">
                  Market News Hub
                </h1>
                <p className="text-krmuted text-sm md:text-base mt-1">
                  Breaking news from crypto, stocks, forex & global markets
                </p>
              </div>
            </div>
          </div>

          {/* News Ticker */}
          <div className="mb-8 bg-krcard/80 backdrop-blur-md rounded-xl border border-krborder/50 p-4 overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Zap className="text-krgold animate-pulse" size={20} />
                <span className="text-xs font-bold text-krgold uppercase tracking-wide">Live Feed</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="news-ticker-wrapper">
                  <div className="news-ticker">
                    {tickerNews.map((item) => (
                      <span key={item.id} className="news-ticker-item">
                        <span className="text-krtext font-medium">{item.title}</span>
                        <span className="text-krmuted mx-6">•</span>
                      </span>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {tickerNews.map((item) => (
                      <span key={`${item.id}-dup`} className="news-ticker-item">
                        <span className="text-krtext font-medium">{item.title}</span>
                        <span className="text-krmuted mx-6">•</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Featured News Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-krtext mb-6 flex items-center gap-3">
              <TrendingUp className="text-krgold" />
              Featured Crypto News
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredNews.map((article) => (
                <div
                  key={article.id}
                  className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-xl p-6 hover:scale-[1.02] transition-all cursor-pointer"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Bitcoin className="text-orange-400 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-krtext">
                        {article.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-krmuted text-sm mb-4 line-clamp-2">
                    {article.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-orange-400 font-medium">{article.source}</span>
                    <span className="text-krmuted flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Navigation */}
          <div className="mb-6 flex justify-center">
            <div className="bg-krcard/90 backdrop-blur-md rounded-xl border border-krborder/50 p-2 flex gap-2">
              {(['crypto', 'stocks', 'forex', 'world'] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeCategory === category
                      ? 'bg-krgold text-krblack shadow-lg'
                      : 'text-krmuted hover:text-krtext hover:bg-krblack/40'
                  }`}
                >
                  {categoryIcons[category]}
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((article) => (
              <div
                key={article.id}
                className={`bg-gradient-to-br ${categoryColors[article.category]} border rounded-xl p-6 hover:scale-[1.02] transition-all cursor-pointer backdrop-blur-sm`}
                onClick={() => setSelectedArticle(article)}
              >
                <div className="flex items-start gap-3 mb-3">
                  {categoryIcons[article.category]}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-krtext">
                      {article.title}
                    </h3>
                  </div>
                </div>
                {article.summary && (
                  <p className="text-krmuted text-sm mb-4 line-clamp-3">
                    {article.summary}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-krgold font-medium">{article.source}</span>
                  <span className="text-krmuted flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-3 flex items-center text-xs text-krmuted">
                  <ExternalLink size={12} className="mr-1" />
                  Click to read more
                </div>
              </div>
            ))}
          </div>

          {/* Article Modal */}
          {selectedArticle && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-krcard border border-krborder rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-krborder">
                  <div className="flex items-center gap-3">
                    {categoryIcons[selectedArticle.category]}
                    <div>
                      <h2 className="text-xl font-semibold text-krtext">{selectedArticle.source}</h2>
                      <p className="text-xs text-krmuted">
                        {new Date(selectedArticle.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="text-krmuted hover:text-krtext transition-colors text-2xl"
                  >
                    ×
                  </button>
                </div>
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-krtext mb-4">
                    {selectedArticle.title}
                  </h1>
                  {selectedArticle.summary && (
                    <p className="text-krmuted text-lg mb-6 leading-relaxed">
                      {selectedArticle.summary}
                    </p>
                  )}
                  <div className="bg-krgold/10 border border-krgold/30 rounded-lg p-4">
                    <p className="text-sm text-krmuted">
                      This is a sample article preview. In a full implementation, this would contain the complete article content from the news API.
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
              Updates every 5 minutes
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
