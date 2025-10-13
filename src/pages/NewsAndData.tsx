import React, { useEffect, useRef, useState } from 'react'
import { Calendar, TrendingUp, TrendingDown, Activity, Zap, Globe, DollarSign, Bitcoin, BarChart3, Clock, ExternalLink } from 'lucide-react'

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

// News item interface
interface NewsItem {
  id: string
  title: string
  source: string
  publishedAt: string
  fetchedAt: string // When we fetched this article
  category: 'crypto' | 'stocks' | 'forex' | 'world'
  summary?: string
  url?: string
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
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [newsPerPage] = useState(20)

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

  // Fetch crypto market data from CoinGecko API
  useEffect(() => {
    const fetchCryptoData = async () => {
      setCryptoLoading(true)
      try {
        // Add cache-busting timestamp for fresh data
        const timestamp = Date.now()
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&price_change_percentage=1h,24h,7d&_t=${timestamp}`)
        const data = await response.json()
        if (!Array.isArray(data)) { throw new Error('Invalid API response') }
        
        const getChangeField = (timeframe: string) => {
          switch (timeframe) {
            case '1h': return 'price_change_percentage_1h_in_currency'
            case '24h': return 'price_change_percentage_24h'
            case '7d': return 'price_change_percentage_7d_in_currency'
            default: return 'price_change_percentage_24h'
          }
        }
        
        const gainersChangeField = getChangeField(gainersTimeframe)
        const gainersData = data.map(coin => ({ ...coin, price_change_percentage_24h: coin[gainersChangeField] || coin.price_change_percentage_24h || 0 }))
        const sortedGainers = [...gainersData].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        const gainers = sortedGainers.filter(coin => coin.price_change_percentage_24h > 0).slice(0, 10)
        setTopGainers(gainers)
        
        const losersChangeField = getChangeField(losersTimeframe)
        const losersData = data.map(coin => ({ ...coin, price_change_percentage_24h: coin[losersChangeField] || coin.price_change_percentage_24h || 0 }))
        const sortedLosers = [...losersData].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
        const losers = sortedLosers.filter(coin => coin.price_change_percentage_24h < 0).slice(0, 10)
        setTopLosers(losers)
      } catch (error) {
        console.error('Error fetching crypto data:', error)
        const sampleGainers: CryptoData[] = [{ id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 45280, price_change_percentage_24h: 8.5, market_cap: 885000000000, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', market_cap_rank: 1 }]
        const sampleLosers: CryptoData[] = [{ id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.45, price_change_percentage_24h: -4.2, market_cap: 15800000000, image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png', market_cap_rank: 8 }]
        setTopGainers(sampleGainers)
        setTopLosers(sampleLosers)
      } finally {
        setCryptoLoading(false)
      }
    }
    fetchCryptoData()
    const interval = setInterval(fetchCryptoData, 60 * 1000)
    return () => clearInterval(interval)
  }, [gainersTimeframe, losersTimeframe])

  // Fetch comprehensive news data with accumulation/stacking
  useEffect(() => {
    const fetchNews = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) setLoading(true)
        const allNewNews: NewsItem[] = []
        const fetchTimestamp = new Date().toLocaleString('en-US', {
          month: 'long',
          day: 'numeric', 
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
        const cacheTimestamp = Date.now()

        console.log(`🔄 Fetching news at: ${fetchTimestamp}`)

        // CRYPTO NEWS - CoinTelegraph RSS
        try {
          const cryptoResponse = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss&count=20&_t=${cacheTimestamp}`)
          const cryptoData = await cryptoResponse.json()
          
          if (cryptoData.items && cryptoData.items.length > 0) {
            console.log(`✅ Fetched ${cryptoData.items.length} crypto articles`)
            const cryptoNews = cryptoData.items.map((item: any) => ({
              id: `crypto-${item.guid || item.link}-${new Date(item.pubDate).getTime()}`,
              title: item.title,
              source: 'CoinTelegraph',
              publishedAt: item.pubDate,
              fetchedAt: fetchTimestamp,
              category: 'crypto' as const,
              summary: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
              url: item.link
            }))
            allNewNews.push(...cryptoNews)
          }
        } catch (error) {
          console.error('❌ Failed to fetch crypto news:', error)
        }

        // STOCKS NEWS - MarketWatch RSS
        try {
          const stocksResponse = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://feeds.marketwatch.com/marketwatch/topstories/&count=20&_t=${cacheTimestamp}`)
          const stocksData = await stocksResponse.json()
          
          if (stocksData.items && stocksData.items.length > 0) {
            console.log(`✅ Fetched ${stocksData.items.length} stocks articles`)
            const stocksNews = stocksData.items.map((item: any) => ({
              id: `stocks-${item.guid || item.link}-${new Date(item.pubDate).getTime()}`,
              title: item.title,
              source: 'MarketWatch',
              publishedAt: item.pubDate,
              fetchedAt: fetchTimestamp,
              category: 'stocks' as const,
              summary: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
              url: item.link
            }))
            allNewNews.push(...stocksNews)
          }
        } catch (error) {
          console.error('❌ Failed to fetch stocks news:', error)
        }

        // FOREX NEWS - ForexLive RSS  
        try {
          const forexResponse = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://www.forexlive.com/feed/&count=20&_t=${cacheTimestamp}`)
          const forexData = await forexResponse.json()
          
          if (forexData.items && forexData.items.length > 0) {
            console.log(`✅ Fetched ${forexData.items.length} forex articles`)
            const forexNews = forexData.items.map((item: any) => ({
              id: `forex-${item.guid || item.link}-${new Date(item.pubDate).getTime()}`,
              title: item.title,
              source: 'ForexLive',
              publishedAt: item.pubDate,
              fetchedAt: fetchTimestamp,
              category: 'forex' as const,
              summary: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
              url: item.link
            }))
            allNewNews.push(...forexNews)
          }
        } catch (error) {
          console.error('❌ Failed to fetch forex news:', error)
        }

        // WORLD NEWS - BBC World News RSS
        try {
          const worldResponse = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=http://feeds.bbci.co.uk/news/world/rss.xml&count=20&_t=${cacheTimestamp}`)
          const worldData = await worldResponse.json()
          
          if (worldData.items && worldData.items.length > 0) {
            console.log(`✅ Fetched ${worldData.items.length} world articles`)
            const worldNews = worldData.items.map((item: any) => ({
              id: `world-${item.guid || item.link}-${new Date(item.pubDate).getTime()}`,
              title: item.title,
              source: 'BBC News',
              publishedAt: item.pubDate,
              fetchedAt: fetchTimestamp,
              category: 'world' as const,
              summary: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
              url: item.link
            }))
            allNewNews.push(...worldNews)
          }
        } catch (error) {
          console.error('❌ Failed to fetch world news:', error)
        }
        
        console.log(`📊 Total articles fetched: ${allNewNews.length}`)
        
        // Stack/accumulate news instead of replacing
        setNewsItems(prevNews => {
          if (isInitialLoad) {
            return allNewNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          }
          
          // Filter out duplicates by comparing title AND source
          const existingKeys = new Set(prevNews.map(item => `${item.title}-${item.source}`))
          const uniqueNewNews = allNewNews.filter(item => !existingKeys.has(`${item.title}-${item.source}`))
          
          console.log(`🆕 ${uniqueNewNews.length} new unique articles added`)
          
          // Combine and sort by published date (newest first)
          const combined = [...uniqueNewNews, ...prevNews]
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          
          // Keep maximum of 500 items to prevent memory issues
          return combined.slice(0, 500)
        })
      } catch (error) {
        console.error('❌ Error fetching live news:', error)
      } finally {
        if (isInitialLoad) setLoading(false)
      }
    }
    
    console.log('🚀 News feed system initialized - fetching every 60 seconds')
    fetchNews(true) // Initial load
    const interval = setInterval(() => fetchNews(false), 60 * 1000) // Stack new news every 1 minute
    return () => {
      clearInterval(interval)
      console.log('⏹️ News feed system stopped')
    }
  }, [])

  const filteredNews = newsItems.filter(item => item.category === activeNewsCategory)
  const tickerNews = [ ...newsItems.filter(item => item.category === 'crypto').slice(0, 4), ...newsItems.filter(item => item.category === 'stocks').slice(0, 2), ...newsItems.filter(item => item.category === 'forex').slice(0, 1), ...newsItems.filter(item => item.category === 'world').slice(0, 1) ]
  
  // Pagination logic
  const startIndex = (currentPage - 1) * newsPerPage
  const endIndex = startIndex + newsPerPage
  const paginatedNews = filteredNews.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredNews.length / newsPerPage)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  const categoryIcons = {
    crypto: <Bitcoin className="w-5 h-5" />,
    stocks: <BarChart3 className="w-5 h-5" />,
    forex: <DollarSign className="w-5 h-5" />,
    world: <Globe className="w-5 h-5" />
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
              <span className="text-4xl">⚡</span>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">
                News & Data Center
              </h1>
            </div>
            <p className="text-krmuted text-sm md:text-base ml-14">
              Multi-market intelligence, economic events, and live trading insights
            </p>
          </div>

          {/* Live Feed Ticker */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📡</span>
                <h2 className="text-xl font-semibold text-krtext">LIVE FEED</h2>
                <span className="text-xs text-green-400 animate-pulse">● LIVE</span>
              </div>
              <div className="text-xs text-krmuted">
                Updates every 60s • {newsItems.length} articles loaded
              </div>
            </div>
            <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 transition-all duration-200 p-4">
              <div className="overflow-hidden">
                <div className="flex animate-ticker-fast whitespace-nowrap">
                  {newsItems.slice(0, 30).concat(newsItems.slice(0, 30)).map((item, index) => (
                    <span key={index} className="mx-6 text-sm flex items-center">
                      <span className="text-krgold mr-2">•</span>
                      <span className="text-krtext">{item.title}</span>
                      <span className="text-krmuted ml-3 text-xs">- {item.source}</span>
                      <span className="text-green-400 ml-2 text-xs">⟳ {item.fetchedAt}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column: Economic Calendar (Expanded) */}
            <div className="xl:col-span-2">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">�</span>
                  <h2 className="text-xl font-semibold text-krtext">Economic Calendar</h2>
                </div>
                <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-6 h-[calc(100vh-280px)]">
                  <div ref={calendarRef} className="h-full w-full"></div>
                </div>
              </div>
            </div>
                
            {/* Right Column: Market News & Crypto Data */}
            <div className="xl:col-span-1 space-y-6">
              {/* Market News */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📰</span>
                  <h2 className="text-xl font-semibold text-krtext">Market News</h2>
                </div>
                
                {/* Category Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(Object.keys(categoryIcons) as Array<keyof typeof categoryIcons>).map(cat => (
                    <button
                      key={cat}
                      onClick={() => {setActiveNewsCategory(cat); setCurrentPage(1)}}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        activeNewsCategory === cat 
                          ? 'bg-krgold text-krblack' 
                          : 'bg-krcard/60 text-krmuted hover:bg-krcard border border-krborder hover:border-krgold/50'
                      }`}
                    >
                      <span className="flex items-center space-x-1">
                        {categoryIcons[cat]}
                        <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                      </span>
                    </button>
                  ))}
                </div>

                {/* News List */}
                <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-4 h-80">
                  <div className="space-y-3 crypto-list-scroll max-h-full overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-krgold"></div>
                      </div>
                    ) : (
                      <>
                        {paginatedNews.map(item => (
                          <div 
                            key={item.id} 
                            className="bg-krblack/40 rounded-lg hover:bg-krblack/60 transition-all p-3 cursor-pointer"
                            onClick={() => setSelectedArticle(item)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {categoryIcons[item.category]}
                                <span className="text-xs text-krgold font-medium">
                                  {item.category.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            
                            <h3 className="font-medium text-krtext text-sm mb-2 line-clamp-2">
                              {item.title}
                            </h3>
                            
                            <div className="flex flex-col gap-1 text-xs text-krmuted">
                              <div className="flex items-center justify-between">
                                <span>{item.source}</span>
                                <span>Published: {new Date(item.publishedAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1 text-green-400">
                                <Clock className="w-3 h-3" />
                                <span className="text-xs">Fetched: {item.fetchedAt}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-krborder">
                            <div className="text-xs text-krmuted">
                              Page {currentPage} of {totalPages} ({filteredNews.length} total articles)
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {setCurrentPage(prev => prev - 1); setActiveNewsCategory(activeNewsCategory)}}
                                disabled={!hasPrevPage}
                                className={`px-3 py-1 text-xs rounded ${
                                  hasPrevPage 
                                    ? 'bg-krgold text-krblack hover:bg-kryellow' 
                                    : 'bg-krcard text-krmuted cursor-not-allowed'
                                }`}
                              >
                                Previous
                              </button>
                              <button
                                onClick={() => {setCurrentPage(prev => prev + 1); setActiveNewsCategory(activeNewsCategory)}}
                                disabled={!hasNextPage}
                                className={`px-3 py-1 text-xs rounded ${
                                  hasNextPage 
                                    ? 'bg-krgold text-krblack hover:bg-kryellow' 
                                    : 'bg-krcard text-krmuted cursor-not-allowed'
                                }`}
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Crypto Gainers & Losers */}
              <div className="grid grid-cols-1 gap-6">
                {/* Top Gainers */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🚀</span>
                    <h3 className="text-lg font-semibold text-krtext">Top Gainers</h3>
                  </div>
                  <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-4">
                    {cryptoLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-krgold"></div>
                      </div>
                    ) : (
                      <div className="space-y-3 crypto-list-scroll max-h-[300px] overflow-y-auto">
                        {topGainers.slice(0, 5).map((coin, index) => (
                          <div key={coin.id} className="flex items-center justify-between p-3 bg-krblack/40 rounded-lg hover:bg-krblack/60 transition-all">
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-krgold font-bold w-6">#{index + 1}</span>
                              <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                              <div>
                                <div className="font-medium text-sm text-krtext">{coin.name}</div>
                                <div className="text-xs text-krmuted uppercase">{coin.symbol}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-krtext">
                                ${coin.current_price.toLocaleString()}
                              </div>
                              <div className="text-xs text-green-400 font-medium">
                                +{coin.price_change_percentage_24h.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Losers */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🚨</span>
                    <h3 className="text-lg font-semibold text-krtext">Top Losers</h3>
                  </div>
                  <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-4">
                    {cryptoLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-krgold"></div>
                      </div>
                    ) : (
                      <div className="space-y-3 crypto-list-scroll max-h-[300px] overflow-y-auto">
                        {topLosers.slice(0, 5).map((coin, index) => (
                          <div key={coin.id} className="flex items-center justify-between p-3 bg-krblack/40 rounded-lg hover:bg-krblack/60 transition-all">
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-krgold font-bold w-6">#{index + 1}</span>
                              <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                              <div>
                                <div className="font-medium text-sm text-krtext">{coin.name}</div>
                                <div className="text-xs text-krmuted uppercase">{coin.symbol}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-krtext">
                                ${coin.current_price.toLocaleString()}
                              </div>
                              <div className="text-xs text-red-400 font-medium">
                                {coin.price_change_percentage_24h.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
          </div>

        </div>

          {/* Data Sources Footer */}
          <div className="mt-8 pt-6 border-t border-krborder">
            <div className="text-xs text-krmuted text-center">
              <span className="font-semibold">Data Sources:</span> Economic calendar and crypto market data powered by{' '}
              <span className="text-krgold font-medium">TradingView</span> • Multi-market news stacks every{' '}
              <span className="text-green-400">1 minute</span> from premium sources • Total articles: <span className="text-krgold">{newsItems.length}</span>
            </div>
          </div>
      </div>
      
        {/* Article Detail Modal */}
        {selectedArticle && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedArticle(null)}>
            <div className="bg-krcard/95 backdrop-blur-md rounded-xl border border-krborder max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold mb-2 text-krtext">{selectedArticle.title}</h2>
              <div className="flex flex-col gap-2 text-xs text-krmuted mb-4">
                <div className="flex items-center">
                  <span className="font-semibold">{selectedArticle.source}</span>
                  <span className="mx-2">•</span>
                  <Clock className="w-3 h-3 mr-1" />
                  <span>Published: {new Date(selectedArticle.publishedAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center text-green-400">
                  <Zap className="w-3 h-3 mr-1" />
                  <span>Fetched: {selectedArticle.fetchedAt}</span>
                </div>
              </div>
              {selectedArticle.summary && (
                <div className="bg-krblack/50 p-4 rounded-lg border border-krborder mb-4">
                  <h3 className="font-bold text-lg mb-2 flex items-center text-krtext">
                    <Calendar className="w-5 h-5 mr-2 text-krgold" /> Article Summary
                  </h3>
                  <p className="text-sm text-krtext">{selectedArticle.summary}</p>
                </div>
              )}
              
              <div className="mt-6 flex justify-between items-center">
                <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer" className="text-krgold hover:text-kryellow flex items-center text-sm font-medium transition-colors">
                  Read Full Article <ExternalLink className="w-4 h-4 ml-1" />
                </a>
                <button 
                  onClick={() => setSelectedArticle(null)} 
                  className="bg-krgold text-krblack px-4 py-2 rounded-lg hover:bg-kryellow transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}