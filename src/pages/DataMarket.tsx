import FiatConverter from '../components/FiatConverter'
import CryptoConverter from '../components/CryptoConverter'
import React, { useEffect, useRef, useState } from 'react'
import FiatConverter from '../components/FiatConverter'
import CryptoConverter from '../components/CryptoConverter'

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
    loading: boolean
  }>({
    trending: [],
    gainers: [],
    losers: [],
    loading: true
  })
  const [selectedModal, setSelectedModal] = useState<{
    type: string
    title: string
    data: any[]
  } | null>(null)
  const [modalTimeframe, setModalTimeframe] = useState<'1h' | '24h' | '7d'>('24h')

  // Fetch crypto data from CoinGecko (faster updates)
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

        setCryptoData({
          trending: trending.coins || [],
          gainers,
          losers,
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

  // Initialize TradingView screener with improved error handling
  useEffect(() => {
    if (!screenerRef.current) return

    const container = screenerRef.current
    container.innerHTML = ''

    // Add loading indicator
    const loadingDiv = document.createElement('div')
    loadingDiv.className = 'flex items-center justify-center h-96 text-krtext'
    loadingDiv.innerHTML = '<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-krgold"></div><span class="ml-3">Loading Crypto Screener...</span>'
    container.appendChild(loadingDiv)

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js'
    script.async = true
    
    // Enhanced configuration
    script.innerHTML = JSON.stringify({
      "width": "100%",
      "height": "800",
      "defaultColumn": "overview",
      "screener_type": "crypto_mkt",
      "displayCurrency": "USD",
      "colorTheme": "dark",
      "locale": "en",
      "isTransparent": true,
      "showToolbar": true,
      "filter": [
        {
          "left": "market_cap_basic",
          "operation": "greater",
          "right": 1000000
        }
      ],
      "columns": [
        "name", "close", "change", "change_abs", "volume", "market_cap_basic"
      ]
    })

    // Error handling
    script.onerror = () => {
      console.error('Failed to load TradingView screener')
      container.innerHTML = '<div class="flex items-center justify-center h-96 text-red-400 bg-krcard rounded-lg border border-krborder"><div class="text-center"><div class="text-2xl mb-2">⚠️</div><div>Unable to load crypto screener</div><div class="text-sm text-krmuted mt-2">Please refresh the page or try again later</div></div></div>'
    }

    script.onload = () => {
      // Remove loading indicator after a delay to let widget load
      setTimeout(() => {
        const loading = container.querySelector('.animate-spin')?.parentElement
        if (loading) loading.remove()
      }, 3000)
    }

    container.appendChild(script)

    return () => {
      if (container) container.innerHTML = ''
    }
  }, [])

  // Helper functions
  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`
    } else if (price < 1) {
      return `$${price.toFixed(4)}`
    } else {
      return `$${price.toFixed(2)}`
    }
  }

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) {
      return `$${(cap / 1e12).toFixed(2)}T`
    } else if (cap >= 1e9) {
      return `$${(cap / 1e9).toFixed(2)}B`
    } else if (cap >= 1e6) {
      return `$${(cap / 1e6).toFixed(2)}M`
    } else if (cap >= 1e3) {
      return `$${(cap / 1e3).toFixed(2)}K`
    } else {
      return `$${cap.toFixed(2)}`
    }
  }

  // Get filtered data based on timeframe for modal
  const getFilteredModalData = (data: CryptoItem[], type: string, timeframe: string) => {
    if (type !== 'gainers' && type !== 'losers') {
      return data
    }

    // Get the appropriate price change field for the timeframe
    const getChangeField = (tf: string) => {
      switch (tf) {
        case '1h': return 'price_change_percentage_1h_in_currency'
        case '24h': return 'price_change_percentage_24h' 
        case '7d': return 'price_change_percentage_7d_in_currency'
        default: return 'price_change_percentage_24h'
      }
    }

    const changeField = getChangeField(timeframe)
    
    // Create new data with the appropriate timeframe values
    const processedData = data.map(coin => ({
      ...coin,
      price_change_percentage_24h: (coin as any)[changeField] || coin.price_change_percentage_24h || 0
    }))

    if (type === 'gainers') {
      return processedData
        .filter(coin => coin.price_change_percentage_24h > 0)
        .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
    } else {
      return processedData
        .filter(coin => coin.price_change_percentage_24h < 0)
        .sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))
    }
  }

  const openModal = (type: string, title: string, data: any[]) => {
    setSelectedModal({ type, title, data })
    setModalTimeframe('24h') // Reset to 24h when opening modal
  }

  // Crypto Widget Component
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
    <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-5">
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
              Powered by CoinGecko & TradingView - Professional crypto market analysis tools with 1-minute updates
            </p>
          </div>

          {/* Currency Converters */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <FiatConverter />
            <CryptoConverter />
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

          </div>

          {/* Currency Converters */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <FiatConverter />
            <CryptoConverter />
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
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-krtext">{selectedModal.title}</h2>
                
                {/* Timeframe Selector for Gainers and Losers */}
                {(selectedModal.type === 'gainers' || selectedModal.type === 'losers') && (
                  <div className="flex bg-krblack/40 rounded-lg p-1">
                    {(['1h', '24h', '7d'] as const).map((timeframe) => (
                      <button
                        key={timeframe}
                        onClick={() => setModalTimeframe(timeframe)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                          modalTimeframe === timeframe
                            ? selectedModal.type === 'gainers' 
                              ? 'bg-green-500 text-krblack'
                              : 'bg-red-500 text-krblack'
                            : 'text-krmuted hover:text-krtext'
                        }`}
                      >
                        {timeframe}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setSelectedModal(null)}
                className="text-krmuted hover:text-krtext transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto crypto-list-scroll max-h-[60vh]">
              <div className="space-y-3">
                {(() => {
                  // Get filtered data based on timeframe for gainers and losers
                  const displayData = (selectedModal.type === 'gainers' || selectedModal.type === 'losers') 
                    ? getFilteredModalData(selectedModal.data, selectedModal.type, modalTimeframe)
                    : selectedModal.data
                  
                  return displayData.map((item: any, index: number) => {
                  const coin = selectedModal.type === 'trending' ? item.item : item
                  
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
                            {(selectedModal.type === 'gainers' || selectedModal.type === 'losers') && (
                              <span className="text-krmuted ml-1">({modalTimeframe})</span>
                            )}
                          </div>
                        )}
                        {coin.total_volume && (
                          <div className="text-sm text-kryellow">
                            Vol: {formatMarketCap(coin.total_volume)}
                          </div>
                        )}
                        {coin.market_cap && (
                          <div className="text-sm text-krmuted">
                            MCap: {formatMarketCap(coin.market_cap)}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                  })
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
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
      `}</style>
    </div>
  )
}