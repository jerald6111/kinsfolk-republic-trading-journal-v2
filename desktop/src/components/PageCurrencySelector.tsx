import React, { useState } from 'react';
import { useCurrency, Currency } from '../context/CurrencyContext';
import { ChevronDown, Coins } from 'lucide-react';

interface PageCurrencySelectorProps {
  localCurrency: Currency | null;
  onCurrencyChange: (currency: Currency) => void;
  label?: string;
}

export default function PageCurrencySelector({ 
  localCurrency, 
  onCurrencyChange,
  label = "View in"
}: PageCurrencySelectorProps) {
  const { primaryCurrency, secondaryCurrency, currencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const displayCurrency = localCurrency || primaryCurrency;
  const availableCurrencies = [primaryCurrency];
  if (secondaryCurrency) {
    availableCurrencies.push(secondaryCurrency);
  }

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2 text-sm text-krmuted mb-1">
        <Coins size={14} />
        <span>{label}</span>
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-krborder hover:border-krgold bg-krcard transition-colors min-w-[140px] justify-between"
      >
        <span className="font-medium text-krtext">
          {displayCurrency.symbol} {displayCurrency.code}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-64 bg-krcard rounded-xl shadow-lg border border-krborder z-50 backdrop-blur-sm">
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-semibold text-krtext/60 border-b border-krborder">
                Available Currencies
              </div>
              
              {/* Primary Currency */}
              <button
                className={`w-full px-4 py-2 text-left hover:bg-krbg transition-colors flex items-center justify-between ${
                  displayCurrency.code === primaryCurrency.code ? 'bg-krgold/10 text-krgold' : ''
                }`}
                onClick={() => {
                  onCurrencyChange(primaryCurrency);
                  setIsOpen(false);
                }}
              >
                <span>
                  <span className="font-medium">{primaryCurrency.symbol}</span> {primaryCurrency.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-krtext/60">{primaryCurrency.code}</span>
                  <span className="text-xs bg-krgold/20 text-krgold px-2 py-0.5 rounded">Primary</span>
                </div>
              </button>

              {/* Secondary Currency */}
              {secondaryCurrency && (
                <button
                  className={`w-full px-4 py-2 text-left hover:bg-krbg transition-colors flex items-center justify-between ${
                    displayCurrency.code === secondaryCurrency.code ? 'bg-krgold/10 text-krgold' : ''
                  }`}
                  onClick={() => {
                    onCurrencyChange(secondaryCurrency);
                    setIsOpen(false);
                  }}
                >
                  <span>
                    <span className="font-medium">{secondaryCurrency.symbol}</span> {secondaryCurrency.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-krtext/60">{secondaryCurrency.code}</span>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Secondary</span>
                  </div>
                </button>
              )}

              {/* Info message if no secondary */}
              {!secondaryCurrency && (
                <div className="px-4 py-3 text-xs text-krmuted border-t border-krborder">
                  💡 Set a secondary currency in Settings to view data in multiple currencies
                </div>
              )}

              {/* All currencies option (advanced) */}
              <div className="border-t border-krborder mt-1">
                <div className="px-4 py-2 text-xs font-semibold text-krtext/60">
                  Other Currencies
                </div>
                {currencies
                  .filter(c => 
                    c.code !== primaryCurrency.code && 
                    c.code !== secondaryCurrency?.code
                  )
                  .map(c => (
                    <button
                      key={c.code}
                      className={`w-full px-4 py-2 text-left hover:bg-krbg transition-colors flex items-center justify-between ${
                        displayCurrency.code === c.code ? 'bg-krgold/10 text-krgold' : ''
                      }`}
                      onClick={() => {
                        onCurrencyChange(c);
                        setIsOpen(false);
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
          </div>
        </>
      )}
    </div>
  );
}
