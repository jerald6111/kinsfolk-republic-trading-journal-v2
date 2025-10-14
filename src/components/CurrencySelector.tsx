import React, { useState } from 'react';import React, { useState } from 'react';

import { useCurrency } from '../context/CurrencyContext';import { useCurrency } from '../context/CurrencyContext';

import { ChevronDown, RefreshCw, X, Eye, EyeOff } from 'lucide-react';import { ChevronDown } from 'lucide-react';



export default function CurrencySelector() {export default function CurrencySelector() {

  const {   const { currency, currencies, setCurrency, addCustomCurrency } = useCurrency();

    primaryCurrency,   const [isOpen, setIsOpen] = useState(false);

    secondaryCurrency,  const [showCustom, setShowCustom] = useState(false);

    currencies,   const [customForm, setCustomForm] = useState({ code: '', symbol: '', name: '', rate: 1 });

    setPrimaryCurrency,

    setSecondaryCurrency,  const addCustom = (e: React.FormEvent) => {

    refreshExchangeRates,    e.preventDefault();

    isUpdating,    addCustomCurrency(customForm);

    lastUpdated,    setCurrency(customForm);

    showBothCurrencies,    setShowCustom(false);

    setShowBothCurrencies    setCustomForm({ code: '', symbol: '', name: '', rate: 1 });

  } = useCurrency();  };

  

  const [isPrimaryOpen, setIsPrimaryOpen] = useState(false);  return (

  const [isSecondaryOpen, setIsSecondaryOpen] = useState(false);    <div className="relative">

      <button

  const formatLastUpdated = () => {        onClick={() => setIsOpen(!isOpen)}

    if (!lastUpdated) return 'Never';        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-krborder hover:border-krgold"

    const minutes = Math.floor((Date.now() - lastUpdated) / 60000);      >

    if (minutes < 1) return 'Just now';        <span>{currency.code}</span>

    if (minutes < 60) return `${minutes}m ago`;        <ChevronDown size={16} />

    const hours = Math.floor(minutes / 60);      </button>

    if (hours < 24) return `${hours}h ago`;

    return 'Over 24h ago';      {isOpen && (

  };        <div className="absolute right-0 mt-2 w-56 bg-krcard rounded-xl shadow-lg border border-krborder z-50 backdrop-blur-sm">

          <div className="py-1">

  return (            {currencies.map(c => (

    <div className="flex items-center gap-3">              <button

      {/* Primary Currency Selector */}                key={c.code}

      <div className="relative">                className="w-full px-4 py-2 text-left hover:bg-krbg"

        <div className="text-xs text-krtext/60 mb-1 font-medium">Primary</div>                onClick={() => {

        <button                  setCurrency(c);

          onClick={() => setIsPrimaryOpen(!isPrimaryOpen)}                  setIsOpen(false);

          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-krborder hover:border-krgold bg-krcard/50 transition-colors"                }}

        >              >

          <span className="font-medium">{primaryCurrency.code}</span>                {c.symbol} - {c.name}

          <ChevronDown size={16} className={`transition-transform ${isPrimaryOpen ? 'rotate-180' : ''}`} />              </button>

        </button>            ))}

            <button

        {isPrimaryOpen && (              className="w-full px-4 py-2 text-left hover:bg-krbg text-krgold"

          <>              onClick={() => {

            <div className="fixed inset-0 z-40" onClick={() => setIsPrimaryOpen(false)} />                setShowCustom(true);

            <div className="absolute right-0 mt-2 w-64 bg-krcard rounded-xl shadow-lg border border-krborder z-50 backdrop-blur-sm max-h-80 overflow-y-auto">                setIsOpen(false);

              <div className="py-1">              }}

                <div className="px-4 py-2 text-xs font-semibold text-krtext/60 border-b border-krborder">            >

                  Select Primary Currency              + Add Custom Currency

                </div>            </button>

                {currencies.map(c => (          </div>

                  <button        </div>

                    key={c.code}      )}

                    className={`w-full px-4 py-2 text-left hover:bg-krbg transition-colors flex items-center justify-between ${

                      c.code === primaryCurrency.code ? 'bg-krgold/10 text-krgold' : ''      {showCustom && (

                    }`}        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                    onClick={() => {          <form onSubmit={addCustom} className="bg-krcard p-6 rounded-xl w-96">

                      setPrimaryCurrency(c);            <h3 className="text-lg font-bold mb-4">Add Custom Currency</h3>

                      setIsPrimaryOpen(false);            <div className="space-y-4">

                    }}              <input

                  >                className="w-full p-2 border rounded"

                    <span>                placeholder="Code (e.g. EUR)"

                      <span className="font-medium">{c.symbol}</span> {c.name}                value={customForm.code}

                    </span>                onChange={e => setCustomForm({...customForm, code: e.target.value})}

                    <span className="text-xs text-krtext/60">{c.code}</span>                required

                  </button>              />

                ))}              <input

              </div>                className="w-full p-2 border rounded"

            </div>                placeholder="Symbol (e.g. €)"

          </>                value={customForm.symbol}

        )}                onChange={e => setCustomForm({...customForm, symbol: e.target.value})}

      </div>                required

              />

      {/* Secondary Currency Selector */}              <input

      <div className="relative">                className="w-full p-2 border rounded"

        <div className="text-xs text-krtext/60 mb-1 font-medium">Secondary</div>                placeholder="Name (e.g. Euro)"

        <button                value={customForm.name}

          onClick={() => setIsSecondaryOpen(!isSecondaryOpen)}                onChange={e => setCustomForm({...customForm, name: e.target.value})}

          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-krborder hover:border-krgold bg-krcard/50 transition-colors"                required

        >              />

          <span className="font-medium">{secondaryCurrency?.code || 'None'}</span>              <input

          <ChevronDown size={16} className={`transition-transform ${isSecondaryOpen ? 'rotate-180' : ''}`} />                type="number"

        </button>                step="0.000001"

                className="w-full p-2 border rounded"

        {isSecondaryOpen && (                placeholder="Rate to USD (e.g. 0.92)"

          <>                value={customForm.rate}

            <div className="fixed inset-0 z-40" onClick={() => setIsSecondaryOpen(false)} />                onChange={e => setCustomForm({...customForm, rate: Number(e.target.value)})}

            <div className="absolute right-0 mt-2 w-64 bg-krcard rounded-xl shadow-lg border border-krborder z-50 backdrop-blur-sm max-h-80 overflow-y-auto">                required

              <div className="py-1">              />

                <div className="px-4 py-2 text-xs font-semibold text-krtext/60 border-b border-krborder">              <div className="flex gap-2">

                  Select Secondary Currency                <button type="submit" className="px-4 py-2 bg-krgold text-white rounded">Add</button>

                </div>                <button type="button" onClick={() => setShowCustom(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>

                <button              </div>

                  className={`w-full px-4 py-2 text-left hover:bg-krbg transition-colors ${            </div>

                    !secondaryCurrency ? 'bg-krgold/10 text-krgold' : ''          </form>

                  }`}        </div>

                  onClick={() => {      )}

                    setSecondaryCurrency(null);    </div>

                    setIsSecondaryOpen(false);  );

                  }}}
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
