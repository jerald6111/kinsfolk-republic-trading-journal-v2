import React, { useState, useEffect } from 'react'
import { useCurrency } from '../context/CurrencyContext'
import { ArrowRightLeft, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'

export default function CryptoConverter() {
  const { currencies } = useCurrency()
  // Include crypto and major fiat currencies
  const cryptoCurrencies = currencies.filter(c => ['BTC', 'USDT', 'BUSD'].includes(c.code))
  const allCurrencies = [...cryptoCurrencies, ...currencies.filter(c => ['USD', 'EUR', 'GBP'].includes(c.code))]

  const [fromCurrency, setFromCurrency] = useState('BTC')
  const [toCurrency, setToCurrency] = useState('USD')
  const [amount, setAmount] = useState('1')
  const [convertedAmount, setConvertedAmount] = useState('0')
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [priceChange, setPriceChange] = useState(0)

  // Helper to get rate by code
  const getRate = (code: string) => {
    return currencies.find(c => c.code === code)?.rate || 1
  }

  // Auto-refresh every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
      calculateConversion()
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [fromCurrency, toCurrency, amount, currencies])

  const calculateConversion = () => {
    const amountNum = parseFloat(amount) || 0
    if (fromCurrency === toCurrency) {
      setConvertedAmount(amountNum.toFixed(8))
      return
    }
    // Convert through USD as base
    const fromRate = getRate(fromCurrency)
    const toRate = getRate(toCurrency)
    const inUSD = amountNum / fromRate
    const converted = inUSD * toRate
    // Use more decimals for crypto
    const decimals = ['BTC', 'USDT', 'BUSD'].includes(toCurrency) ? 8 : 2
    setConvertedAmount(converted.toFixed(decimals))
    // Simulate price change (in real app, would track actual changes)
    const randomChange = (Math.random() - 0.5) * 2 // -1% to +1%
    setPriceChange(randomChange)
  }

  useEffect(() => {
    calculateConversion()
  }, [amount, fromCurrency, toCurrency, currencies])

  const swapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
  }

  const handleRefresh = () => {
    setLastUpdated(new Date())
    calculateConversion()
  }

  const isCrypto = (code: string) => ['BTC', 'USDT', 'BUSD'].includes(code)

  return (
    <div className="bg-krcard/90 backdrop-blur-md rounded-2xl shadow-2xl border border-krborder/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-krtext flex items-center gap-2">
            <span className="text-2xl">₿</span>
            Crypto Currency Converter
          </h3>
          <p className="text-xs text-krmuted mt-1">Live cryptocurrency rates</p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-krgold/20 rounded-lg transition-colors text-krgold"
          title="Refresh rates"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* From Currency */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-krmuted mb-2">From</label>
          <div className="grid grid-cols-[1fr,auto] gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step={isCrypto(fromCurrency) ? "0.00000001" : "0.01"}
              className="px-4 py-3 bg-krblack/30 border border-krborder/30 rounded-xl text-krtext focus:ring-2 focus:ring-krgold/20 focus:border-krgold transition-all"
              placeholder="Enter amount"
            />
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="px-4 py-3 bg-krblack/30 border border-krborder/30 rounded-xl text-krtext focus:ring-2 focus:ring-krgold/20 focus:border-krgold transition-all min-w-[120px]"
            >
              {allCurrencies.map(c => (
                <option key={c.code} value={c.code} className="bg-krcard text-krtext">
                  {c.code} - {c.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swapCurrencies}
            className="p-2 hover:bg-krgold/20 rounded-full transition-all text-krgold hover:rotate-180 duration-300"
            title="Swap currencies"
          >
            <ArrowRightLeft size={20} />
          </button>
        </div>

        {/* To Currency */}
        <div>
          <label className="block text-sm text-krmuted mb-2">To</label>
          <div className="grid grid-cols-[1fr,auto] gap-2">
            <input
              type="text"
              value={convertedAmount}
              readOnly
              className="px-4 py-3 bg-krblack/50 border border-krborder/30 rounded-xl text-krtext font-bold text-lg cursor-not-allowed"
            />
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="px-4 py-3 bg-krblack/30 border border-krborder/30 rounded-xl text-krtext focus:ring-2 focus:ring-krgold/20 focus:border-krgold transition-all min-w-[120px]"
            >
              {allCurrencies.map(c => (
                <option key={c.code} value={c.code} className="bg-krcard text-krtext">
                  {c.code} - {c.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Exchange Rate Info & 24h Change */}
        <div className="bg-krblack/30 rounded-lg p-3 border border-krborder/30">
          <div className="text-xs text-krmuted space-y-2">
            <div className="flex justify-between">
              <span>Exchange Rate:</span>
              <span className="text-krtext font-semibold">
                1 {fromCurrency} = {(() => {
                  const fromRate = getRate(fromCurrency);
                  const toRate = getRate(toCurrency);
                  const decimals = isCrypto(toCurrency) ? 8 : 2;
                  return (toRate / fromRate).toFixed(decimals);
                })()} {toCurrency}
              </span>
            </div>
            <div className="flex justify-between">
              <span>24h Change:</span>
              <span className={`flex items-center gap-1 font-semibold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span className="text-krgold">{lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Quick Convert Buttons */}
        {isCrypto(fromCurrency) && (
          <div className="flex gap-2">
            <button
              onClick={() => setAmount('0.001')}
              className="flex-1 px-3 py-2 bg-krblack/30 hover:bg-krgold/20 border border-krborder/30 hover:border-krgold rounded-lg text-krtext text-xs transition-all"
            >
              0.001 {fromCurrency}
            </button>
            <button
              onClick={() => setAmount('0.01')}
              className="flex-1 px-3 py-2 bg-krblack/30 hover:bg-krgold/20 border border-krborder/30 hover:border-krgold rounded-lg text-krtext text-xs transition-all"
            >
              0.01 {fromCurrency}
            </button>
            <button
              onClick={() => setAmount('0.1')}
              className="flex-1 px-3 py-2 bg-krblack/30 hover:bg-krgold/20 border border-krborder/30 hover:border-krgold rounded-lg text-krtext text-xs transition-all"
            >
              0.1 {fromCurrency}
            </button>
            <button
              onClick={() => setAmount('1')}
              className="flex-1 px-3 py-2 bg-krblack/30 hover:bg-krgold/20 border border-krborder/30 hover:border-krgold rounded-lg text-krtext text-xs transition-all"
            >
              1 {fromCurrency}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
