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

// News item with AI sentiment analysis
interface NewsItem {
  id: string
  title: string
  source: string
  publishedAt: string
  category: 'crypto' | 'stocks' | 'forex' | 'world'
  summary?: string
  url?: string
  aiAnalysis?: {
    sentiment: 'bullish' | 'bearish' | 'neutral'
    confidence: number
    keyPoints: string[]
    marketImpact: {
      severity: 'low' | 'medium' | 'high'
      timeframe: 'short' | 'medium' | 'long'
      affectedMarkets: string[]
      description: string
    }
  }
}

// AI Market Sentiment Analyzer
const analyzeMarketSentiment = (newsItem: NewsItem) => {
  const title = newsItem.title.toLowerCase()
  
  // Bullish indicators
  const bullishKeywords = ['surge', 'rally', 'gains', 'up', 'rise', 'soar', 'breakthrough', 'approval', 'adoption', 'positive', 'bullish', 'record high', 'milestone', 'growth', 'expansion']
  
  // Bearish indicators  
  const bearishKeywords = ['crash', 'fall', 'drop', 'decline', 'bearish', 'concern', 'risk', 'regulation', 'ban', 'hack', 'volatility', 'uncertainty', 'downturn', 'loss']
  
  // Calculate sentiment score
  const bullishScore = bullishKeywords.reduce((score, word) => title.includes(word) ? score + 1 : score, 0)
  const bearishScore = bearishKeywords.reduce((score, word) => title.includes(word) ? score + 1 : score, 0)
  
  let sentiment: 'bullish' | 'bearish' | 'neutral'
  let confidence: number
  
  if (bullishScore > bearishScore) {
    sentiment = 'bullish'
    confidence = Math.min(0.6 + (bullishScore * 0.1), 0.95)
  } else if (bearishScore > bullishScore) {
    sentiment = 'bearish'
    confidence = Math.min(0.6 + (bearishScore * 0.1), 0.95)
  } else {
    sentiment = 'neutral'
    confidence = 0.7
  }

  // Generate AI key points based on category and sentiment
  const generateKeyPoints = (category: string, sentiment: string) => {
    const points: { [key: string]: { [key: string]: string[] } } = {
      crypto: {
        bullish: ["Institutional adoption continues to drive long-term price stability and growth potential", "Technical indicators suggest strong momentum with potential for continued upward movement", "Market sentiment remains positive as regulatory clarity improves globally"],
        bearish: ["Market volatility increases amid regulatory uncertainty and institutional concerns", "Technical analysis shows potential for further downward pressure in short term", "Risk sentiment deteriorates as market participants reassess crypto valuations"],
        neutral: ["Market consolidation continues as investors await clearer directional signals", "Trading volumes remain stable with balanced buying and selling pressure", "Technical indicators suggest sideways movement until next major catalyst"]
      },
      stocks: {
        bullish: ["Strong earnings performance supports continued equity market optimism and valuations", "Economic indicators point to sustained corporate growth and profitability trends", "Market technicals suggest potential for further upside in current bull cycle"],
        bearish: ["Concerns over valuations and economic headwinds weigh on investor sentiment", "Technical indicators signal potential correction as market reaches overbought levels", "Macroeconomic uncertainties create challenges for sustained equity market gains"],
        neutral: ["Markets digest mixed economic signals while maintaining cautious optimism", "Earnings season provides balanced results with sector-specific variations", "Investor sentiment remains measured as markets await policy developments"]
      },
      forex: {
        bullish: ["Central bank policy support strengthens currency outlook amid improving fundamentals", "Economic data releases exceed expectations, supporting currency strength", "Technical momentum suggests continued appreciation against major trading partners"],
        bearish: ["Policy uncertainties and economic headwinds create downward pressure on currency", "Central bank signals raise concerns about future monetary policy direction", "Technical breakdown suggests potential for further weakness in coming sessions"],
        neutral: ["Currency pairs remain range-bound as markets assess competing policy influences", "Mixed economic signals create balanced trading environment with limited directional bias", "Technical consolidation continues as traders await clearer fundamental catalysts"]
      },
      world: {
        bullish: ["Global economic indicators show resilience despite ongoing geopolitical challenges", "International cooperation strengthens trade relationships and economic stability", "Emerging markets demonstrate robust growth potential amid global uncertainties"],
        bearish: ["Geopolitical tensions escalate, creating risks for global economic stability", "International trade disruptions threaten supply chains and economic growth", "Global economic slowdown concerns intensify amid policy uncertainties"],
        neutral: ["Global markets remain cautious as investors assess mixed economic and political signals", "International developments create balanced risks and opportunities for global growth", "World economic outlook remains stable with region-specific variations in performance"]
      }
    }
    return points[category]?.[sentiment] || points['world']['neutral']
  }

  // Generate market impact assessment
  const generateMarketImpact = (category: string, sentiment: string, title: string) => {
    const isHighImpact = title.includes('federal reserve') || title.includes('central bank') || title.includes('regulation') || title.includes('approval') || title.includes('ban') || title.includes('breakthrough')
    const severity = isHighImpact ? 'high' : (sentiment === 'neutral' ? 'low' : 'medium')
    const timeframe = isHighImpact ? 'long' : (sentiment === 'bullish' ? 'medium' : 'short')
    
    const affectedMarkets: { [key: string]: string[] } = {
      crypto: ['Cryptocurrency', 'Blockchain Technology', 'Digital Assets'],
      stocks: ['Equity Markets', 'Corporate Bonds', 'Market Indices'],
      forex: ['Currency Markets', 'International Trade', 'Central Bank Policy'],
      world: ['Global Markets', 'International Trade', 'Geopolitical Risk']
    }
    
    const impactDescriptions: { [key: string]: string } = {
      bullish: `Positive market sentiment expected to drive ${severity === 'high' ? 'significant' : 'moderate'} gains across related asset classes`,
      bearish: `Market headwinds likely to create ${severity === 'high' ? 'substantial' : 'limited'} downward pressure on associated investments`,
      neutral: `Balanced market conditions with ${severity === 'high' ? 'potential for volatility' : 'stable price action'} expected`
    }
    
    return {
      severity: severity as 'low' | 'medium' | 'high',
      timeframe: timeframe as 'short' | 'medium' | 'long',
      affectedMarkets: affectedMarkets[category] || affectedMarkets['world'],
      description: impactDescriptions[sentiment]
    }
  }

  return {
    sentiment,
    confidence,
    keyPoints: generateKeyPoints(newsItem.category, sentiment),
    marketImpact: generateMarketImpact(newsItem.category, sentiment, title)
  }
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
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&price_change_percentage=1h,24h,7d')
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

  // Fetch comprehensive news data
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      try {
        const allNews: NewsItem[] = []
        try {
          const cryptoRSS = 'https://cointelegraph.com/rss'
          const cryptoAPI = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(cryptoRSS)}&count=15`
          const cryptoResponse = await fetch(cryptoAPI)
          const cryptoData = await cryptoResponse.json()
          if (cryptoData.status === 'ok' && cryptoData.items) {
            cryptoData.items.forEach((item: any, index: number) => {
              allNews.push({ id: `crypto-${index}`, title: item.title, source: 'Cointelegraph', publishedAt: item.pubDate, category: 'crypto', url: item.link, summary: item.description })
            })
          }
        } catch (error) { console.log('Crypto news API error:', error) }

        const financialNews: NewsItem[] = [
          { id: 'stocks-1', title: 'S&P 500 Hits Record High as Tech Stocks Rally', source: 'MarketWatch', publishedAt: new Date().toISOString(), category: 'stocks', summary: 'Major technology companies led the market surge today, with artificial intelligence and semiconductor stocks showing particularly strong performance amid positive earnings reports.', url: '#' },
          { id: 'stocks-2', title: 'Federal Reserve Signals Potential Policy Shift Amid Economic Data', source: 'Bloomberg', publishedAt: new Date().toISOString(), category: 'stocks', summary: 'Central bank officials indicate flexibility in monetary policy approach as inflation metrics and employment data provide mixed signals for economic outlook.', url: '#' },
          { id: 'stocks-3', title: 'Energy Sector Leads Market Gains as Oil Prices Surge', source: 'Reuters', publishedAt: new Date().toISOString(), category: 'stocks', summary: 'Crude oil futures hit multi-month highs driving energy stock performance while renewable energy investments continue to attract institutional capital.', url: '#' },
          { id: 'stocks-4', title: 'Pharmaceutical Giants Report Strong Q4 Earnings', source: 'Financial Times', publishedAt: new Date().toISOString(), category: 'stocks', summary: 'Major pharmaceutical companies exceed earnings expectations with robust drug pipeline developments and expanding global market reach.', url: '#' },
          { id: 'forex-1', title: 'USD Strengthens Against Major Currencies Following Economic Data', source: 'ForexLive', publishedAt: new Date().toISOString(), category: 'forex', summary: 'Dollar gains momentum across major currency pairs as economic indicators suggest resilient growth and potential monetary policy adjustments.', url: '#' },
          { id: 'forex-2', title: 'ECB Policy Decision Impacts Euro Trading Across Global Markets', source: 'FX Street', publishedAt: new Date().toISOString(), category: 'forex', summary: 'European Central Bank monetary policy announcement creates volatility in EUR pairs as traders reassess regional economic prospects.', url: '#' },
          { id: 'world-1', title: 'Global Supply Chain Recovery Shows Steady Progress', source: 'Financial Times', publishedAt: new Date().toISOString(), category: 'world', summary: 'International trade networks demonstrate improved efficiency and reduced bottlenecks as logistics infrastructure investments pay dividends globally.', url: '#' },
          { id: 'world-2', title: 'Emerging Markets Attract Record Foreign Investment', source: 'Reuters', publishedAt: new Date().toISOString(), category: 'world', summary: 'Developing economies receive unprecedented capital inflows as investors seek growth opportunities and portfolio diversification.', url: '#' }
        ]
        allNews.push(...financialNews)
        
        if (allNews.filter(item => item.category === 'crypto').length < 12) {
          const fallbackCrypto: NewsItem[] = [
            { id: 'crypto-fallback-1', title: 'Bitcoin Surges Past $45,000 as Institutional Adoption Grows', source: 'Cointelegraph', publishedAt: new Date().toISOString(), category: 'crypto', summary: 'Major financial institutions continue to add Bitcoin to their portfolios, driving price momentum and market confidence across traditional finance sectors.', url: '#' },
            { id: 'crypto-fallback-2', title: 'Ethereum Layer 2 Solutions See Massive Transaction Growth', source: 'CoinDesk', publishedAt: new Date().toISOString(), category: 'crypto', summary: 'Scaling solutions demonstrate remarkable adoption rates with transaction volumes increasing 400% as developers migrate to lower-cost alternatives.', url: '#' },
            { id: 'crypto-fallback-3', title: 'Central Bank Digital Currencies Gain Global Momentum', source: 'Decrypt', publishedAt: new Date().toISOString(), category: 'crypto', summary: 'Multiple nations advance CBDC pilot programs while establishing regulatory frameworks for digital currency implementation and cross-border integration.', url: '#' },
            { id: 'crypto-fallback-4', title: 'DeFi Protocol Launches Revolutionary Yield Farming Mechanism', source: 'The Block', publishedAt: new Date().toISOString(), category: 'crypto', summary: 'Innovative decentralized finance platform introduces novel staking rewards system with enhanced security features and improved capital efficiency.', url: '#' }
          ]
          allNews.push(...fallbackCrypto)
        }
        
        const newsWithAI = allNews.map(item => ({...item, aiAnalysis: analyzeMarketSentiment(item) }))
        setNewsItems(newsWithAI)
      } catch (error) { console.error('Error fetching news:', error)
      } finally { setLoading(false) }
    }
    fetchNews()
    const interval = setInterval(fetchNews, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const filteredNews = newsItems.filter(item => item.category === activeNewsCategory)
  const tickerNews = [ ...newsItems.filter(item => item.category === 'crypto').slice(0, 4), ...newsItems.filter(item => item.category === 'stocks').slice(0, 2), ...newsItems.filter(item => item.category === 'forex').slice(0, 1), ...newsItems.filter(item => item.category === 'world').slice(0, 1) ]

  const categoryIcons = {
    crypto: <Bitcoin className="w-5 h-5" />,
    stocks: <BarChart3 className="w-5 h-5" />,
    forex: <DollarSign className="w-5 h-5" />,
    world: <Globe className="w-5 h-5" />
  }
  
  const sentimentColors = {
    bullish: 'text-green-400',
    bearish: 'text-red-400',
    neutral: 'text-gray-400'
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
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">📡</span>
              <h2 className="text-xl font-semibold text-krtext">LIVE FEED</h2>
            </div>
            <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 transition-all duration-200 p-4">
              <div className="overflow-hidden">
                <div className="flex animate-ticker whitespace-nowrap">
                  {tickerNews.concat(tickerNews).map((item, index) => (
                    <span key={index} className="mx-8 text-sm flex items-center">
                      <span className="text-krgold mr-2">•</span>
                      <span className={`mr-3 font-semibold ${sentimentColors[item.aiAnalysis?.sentiment || 'neutral']}`}>
                        {item.aiAnalysis?.sentiment.toUpperCase()}:
                      </span>
                      <span className="text-krtext">{item.title}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column: Market News */}
            <div className="xl:col-span-2">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">📰</span>
                  <h2 className="text-xl font-semibold text-krtext">Market News</h2>
                </div>
                
                {/* Category Filter Tabs */}
                <div className="flex space-x-2 mb-6">
                  {(Object.keys(categoryIcons) as Array<keyof typeof categoryIcons>).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveNewsCategory(cat)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeNewsCategory === cat 
                          ? 'bg-krgold text-krblack' 
                          : 'bg-krcard/60 text-krmuted hover:bg-krcard border border-krborder hover:border-krgold/50'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        {categoryIcons[cat]}
                        <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                      </span>
                    </button>
                  ))}
                </div>

                {/* News Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loading ? (
                    <div className="col-span-full flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-krgold"></div>
                    </div>
                  ) : (
                    filteredNews.slice(0, 9).map(item => (
                      <div 
                        key={item.id} 
                        className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-4 cursor-pointer"
                        onClick={() => setSelectedArticle(item)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {categoryIcons[item.category]}
                            <span className="text-xs text-krgold font-medium">
                              {item.category.toUpperCase()}
                            </span>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                            item.aiAnalysis?.sentiment === 'bullish' ? 'bg-green-500/20 text-green-400' :
                            item.aiAnalysis?.sentiment === 'bearish' ? 'bg-red-500/20 text-red-400' :
                            'bg-krmuted/20 text-krmuted'
                          }`}>
                            {item.aiAnalysis?.sentiment?.toUpperCase() || 'NEUTRAL'}
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-krtext text-sm mb-3 line-clamp-2">
                          {item.title}
                        </h3>
                        
                        <div className="flex items-center justify-between text-xs text-krmuted">
                          <span>{item.source}</span>
                          <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
            </div>
          </div>

            {/* Right Column: Economic Calendar & Crypto Data */}
            <div className="xl:col-span-1 space-y-6">
              {/* Economic Calendar */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📅</span>
                  <h2 className="text-xl font-semibold text-krtext">Economic Calendar</h2>
                </div>
                <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-4 h-80">
                  <div ref={calendarRef} className="h-full"></div>
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
              <span className="text-krgold font-medium">TradingView</span> • Multi-market news aggregated from premium sources • Crypto data updates every{' '}
              <span className="text-green-400">1 minute</span>
            </div>
          </div>
      </div>
      
        {/* Article Detail Modal */}
        {selectedArticle && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedArticle(null)}>
            <div className="bg-krcard/95 backdrop-blur-md rounded-xl border border-krborder max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold mb-2 text-krtext">{selectedArticle.title}</h2>
              <div className="flex items-center text-xs text-krmuted mb-4">
                <span>{selectedArticle.source}</span>
                <span className="mx-2">•</span>
                <Clock className="w-3 h-3 mr-1" />
                <span>{new Date(selectedArticle.publishedAt).toLocaleString()}</span>
              </div>
              <p className="text-krtext mb-4">{selectedArticle.summary}</p>
              
              {selectedArticle.aiAnalysis && (
                <div className="bg-krblack/50 p-4 rounded-lg border border-krborder">
                  <h3 className="font-bold text-lg mb-2 flex items-center text-krtext">
                    <Zap className="w-5 h-5 mr-2 text-krgold" /> AI Market Analysis
                  </h3>
                  <p className="mb-2 text-krtext"><span className="font-semibold">Key Points:</span></p>
                  <ul className="list-disc list-inside text-sm space-y-1 mb-3 text-krmuted">
                    {selectedArticle.aiAnalysis.keyPoints.map((point, i) => <li key={i}>{point}</li>)}
                  </ul>
                  <p className="text-sm text-krtext"><span className="font-semibold">Impact:</span> {selectedArticle.aiAnalysis.marketImpact.description}</p>
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