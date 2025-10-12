import React, { useEffect, useRef, useState } from 'react'

interface CryptoItem {
  id: string
  symbol: string
  name: string
  image?: string
  current_price?: number
  price_change_percentage_24h?: number
  market_cap?: number
  total_volume?: number
  market_cap_rank?: number
  activated_at?: number
}

interface TrendingItem {
  item: CryptoItem & {
    thumb?: string
    small?: string
    large?: string
    score?: number
  }
}

export default function DataMarket() {
  const screenerRef = useRef<HTMLDivElement>(null)
  const [cryptoData, setCryptoData] = useState<{
    trending: TrendingItem[]
    gainers: CryptoItem[]
    losers: CryptoItem[]
    highVolume: CryptoItem[]
    upcomingCoins: any[]
    upcomingCoins2: any[]
    loading: boolean
  }>({
    trending: [],
    gainers: [],
    losers: [],
    highVolume: [],
    upcomingCoins: [],
    upcomingCoins2: [],
    loading: true
  })
  const [selectedModal, setSelectedModal] = useState<{
    type: string
    title: string
    data: any[]
  } | null>(null)

  // Fetch crypto data from CoinGecko
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const [trendingRes, marketsRes] = await Promise.all([
          fetch('https://api.coingecko.com/api/v3/search/trending'),
          fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&price_change_percentage=1h,24h,7d')
        ])

        const [trending, markets] = await Promise.all([
          trendingRes.json(),
          marketsRes.json()
        ])

        // Sort gainers and losers
        const gainers = [...markets]
          .filter(coin => coin.price_change_percentage_24h > 0)
          .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))

        const losers = [...markets]
          .filter(coin => coin.price_change_percentage_24h < 0)
          .sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))

        // Sort by volume
        const highVolume = [...markets]
          .sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0))



        // Fetch upcoming coins (simulated - would need dedicated API)
        const upcomingCoins = [
          { name: "LayerZero", symbol: "ZRO", launch_date: "2024-10-20", category: "Interoperability", status: "Mainnet Launch" },
          { name: "EigenLayer", symbol: "EIGEN", launch_date: "2024-10-25", category: "Restaking", status: "Token Generation" },
          { name: "Berachain", symbol: "BERA", launch_date: "2024-11-01", category: "DeFi", status: "Mainnet Beta" },
          { name: "Monad", symbol: "MON", launch_date: "2024-11-10", category: "Layer 1", status: "Testnet Phase 3" },
          { name: "Fuel Network", symbol: "FUEL", launch_date: "2024-11-15", category: "Modular Execution", status: "Public Launch" },
          { name: "Hyperliquid", symbol: "HYPE", launch_date: "2024-11-20", category: "DEX", status: "Token Launch" },
          { name: "Babylon", symbol: "BBN", launch_date: "2024-12-01", category: "Bitcoin Staking", status: "Mainnet" },
          { name: "Story Protocol", symbol: "STORY", launch_date: "2024-12-05", category: "IP Licensing", status: "Alpha Launch" },
          { name: "Movement Labs", symbol: "MOVE", launch_date: "2024-12-15", category: "Move VM", status: "Mainnet Launch" },
          { name: "Initia", symbol: "INIT", launch_date: "2024-12-20", category: "Appchain Infrastructure", status: "Genesis" },
          { name: "Scroll", symbol: "SCR", launch_date: "2024-10-22", category: "Layer 2", status: "Public Token Launch" },
          { name: "Taiko", symbol: "TAIKO", launch_date: "2024-10-28", category: "ZK-Rollup", status: "Mainnet Alpha" },
          { name: "Linea", symbol: "LINEA", launch_date: "2024-11-05", category: "ZK-EVM", status: "Token Generation Event" },
          { name: "Base Ecosystem", symbol: "BASE", launch_date: "2024-11-12", category: "Layer 2", status: "Ecosystem Token" },
          { name: "Blast", symbol: "BLAST", launch_date: "2024-11-18", category: "Yield Layer 2", status: "Public Launch" },
          { name: "Mode Network", symbol: "MODE", launch_date: "2024-11-25", category: "Modular DeFi", status: "Beta Launch" },
          { name: "Mantle LSP", symbol: "METH", launch_date: "2024-12-02", category: "Liquid Staking", status: "Protocol Launch" },
          { name: "Privy", symbol: "PRIVY", launch_date: "2024-12-08", category: "Auth Infrastructure", status: "Token Launch" },
          { name: "Parallel", symbol: "PRIME", launch_date: "2024-12-12", category: "AI Gaming", status: "Expansion Launch" },
          { name: "Wormhole", symbol: "W", launch_date: "2024-12-18", category: "Cross-Chain", status: "Ecosystem Expansion" }
        ]

        setCryptoData({
          trending: trending.coins || [],
          gainers,
          losers,
          highVolume,
          upcomingCoins: upcomingCoins.slice(0, 10), // First 10 for first widget
          upcomingCoins2: upcomingCoins.slice(10, 20), // Next 10 for second widget
          loading: false
        })
      } catch (error) {
        console.error('Error fetching crypto data:', error)
        setCryptoData(prev => ({ ...prev, loading: false }))
      }
    }

    fetchCryptoData()
    const interval = setInterval(fetchCryptoData, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Initialize TradingView screener
  useEffect(() => {
    if (!screenerRef.current) return

    const container = screenerRef.current
    container.innerHTML = ''

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      "width": "100%",
      "height": 800,
      "defaultColumn": "overview",
      "screener_type": "crypto_mkt",
      "displayCurrency": "USD",
      "colorTheme": "dark",
      "locale": "en",
      "isTransparent": true,
      "showToolbar": true,
      "filter": [
        {
          "left": "exchange",
          "operation": "in_range", 
          "right": ["BINANCE", "BYBIT", "OKX"]
        }
      ],
      "range": "12M"
    })

    container.appendChild(script)

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [])

  // Utility functions
  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toLocaleString()}`
  }

  const formatMarketCap = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
    return `$${value.toLocaleString()}`
  }

  const openModal = (type: string, title: string, data: any[]) => {
    setSelectedModal({ type, title, data })
  }

  // Widget component
  const CryptoWidget = ({ 
    title, 
    emoji, 
    data, 
    type,
    renderItem 
  }: {
    title: string
    emoji: string
    data: any[]
    type: string
    renderItem: (item: any, index: number) => React.ReactNode
  }) => (
    <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/50 transition-all duration-300 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <h3 className="text-lg font-semibold text-krtext">{title}</h3>
        </div>
        {data.length > 10 && (
          <button
            onClick={() => openModal(type, title, data)}
            className="text-xs text-krgold hover:text-kryellow transition-colors px-2 py-1 rounded border border-krgold/30 hover:border-krgold/60"
          >
            View More
          </button>
        )}
      </div>
      <div className="space-y-2 crypto-list-scroll max-h-[300px] overflow-y-auto">
        {cryptoData.loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-krgold"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center text-krmuted py-8 text-sm">No data available</div>
        ) : (
          data.slice(0, 10).map(renderItem)
        )}
      </div>
    </div>
  )

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
              <span className="text-4xl">📊</span>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">
                Data Market
              </h1>
            </div>
            <p className="text-krmuted text-sm md:text-base ml-14">
              Powered by CoinGecko & TradingView - Professional crypto market analysis tools
            </p>
          </div>

          {/* Crypto Data Widgets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Trending Coins */}
            <CryptoWidget
              title="Trending Coins"
              emoji="🔥"
              data={cryptoData.trending}
              type="trending"
              renderItem={(trending: TrendingItem, index: number) => (
                <div key={trending.item.id} className="flex items-center justify-between p-3 bg-krblack/40 rounded-lg hover:bg-krblack/60 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-krgold font-bold w-6">#{index + 1}</span>
                    <img 
                      src={trending.item.thumb || trending.item.image} 
                      alt={trending.item.name}
                      className="w-6 h-6 rounded-full"
                      onError={(e) => { e.currentTarget.src = '/placeholder-coin.svg' }}
                    />
                    <div>
                      <div className="font-medium text-sm">{trending.item.name}</div>
                      <div className="text-xs text-krmuted uppercase">{trending.item.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-krgold">Trending #{trending.item.score !== undefined ? trending.item.score + 1 : index + 1}</div>
                  </div>
                </div>
              )}
            />

            {/* Top Gainers */}
            <CryptoWidget
              title="Top Gainers"
              emoji="🚀"
              data={cryptoData.gainers}
              type="gainers"
              renderItem={(coin: CryptoItem, index: number) => (
                <div key={coin.id} className="flex items-center justify-between p-3 bg-krblack/40 rounded-lg hover:bg-krblack/60 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-krgold font-bold w-6">#{index + 1}</span>
                    <img 
                      src={coin.image} 
                      alt={coin.name}
                      className="w-6 h-6 rounded-full"
                      onError={(e) => { e.currentTarget.src = '/placeholder-coin.svg' }}
                    />
                    <div>
                      <div className="font-medium text-sm">{coin.name}</div>
                      <div className="text-xs text-krmuted uppercase">{coin.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{coin.current_price ? formatPrice(coin.current_price) : 'N/A'}</div>
                    <div className="text-xs text-green-400">
                      +{coin.price_change_percentage_24h?.toFixed(2) || 0}%
                    </div>
                  </div>
                </div>
              )}
            />

            {/* Top Losers */}
            <CryptoWidget
              title="Top Losers"
              emoji="🚨"
              data={cryptoData.losers}
              type="losers"
              renderItem={(coin: CryptoItem, index: number) => (
                <div key={coin.id} className="flex items-center justify-between p-3 bg-krblack/40 rounded-lg hover:bg-krblack/60 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-krgold font-bold w-6">#{index + 1}</span>
                    <img 
                      src={coin.image} 
                      alt={coin.name}
                      className="w-6 h-6 rounded-full"
                      onError={(e) => { e.currentTarget.src = '/placeholder-coin.svg' }}
                    />
                    <div>
                      <div className="font-medium text-sm">{coin.name}</div>
                      <div className="text-xs text-krmuted uppercase">{coin.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{coin.current_price ? formatPrice(coin.current_price) : 'N/A'}</div>
                    <div className="text-xs text-red-400">
                      {coin.price_change_percentage_24h?.toFixed(2) || 0}%
                    </div>
                  </div>
                </div>
              )}
            />

            {/* Upcoming Coins (2) */}
            <CryptoWidget
              title="Upcoming Coins"
              emoji="�"
              data={cryptoData.upcomingCoins2}
              type="upcoming2"
              renderItem={(coin: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-krblack/40 rounded-lg hover:bg-krblack/60 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-krgold font-bold w-6">#{index + 1}</span>
                    <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-400">�</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{coin.name}</div>
                      <div className="text-xs text-krmuted uppercase">{coin.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-purple-400">{coin.status}</div>
                    <div className="text-xs text-krmuted">{coin.launch_date}</div>
                  </div>
                </div>
              )}
            />

            {/* Upcoming Coins */}
            <CryptoWidget
              title="Upcoming Coins"
              emoji="📅"
              data={cryptoData.upcomingCoins}
              type="upcoming"
              renderItem={(coin: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-krblack/40 rounded-lg hover:bg-krblack/60 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-krgold font-bold w-6">#{index + 1}</span>
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-400">📅</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{coin.name}</div>
                      <div className="text-xs text-krmuted uppercase">{coin.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-blue-400">{coin.status}</div>
                    <div className="text-xs text-krmuted">{coin.launch_date}</div>
                  </div>
                </div>
              )}
            />

            {/* Highest Volume */}
            <CryptoWidget
              title="Highest Volume"
              emoji="🥤"
              data={cryptoData.highVolume}
              type="volume"
              renderItem={(coin: CryptoItem, index: number) => (
                <div key={coin.id} className="flex items-center justify-between p-3 bg-krblack/40 rounded-lg hover:bg-krblack/60 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-krgold font-bold w-6">#{index + 1}</span>
                    <img 
                      src={coin.image} 
                      alt={coin.name}
                      className="w-6 h-6 rounded-full"
                      onError={(e) => { e.currentTarget.src = '/placeholder-coin.svg' }}
                    />
                    <div>
                      <div className="font-medium text-sm">{coin.name}</div>
                      <div className="text-xs text-krmuted uppercase">{coin.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{coin.current_price ? formatPrice(coin.current_price) : 'N/A'}</div>
                    <div className="text-xs text-kryellow">
                      Vol: {coin.total_volume ? formatMarketCap(coin.total_volume) : 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            />


          </div>

          {/* Crypto Screener */}
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🔍</span>
              <div>
                <h2 className="text-lg font-semibold text-krtext">Crypto Screener</h2>
                <p className="text-xs text-krmuted">Binance • Bybit • OKX</p>
              </div>
            </div>
            <div className="tradingview-widget-container">
              <div ref={screenerRef} className="tradingview-widget-container__widget"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-krcard border border-krborder rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-krborder">
              <h2 className="text-xl font-semibold text-krtext">{selectedModal.title}</h2>
              <button
                onClick={() => setSelectedModal(null)}
                className="text-krmuted hover:text-krtext transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto crypto-list-scroll max-h-[60vh]">
              <div className="space-y-3">
                {selectedModal.data.map((item: any, index: number) => {
                  const coin = selectedModal.type === 'trending' ? item.item : item
                  
                  // Handle Upcoming Coins display
                  if (selectedModal.type === 'upcoming' || selectedModal.type === 'upcoming2') {
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-krblack/40 rounded-lg hover:bg-krblack/60 transition-all">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-krgold font-bold w-8">#{index + 1}</span>
                          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-400">📅</span>
                          </div>
                          <div>
                            <div className="font-medium">{coin.name}</div>
                            <div className="text-sm text-krmuted uppercase">{coin.symbol}</div>
                            <div className="text-xs text-krmuted">{coin.category}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-blue-400">{coin.status}</div>
                          <div className="text-sm text-krmuted">{coin.launch_date}</div>
                        </div>
                      </div>
                    )
                  }
                  
                  // Handle regular crypto coins (trending, gainers, losers, volume)
                  return (
                    <div key={coin.id || index} className="flex items-center justify-between p-4 bg-krblack/40 rounded-lg hover:bg-krblack/60 transition-all">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-krgold font-bold w-8">#{index + 1}</span>
                        <img 
                          src={coin.thumb || coin.image} 
                          alt={coin.name}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => { e.currentTarget.src = '/placeholder-coin.svg' }}
                        />
                        <div>
                          <div className="font-medium">{coin.name}</div>
                          <div className="text-sm text-krmuted uppercase">{coin.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        {coin.current_price && (
                          <div className="font-medium">{formatPrice(coin.current_price)}</div>
                        )}
                        {coin.price_change_percentage_24h !== undefined && (
                          <div className={`text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                          </div>
                        )}
                        {coin.total_volume && (
                          <div className="text-sm text-kryellow">
                            Vol: {formatMarketCap(coin.total_volume)}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
