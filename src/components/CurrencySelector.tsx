import React, { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { ChevronDown, RefreshCw, Eye, EyeOff } from 'lucide-react';

export default function CurrencySelector() {
  const {
    primaryCurrency,
    secondaryCurrency,
    currencies,
    setPrimaryCurrency,
    setSecondaryCurrency,
    refreshExchangeRates,
    isUpdating,
    lastUpdated,
    showBothCurrencies,
    setShowBothCurrencies
  } = useCurrency();
  
  const [isPrimaryOpen, setIsPrimaryOpen] = useState(false);
  const [isSecondaryOpen, setIsSecondaryOpen] = useState(false);

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    const minutes = Math.floor((Date.now() - lastUpdated) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return 'Over 24h ago';
  };

  return (
    <div className="flex items-center gap-3">
      {/* Primary Currency Selector */}
      <div className="relative">
        <div className="text-xs text-krtext/60 mb-1 font-medium">Primary</div>
        <button
          onClick={() => setIsPrimaryOpen(!isPrimaryOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-krborder hover:border-krgold bg-krcard/50 transition-colors"
        >
          <span className="font-medium">{primaryCurrency.code}</span>
          <ChevronDown size={16} className={`transition-transform ${isPrimaryOpen ? 'rotate-180' : ''}`} />
        </button>

        {isPrimaryOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsPrimaryOpen(false)} />
            <div className="absolute right-0 mt-2 w-64 bg-krcard rounded-xl shadow-lg border border-krborder z-50 backdrop-blur-sm max-h-80 overflow-y-auto">
              <div className="py-1">
                <div className="px-4 py-2 text-xs font-semibold text-krtext/60 border-b border-krborder">
                  Select Primary Currency
                </div>
                {currencies.map(c => (
                  <button
                    key={c.code}
                    className={`w-full px-4 py-2 text-left hover:bg-krbg transition-colors flex items-center justify-between ${
                      c.code === primaryCurrency.code ? 'bg-krgold/10 text-krgold' : ''
                    }`}
                    onClick={() => {
                      setPrimaryCurrency(c);
                      setIsPrimaryOpen(false);
                    }}
                  >
                    <span>
                      <span className="font-medium">{c.symbol}</span> {c.name}
                    </span>
                    <span className="text-xs text-krtext/60">{c.code}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Secondary Currency Selector */}
      <div className="relative">
        <div className="text-xs text-krtext/60 mb-1 font-medium">Secondary</div>
        <button
          onClick={() => setIsSecondaryOpen(!isSecondaryOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-krborder hover:border-krgold bg-krcard/50 transition-colors"
        >
          <span className="font-medium">{secondaryCurrency?.code || 'None'}</span>
          <ChevronDown size={16} className={`transition-transform ${isSecondaryOpen ? 'rotate-180' : ''}`} />
        </button>

        {isSecondaryOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsSecondaryOpen(false)} />
            <div className="absolute right-0 mt-2 w-64 bg-krcard rounded-xl shadow-lg border border-krborder z-50 backdrop-blur-sm max-h-80 overflow-y-auto">
              <div className="py-1">
                <div className="px-4 py-2 text-xs font-semibold text-krtext/60 border-b border-krborder">
                  Select Secondary Currency
                </div>
                <button
                  className={`w-full px-4 py-2 text-left hover:bg-krbg transition-colors ${
                    !secondaryCurrency ? 'bg-krgold/10 text-krgold' : ''
                  }`}
                  onClick={() => {
                    setSecondaryCurrency(null);
                    setIsSecondaryOpen(false);
                  }}
                >
                  <span className="font-medium">None</span>
                  <span className="text-xs text-krtext/60 ml-2">(Single currency)</span>
                </button>
                {currencies
                  .filter(c => c.code !== primaryCurrency.code)
                  .map(c => (
                    <button
                      key={c.code}
                      className={`w-full px-4 py-2 text-left hover:bg-krbg transition-colors flex items-center justify-between ${
                        c.code === secondaryCurrency?.code ? 'bg-krgold/10 text-krgold' : ''
                      }`}
                      onClick={() => {
                        setSecondaryCurrency(c);
                        setIsSecondaryOpen(false);
                      }}
                    >
                      <span>
                        <span className="font-medium">{c.symbol}</span> {c.name}
                      </span>
                      <span className="text-xs text-krtext/60">{c.code}</span>
                    </button>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Show Both Toggle (only visible when secondary is set) */}
      {secondaryCurrency && (
        <button
          onClick={() => setShowBothCurrencies(!showBothCurrencies)}
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-krborder hover:border-krgold bg-krcard/50 transition-colors"
          title={showBothCurrencies ? 'Hide secondary currency' : 'Show both currencies'}
        >
          {showBothCurrencies ? (
            <Eye size={18} className="text-krgold" />
          ) : (
            <EyeOff size={18} className="text-krtext/40" />
          )}
        </button>
      )}

      {/* Refresh Button with Last Updated */}
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={refreshExchangeRates}
          disabled={isUpdating}
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-krborder hover:border-krgold bg-krcard/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh exchange rates"
        >
          <RefreshCw size={18} className={`${isUpdating ? 'animate-spin' : ''}`} />
        </button>
        <span className="text-[10px] text-krtext/40 whitespace-nowrap">
          {formatLastUpdated()}
        </span>
      </div>
    </div>
  );
}
