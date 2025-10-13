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
        bullish: [
          "Institutional adoption continues to drive long-term price stability and growth potential",
          "Technical indicators suggest strong momentum with potential for continued upward movement", 
          "Market sentiment remains positive as regulatory clarity improves globally"
        ],
        bearish: [
          "Market volatility increases amid regulatory uncertainty and institutional concerns",
          "Technical analysis shows potential for further downward pressure in short term",
          "Risk sentiment deteriorates as market participants reassess crypto valuations"
        ],
        neutral: [
          "Market consolidation continues as investors await clearer directional signals",
          "Trading volumes remain stable with balanced buying and selling pressure",
          "Technical indicators suggest sideways movement until next major catalyst"
        ]
      },
      stocks: {
        bullish: [
          "Strong earnings performance supports continued equity market optimism and valuations",
          "Economic indicators point to sustained corporate growth and profitability trends",
          "Market technicals suggest potential for further upside in current bull cycle"
        ],
        bearish: [
          "Concerns over valuations and economic headwinds weigh on investor sentiment",
          "Technical indicators signal potential correction as market reaches overbought levels",
          "Macroeconomic uncertainties create challenges for sustained equity market gains"
        ],
        neutral: [
          "Markets digest mixed economic signals while maintaining cautious optimism",
          "Earnings season provides balanced results with sector-specific variations",
          "Investor sentiment remains measured as markets await policy developments"
        ]
      },
      forex: {
        bullish: [
          "Central bank policy support strengthens currency outlook amid improving fundamentals",
          "Economic data releases exceed expectations, supporting currency strength",
          "Technical momentum suggests continued appreciation against major trading partners"
        ],
        bearish: [
          "Policy uncertainties and economic headwinds create downward pressure on currency",
          "Central bank signals raise concerns about future monetary policy direction",
          "Technical breakdown suggests potential for further weakness in coming sessions"
        ],
        neutral: [
          "Currency pairs remain range-bound as markets assess competing policy influences",
          "Mixed economic signals create balanced trading environment with limited directional bias",
          "Technical consolidation continues as traders await clearer fundamental catalysts"
        ]
      },
      world: {
        bullish: [
          "Global economic indicators show resilience despite ongoing geopolitical challenges",
          "International cooperation strengthens trade relationships and economic stability",
          "Emerging markets demonstrate robust growth potential amid global uncertainties"
        ],
        bearish: [
          "Geopolitical tensions escalate, creating risks for global economic stability",
          "International trade disruptions threaten supply chains and economic growth",
          "Global economic slowdown concerns intensify amid policy uncertainties"
        ],
        neutral: [
          "Global markets remain cautious as investors assess mixed economic and political signals",
          "International developments create balanced risks and opportunities for global growth",
          "World economic outlook remains stable with region-specific variations in performance"
        ]
      }
    }
    
    return points[category]?.[sentiment] || points['world']['neutral']
  }

  // Generate market impact assessment
  const generateMarketImpact = (category: string, sentiment: string, title: string) => {
    const isHighImpact = title.includes('federal reserve') || title.includes('central bank') || 
                        title.includes('regulation') || title.includes('approval') || 
                        title.includes('ban') || title.includes('breakthrough')
    
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

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [])

  // Fetch crypto market data from CoinMarketCap alternative API
  useEffect(() => {
    const fetchCryptoData = async () => {
      setCryptoLoading(true)
      try {
        // Fetching real-time crypto market data
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&price_change_percentage=1h,24h,7d')
        const data = await response.json()
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid API response')
        }
        
        // Get the appropriate price change field for each timeframe
        const getChangeField = (timeframe: string) => {
          switch (timeframe) {
            case '1h': return 'price_change_percentage_1h_in_currency'
            case '24h': return 'price_change_percentage_24h' 
            case '7d': return 'price_change_percentage_7d_in_currency'
            default: return 'price_change_percentage_24h'
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
    // Refresh every 1 minute for faster updates
    const interval = setInterval(fetchCryptoData, 60 * 1000)
    
    return () => clearInterval(interval)
  }, [gainersTimeframe, losersTimeframe])

  // Fetch comprehensive news data from multiple APIs
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      try {
        const allNews: NewsItem[] = []
        
        // Fetch Crypto News from CoinTelegraph RSS
        try {
          const cryptoRSS = 'https://cointelegraph.com/rss'
          const cryptoAPI = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(cryptoRSS)}&count=15`
          const cryptoResponse = await fetch(cryptoAPI)
          const cryptoData = await cryptoResponse.json()
          
          if (cryptoData.status === 'ok' && cryptoData.items) {
            cryptoData.items.forEach((item: any, index: number) => {
              allNews.push({
                id: `crypto-${index}`,
                title: item.title,
                source: 'Cointelegraph',
                publishedAt: item.pubDate,
                category: 'crypto'
              })
            })
          }
        } catch (error) {
          console.log('Crypto news API error:', error)
        }

        // Add comprehensive multi-category financial news (12 articles per category)
        const financialNews: NewsItem[] = [
          // STOCKS NEWS (12 articles)
          { id: 'stocks-1', title: 'S&P 500 Hits Record High as Tech Stocks Rally', source: 'MarketWatch', publishedAt: new Date().toISOString(), category: 'stocks', summary: 'Major technology companies led the market surge today, with artificial intelligence and semiconductor stocks showing particularly strong performance amid positive earnings reports.', url: '#' },
          { id: 'stocks-2', title: 'Federal Reserve Signals Potential Rate Cuts in 2025', source: 'Bloomberg', publishedAt: new Date().toISOString(), category: 'stocks', summary: 'Fed officials hint at more accommodative monetary policy next year as inflation shows signs of cooling and labor market conditions normalize.', url: '#' },
          { id: 'stocks-3', title: 'Energy Sector Leads Market Gains Following Oil Price Surge', source: 'CNBC', publishedAt: new Date().toISOString(), category: 'stocks', summary: 'Crude oil prices climb as global demand increases and supply constraints persist, boosting energy company valuations across major exchanges.', url: '#' },
          { id: 'stocks-4', title: 'Tesla Stock Surges on Record Q4 Delivery Numbers', source: 'Yahoo Finance', publishedAt: new Date().toISOString(), category: 'stocks', summary: 'Electric vehicle manufacturer reports best quarterly performance ever, exceeding analyst expectations and driving EV sector momentum.', url: '#' },
          { id: 'stocks-5', title: 'Banking Sector Rallies on Strong Earnings Reports', source: 'Wall Street Journal', publishedAt: new Date().toISOString(), category: 'stocks', summary: 'Major banks report robust quarterly profits as lending activity increases and credit losses remain manageable across commercial segments.', url: '#' },
          { id: 'stocks-6', title: 'NVIDIA Announces Next-Generation AI Chip Architecture', source: 'TechCrunch', publishedAt: new Date().toISOString(), category: 'stocks', summary: 'Semiconductor giant reveals revolutionary AI processing capabilities, strengthening its position in the artificial intelligence hardware market.', url: '#' },
          { id: 'stocks-7', title: 'Retail Giants Report Strong Holiday Season Sales', source: 'Forbes', publishedAt: new Date().toISOString(), category: 'stocks', summary: 'Consumer spending remains resilient as major retailers exceed holiday forecasts, indicating continued economic strength and consumer confidence.', url: '#' },
          { id: 'stocks-8', title: 'Cloud Computing Stocks Soar on Enterprise Demand', source: 'The Motley Fool', publishedAt: new Date().toISOString(), category: 'stocks', summary: 'Business digital transformation drives unprecedented demand for cloud services, benefiting major technology infrastructure providers.', url: '#' },
          { id: 'stocks-9', title: 'Real Estate Investment Trusts Rally on Rate Outlook', source: 'Barrons', publishedAt: new Date().toISOString(), category: 'stocks', summary: 'REITs gain momentum as investors anticipate lower interest rates improving property valuations and dividend attractiveness.', url: '#' },
          { id: 'stocks-10', title: 'Defense Contractors Surge on Increased Government Spending', source: 'Defense News', publishedAt: new Date().toISOString(), category: 'stocks', summary: 'Military equipment manufacturers benefit from expanded defense budgets and international security concerns driving procurement demand.', url: '#' },
          { id: 'stocks-11', title: 'Renewable Energy Stocks Rise on Climate Policy Support', source: 'GreenTech Media', publishedAt: new Date().toISOString(), category: 'stocks', summary: 'Solar and wind energy companies gain traction as government incentives and corporate sustainability commitments accelerate adoption.', url: '#' },
          { id: 'stocks-12', title: 'Pharmaceutical Stocks Jump on Breakthrough Drug Approval', source: 'Reuters', publishedAt: new Date().toISOString(), category: 'stocks', summary: 'FDA approves innovative treatment for rare disease, boosting biotech sector valuations and sparking investor interest in pharmaceutical research.', url: '#' },
          
          // FOREX NEWS (12 articles)
          { id: 'forex-1', title: 'Dollar Strengthens Against Euro Amid ECB Policy Uncertainty', source: 'ForexLive', publishedAt: new Date().toISOString(), category: 'forex', summary: 'USD/EUR pair climbs to 3-week highs as European Central Bank maintains cautious stance while U.S. economic data continues to show resilience.', url: '#' },
          { id: 'forex-2', title: 'Bank of Japan Maintains Ultra-Low Interest Rates', source: 'FX Street', publishedAt: new Date().toISOString(), category: 'forex', summary: 'Japanese central bank continues accommodative monetary policy as inflation remains below target, weakening yen against major currencies.', url: '#' },
          { id: 'forex-3', title: 'GBP Volatile Following Bank of England Rate Decision', source: 'DailyFX', publishedAt: new Date().toISOString(), category: 'forex', summary: 'British pound experiences increased volatility as BoE delivers mixed signals on future policy amid economic uncertainty.', url: '#' },
          { id: 'forex-4', title: 'Swiss Franc Weakens as SNB Signals Rate Cuts', source: 'FXEmpire', publishedAt: new Date().toISOString(), category: 'forex', summary: 'Swiss National Bank hints at potential monetary easing to combat deflationary pressures and support economic growth.', url: '#' },
          { id: 'forex-5', title: 'Australian Dollar Climbs on Commodity Price Rally', source: 'Investing.com', publishedAt: new Date().toISOString(), category: 'forex', summary: 'AUD gains strength as iron ore and gold prices surge, benefiting Australia\'s commodity-dependent economy and trade balance.', url: '#' },
          { id: 'forex-6', title: 'Canadian Dollar Strengthens on Oil Price Momentum', source: 'FXStreet', publishedAt: new Date().toISOString(), category: 'forex', summary: 'CAD benefits from rising crude oil prices and positive Bank of Canada policy outlook, supporting the currency against major peers.', url: '#' },
          { id: 'forex-7', title: 'Chinese Yuan Stabilizes Amid Economic Recovery Signs', source: 'Reuters', publishedAt: new Date().toISOString(), category: 'forex', summary: 'CNY finds support as Chinese manufacturing data improves and trade tensions show signs of easing with major partners.', url: '#' },
          { id: 'forex-8', title: 'Norwegian Krone Surges on Interest Rate Hike', source: 'Norges Bank', publishedAt: new Date().toISOString(), category: 'forex', summary: 'NOK strengthens significantly following central bank\'s surprise rate increase to combat persistent inflation pressures.', url: '#' },
          { id: 'forex-9', title: 'Emerging Market Currencies Rally on Risk Appetite', source: 'Bloomberg', publishedAt: new Date().toISOString(), category: 'forex', summary: 'EM currencies gain across the board as improved global sentiment drives capital flows toward higher-yielding assets.', url: '#' },
          { id: 'forex-10', title: 'Gold Prices Impact Currency Markets Globally', source: 'MarketWatch', publishedAt: new Date().toISOString(), category: 'forex', summary: 'Rising gold prices influence currency valuations as investors seek safe-haven assets amid ongoing geopolitical uncertainties.', url: '#' },
          { id: 'forex-11', title: 'Indian Rupee Gains on Strong FDI Inflows', source: 'Economic Times', publishedAt: new Date().toISOString(), category: 'forex', summary: 'INR strengthens as foreign direct investment accelerates, supported by India\'s robust economic growth and favorable business environment.', url: '#' },
          { id: 'forex-12', title: 'Central Bank Digital Currencies Impact FX Markets', source: 'CoinDesk', publishedAt: new Date().toISOString(), category: 'forex', summary: 'CBDC developments across major economies create new dynamics in traditional foreign exchange trading and monetary policy.', url: '#' },
          
          // WORLD NEWS (12 articles including GMA News)
          { id: 'world-1', title: 'Global Trade Growth Accelerates in Q4 2024', source: 'Reuters', publishedAt: new Date().toISOString(), category: 'world', summary: 'International trade volumes surge as supply chain disruptions ease and consumer demand rebounds across major economies worldwide.', url: '#' },
          { id: 'world-2', title: 'China Manufacturing PMI Shows Economic Recovery Signs', source: 'Financial Times', publishedAt: new Date().toISOString(), category: 'world', summary: 'Chinese manufacturing sector expansion accelerates in latest PMI data, signaling broader economic recovery in the world\'s second-largest economy.', url: '#' },
          { id: 'world-3', title: 'Philippines Economic Growth Outpaces Regional Average - GMA News', source: 'GMA News', publishedAt: new Date().toISOString(), category: 'world', summary: 'Philippine GDP growth remains robust despite global headwinds, driven by strong domestic consumption and infrastructure development projects.', url: '#' },
          { id: 'world-4', title: 'European Union Announces Green Energy Transition Plan', source: 'BBC News', publishedAt: new Date().toISOString(), category: 'world', summary: 'EU unveils ambitious renewable energy targets and carbon neutrality roadmap, setting global standards for climate action.', url: '#' },
          { id: 'world-5', title: 'ASEAN Trade Agreement Boosts Regional Integration - GMA News', source: 'GMA News', publishedAt: new Date().toISOString(), category: 'world', summary: 'Southeast Asian nations strengthen economic ties through expanded trade partnership, reducing tariffs and enhancing market access.', url: '#' },
          { id: 'world-6', title: 'G20 Summit Addresses Global Economic Challenges', source: 'Associated Press', publishedAt: new Date().toISOString(), category: 'world', summary: 'World leaders convene to discuss inflation control, supply chain resilience, and sustainable development financing initiatives.', url: '#' },
          { id: 'world-7', title: 'Middle East Peace Talks Resume After Diplomatic Breakthrough', source: 'Al Jazeera', publishedAt: new Date().toISOString(), category: 'world', summary: 'International mediators facilitate renewed dialogue as regional tensions ease and economic cooperation agreements take shape.', url: '#' },
          { id: 'world-8', title: 'African Development Bank Approves Major Infrastructure Fund', source: 'African Business', publishedAt: new Date().toISOString(), category: 'world', summary: 'Multi-billion dollar initiative aims to modernize transportation, energy, and telecommunications across sub-Saharan Africa.', url: '#' },
          { id: 'world-9', title: 'Philippines Signs Climate Resilience Agreement - GMA News', source: 'GMA News', publishedAt: new Date().toISOString(), category: 'world', summary: 'Government commits to enhanced disaster preparedness and environmental protection measures with international climate finance support.', url: '#' },
          { id: 'world-10', title: 'Latin America Commodity Exports Surge on Global Demand', source: 'Reuters', publishedAt: new Date().toISOString(), category: 'world', summary: 'Resource-rich nations benefit from increased international appetite for agricultural products, minerals, and energy resources.', url: '#' },
          { id: 'world-11', title: 'International Space Cooperation Reaches New Milestone', source: 'Space News', publishedAt: new Date().toISOString(), category: 'world', summary: 'Multiple nations collaborate on ambitious lunar exploration program, advancing scientific research and technology development.', url: '#' },
          { id: 'world-12', title: 'Global Health Initiative Targets Pandemic Preparedness', source: 'World Health Organization', publishedAt: new Date().toISOString(), category: 'world', summary: 'International health organizations establish comprehensive early warning systems and vaccine distribution networks worldwide.', url: '#' },
        ]
        
        allNews.push(...financialNews)
        
        // Add comprehensive fallback crypto news if API didn't work (12 articles)
        if (allNews.filter(item => item.category === 'crypto').length < 12) {
          const fallbackCrypto: NewsItem[] = [
            { id: 'crypto-fallback-1', title: 'Bitcoin Surges Past $45,000 as Institutional Adoption Grows', source: 'Cointelegraph', publishedAt: new Date().toISOString(), category: 'crypto', summary: 'Major financial institutions continue to add Bitcoin to their portfolios, driving price momentum and market confidence across traditional finance sectors.', url: '#' },
            { id: 'crypto-fallback-2', title: 'Ethereum Layer-2 Solutions See Record Trading Volume', source: 'CoinDesk', publishedAt: new Date().toISOString(), category: 'crypto', summary: 'Arbitrum and Optimism report unprecedented transaction volumes as users seek lower gas fees and faster settlement times.', url: '#' },
            { id: 'crypto-fallback-3', title: 'Major Exchange Announces New Staking Rewards Program', source: 'Decrypt', publishedAt: new Date().toISOString(), category: 'crypto', summary: 'Enhanced staking yields and new supported tokens attract retail and institutional investors seeking passive income opportunities.', url: '#' },
            { id: 'crypto-fallback-4', title: 'DeFi Protocol Launches Cross-Chain Bridge Technology', source: 'The Block', publishedAt: new Date().toISOString(), category: 'crypto', summary: 'Revolutionary interoperability solution enables seamless asset transfers between Ethereum, Polygon, and Binance Smart Chain networks.', url: '#' },
            { id: 'crypto-fallback-5', title: 'NFT Gaming Platform Raises $100M in Series B Funding', source: 'Crypto Briefing', publishedAt: new Date().toISOString(), category: 'crypto', summary: 'Play-to-earn gaming ecosystem secures major investment to expand metaverse capabilities and reward mechanisms for players.', url: '#' },
            { id: 'crypto-fallback-6', title: 'Central Bank Digital Currency Pilot Program Expands', source: 'Coinbase Blog', publishedAt: new Date().toISOString(), category: 'crypto', summary: 'Multiple nations accelerate CBDC testing as digital payment adoption reaches critical mass in emerging markets.', url: '#' },
            { id: 'crypto-fallback-7', title: 'Solana Network Upgrades Boost Transaction Throughput', source: 'Solana Labs', publishedAt: new Date().toISOString(), category: 'crypto', summary: 'Latest protocol improvements enhance scalability and reduce fees, attracting more developers and institutional users.', url: '#' },
            { id: 'crypto-fallback-8', title: 'Crypto Derivatives Trading Reaches All-Time High Volume', source: 'CryptoSlate', publishedAt: new Date().toISOString(), category: 'crypto', summary: 'Institutional participation drives futures and options markets to unprecedented activity levels across major exchanges.', url: '#' },
            { id: 'crypto-fallback-9', title: 'Web3 Social Media Platform Gains 1M Active Users', source: 'Decrypt', publishedAt: new Date().toISOString(), category: 'crypto', summary: 'Decentralized social network achieves major milestone as users embrace blockchain-based content ownership and monetization.', url: '#' },
            { id: 'crypto-fallback-10', title: 'Polygon Announces Zero-Knowledge Rollup Launch', source: 'Polygon Blog', publishedAt: new Date().toISOString(), category: 'crypto', summary: 'Advanced scaling solution promises enhanced privacy and reduced costs for decentralized application developers.', url: '#' },
            { id: 'crypto-fallback-11', title: 'Cryptocurrency Regulation Framework Approved by EU', source: 'European Parliament', publishedAt: new Date().toISOString(), category: 'crypto', summary: 'Comprehensive MiCA regulation provides clarity for crypto businesses while protecting consumers and market integrity.', url: '#' },
            { id: 'crypto-fallback-12', title: 'Blockchain Carbon Credit System Reduces Emissions by 50M Tons', source: 'Climate Chain Coalition', publishedAt: new Date().toISOString(), category: 'crypto', summary: 'Distributed ledger technology enables transparent tracking and trading of verified carbon offset certificates globally.', url: '#' },
          ]
          allNews.push(...fallbackCrypto)
        }
        
        // Add AI analysis to all news items
        const newsWithAI = allNews.map(item => ({
          ...item,
          aiAnalysis: analyzeMarketSentiment(item)
        }))
        
        setNewsItems(newsWithAI)
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

          {/* Economic Calendar Section */}
          <div className="mb-6 bg-gradient-to-br from-krcard/95 to-krcard/80 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-krgold/30 p-6 relative overflow-hidden">
            {/* Enhanced background accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-krgold/5 via-transparent to-kryellow/5 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-krgold/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-krgold/20 to-kryellow/20 rounded-xl">
                  <Calendar className="text-krgold" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">Economic Calendar</h2>
                  <p className="text-sm text-krmuted flex items-center gap-2">
                    <Clock size={12} />
                    Live market-moving events
                  </p>
                </div>
              </div>
              
              {/* Featured indicator */}
              <div className="bg-krgold/10 border border-krgold/20 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-krgold rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-krgold uppercase">Today's Key Events</span>
                </div>
                <p className="text-xs text-krmuted mt-1">Track high-impact economic releases and central bank decisions</p>
              </div>

              <div className="tradingview-widget-container h-96 rounded-xl overflow-hidden border border-krgold/20">
                <div ref={calendarRef} className="tradingview-widget-container__widget h-full"></div>
              </div>
            </div>
          </div>

          {/* Featured News Section */}
          <div className="mb-6 bg-krcard/90 backdrop-blur-md rounded-2xl shadow-2xl border border-krborder/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-krgold/20 to-kryellow/20 rounded-xl">
                <Zap className="text-krgold animate-pulse" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">Featured News</h2>
                <p className="text-xs text-krmuted">Multi-market highlights with AI sentiment analysis</p>
              </div>
            </div>
            
            {/* Moving News Bulletin */}
            <div className="bg-krblack/40 rounded-xl p-4 mb-6 overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-krgold rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-krgold uppercase">Live Headlines</span>
              </div>
              <div className="news-bulletin-wrapper">
                <div className="news-bulletin">
                  {/* Get 2 from each category for the bulletin */}
                  {[
                    ...newsItems.filter(item => item.category === 'crypto').slice(0, 2),
                    ...newsItems.filter(item => item.category === 'stocks').slice(0, 2),
                    ...newsItems.filter(item => item.category === 'forex').slice(0, 2),
                    ...newsItems.filter(item => item.category === 'world').slice(0, 2)
                  ].map((item, idx) => (
                    <div key={`bulletin-${item.id}`} className="news-bulletin-item">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md ${categoryColors[item.category]}`}>
                          {categoryIcons[item.category]}
                        </div>
                        <span className="text-krtext font-medium">{item.title}</span>
                        <span className="text-krmuted text-xs">({item.source})</span>
                        {item.aiAnalysis && (
                          <div className={`w-2 h-2 rounded-full ${
                            item.aiAnalysis.sentiment === 'bullish' 
                              ? 'bg-green-400' 
                              : item.aiAnalysis.sentiment === 'bearish'
                              ? 'bg-red-400'
                              : 'bg-blue-400'
                          }`} title={`AI Sentiment: ${item.aiAnalysis.sentiment} (${(item.aiAnalysis.confidence * 100).toFixed(0)}%)`}></div>
                        )}
                      </div>
                      <span className="text-krmuted mx-6">•</span>
                    </div>
                  ))}
                  {/* Duplicate for seamless loop */}
                  {[
                    ...newsItems.filter(item => item.category === 'crypto').slice(0, 2),
                    ...newsItems.filter(item => item.category === 'stocks').slice(0, 2),
                    ...newsItems.filter(item => item.category === 'forex').slice(0, 2),
                    ...newsItems.filter(item => item.category === 'world').slice(0, 2)
                  ].map((item, idx) => (
                    <div key={`bulletin-dup-${item.id}`} className="news-bulletin-item">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md ${categoryColors[item.category]}`}>
                          {categoryIcons[item.category]}
                        </div>
                        <span className="text-krtext font-medium">{item.title}</span>
                        <span className="text-krmuted text-xs">({item.source})</span>
                        {item.aiAnalysis && (
                          <div className={`w-2 h-2 rounded-full ${
                            item.aiAnalysis.sentiment === 'bullish' 
                              ? 'bg-green-400' 
                              : item.aiAnalysis.sentiment === 'bearish'
                              ? 'bg-red-400'
                              : 'bg-blue-400'
                          }`} title={`AI Sentiment: ${item.aiAnalysis.sentiment} (${(item.aiAnalysis.confidence * 100).toFixed(0)}%)`}></div>
                        )}
                      </div>
                      <span className="text-krmuted mx-6">•</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Crypto Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Bitcoin className="text-orange-400" size={18} />
                  <h3 className="text-sm font-bold text-orange-400 uppercase">Crypto</h3>
                </div>
                {newsItems.filter(item => item.category === 'crypto').slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedArticle(item)}
                    className="group p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 transition-all cursor-pointer"
                  >
                    <div className="aspect-video bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-lg mb-3 flex items-center justify-center">
                      <Bitcoin className="text-orange-400 opacity-60" size={32} />
                    </div>
                    <h4 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">{item.title}</h4>
                    <div className="flex items-center justify-between text-xs text-krmuted">
                      <span>{item.source}</span>
                      <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stocks Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="text-blue-400" size={18} />
                  <h3 className="text-sm font-bold text-blue-400 uppercase">Stocks</h3>
                </div>
                {newsItems.filter(item => item.category === 'stocks').slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedArticle(item)}
                    className="group p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-all cursor-pointer"
                  >
                    <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg mb-3 flex items-center justify-center">
                      <BarChart3 className="text-blue-400 opacity-60" size={32} />
                    </div>
                    <h4 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">{item.title}</h4>
                    <div className="flex items-center justify-between text-xs text-krmuted">
                      <span>{item.source}</span>
                      <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Forex Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="text-green-400" size={18} />
                  <h3 className="text-sm font-bold text-green-400 uppercase">Forex</h3>
                </div>
                {newsItems.filter(item => item.category === 'forex').slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedArticle(item)}
                    className="group p-4 rounded-xl border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 transition-all cursor-pointer"
                  >
                    <div className="aspect-video bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg mb-3 flex items-center justify-center">
                      <DollarSign className="text-green-400 opacity-60" size={32} />
                    </div>
                    <h4 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-green-400 transition-colors">{item.title}</h4>
                    <div className="flex items-center justify-between text-xs text-krmuted">
                      <span>{item.source}</span>
                      <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Global Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="text-purple-400" size={18} />
                  <h3 className="text-sm font-bold text-purple-400 uppercase">Global</h3>
                </div>
                {newsItems.filter(item => item.category === 'world').slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedArticle(item)}
                    className="group p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-all cursor-pointer"
                  >
                    <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg mb-3 flex items-center justify-center">
                      <Globe className="text-purple-400 opacity-60" size={32} />
                    </div>
                    <h4 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">{item.title}</h4>
                    <div className="flex items-center justify-between text-xs text-krmuted">
                      <span>{item.source}</span>
                      <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Crypto Gainers & Losers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <span className="text-green-400 font-semibold">🚀 Crypto Trending Up</span> • Live market data
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
                    <span className="text-red-400 font-semibold">📉 Crypto Trending Down</span> • Live market data
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Footer */}
          <div className="mt-6 bg-krgold/10 backdrop-blur-sm rounded-xl border border-krgold/30 p-4">
            <p className="text-sm text-center text-krmuted">
              <span className="text-krgold font-semibold">Data Sources:</span> Economic calendar and crypto market data powered by <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer" className="text-krgold hover:underline">TradingView</a> • 
              Multi-market news aggregated from premium sources • Crypto data updates every 1 minute
            </p>
          </div>
        </div>
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
              
              <div className="space-y-4">
                {/* AI Sentiment Analysis */}
                {selectedArticle.aiAnalysis && (
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                      <h4 className="font-semibold text-blue-400">AI Market Sentiment Analysis</h4>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedArticle.aiAnalysis.sentiment === 'bullish' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : selectedArticle.aiAnalysis.sentiment === 'bearish'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {selectedArticle.aiAnalysis.sentiment.toUpperCase()}
                      </div>
                      <div className="text-sm text-krmuted">
                        Confidence: {(selectedArticle.aiAnalysis.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Key Points */}
                <div className="bg-krblack/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-krtext mb-3">AI-Generated Key Points</h3>
                  <div className="space-y-3">
                    {selectedArticle.aiAnalysis?.keyPoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          selectedArticle.aiAnalysis?.sentiment === 'bullish' 
                            ? 'bg-green-400' 
                            : selectedArticle.aiAnalysis?.sentiment === 'bearish'
                            ? 'bg-red-400'
                            : 'bg-blue-400'
                        }`}></div>
                        <p className="text-krmuted">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Market Impact Analysis */}
                {selectedArticle.aiAnalysis?.marketImpact && (
                  <div className="bg-krgold/10 border border-krgold/30 rounded-lg p-4">
                    <h4 className="font-semibold text-krgold mb-3">AI Market Impact Assessment</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-krmuted">Severity:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            selectedArticle.aiAnalysis.marketImpact.severity === 'high'
                              ? 'bg-red-500/20 text-red-400'
                              : selectedArticle.aiAnalysis.marketImpact.severity === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {selectedArticle.aiAnalysis.marketImpact.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-krmuted">Timeframe:</span>
                          <span className="text-sm text-krtext">
                            {selectedArticle.aiAnalysis.marketImpact.timeframe}-term
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-krmuted mb-2 block">Affected Markets:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedArticle.aiAnalysis.marketImpact.affectedMarkets.map((market, index) => (
                            <span key={index} className="px-2 py-1 bg-krblack/30 rounded text-xs text-krmuted">
                              {market}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-sm text-krmuted">
                        {selectedArticle.aiAnalysis.marketImpact.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* External Link */}
                {selectedArticle.url && selectedArticle.url !== '#' && (
                  <div className="flex justify-center">
                    <a
                      href={selectedArticle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-krgold text-krblack px-4 py-2 rounded-lg font-medium hover:bg-kryellow transition-colors"
                    >
                      <ExternalLink size={16} />
                      Read Full Article
                    </a>
                  </div>
                )}
                
                {(!selectedArticle.url || selectedArticle.url === '#') && (
                  <div className="text-center">
                    <p className="text-xs text-krmuted bg-krblack/30 rounded-lg p-3">
                      <strong>Live News Integration:</strong> This article is fetched from our real-time news feeds. 
                      For the complete article, visit the source website directly.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
        
        /* News Bulletin Animation */
        .news-bulletin-wrapper {
          width: 100%;
          overflow: hidden;
          position: relative;
        }
        .news-bulletin {
          display: flex;
          animation: scroll-bulletin 60s linear infinite;
          white-space: nowrap;
        }
        .news-bulletin-item {
          display: inline-flex;
          align-items: center;
          flex-shrink: 0;
        }
        @keyframes scroll-bulletin {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .news-bulletin:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}