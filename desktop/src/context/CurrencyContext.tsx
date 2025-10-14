import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = {
  code: string;
  symbol: string;
  name: string;
  rate: number;
};

const baseCurrencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'EUR', symbol: '', name: 'Euro', rate: 0.92 },
  { code: 'GBP', symbol: '', name: 'British Pound', rate: 0.79 },
  { code: 'PHP', symbol: '', name: 'Philippine Peso', rate: 56.5 },
  { code: 'JPY', symbol: '', name: 'Japanese Yen', rate: 149.5 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.53 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.36 },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', rate: 0.88 },
  { code: 'CNY', symbol: '', name: 'Chinese Yuan', rate: 7.24 },
  { code: 'INR', symbol: '', name: 'Indian Rupee', rate: 83.12 },
  { code: 'BTC', symbol: '', name: 'Bitcoin', rate: 0.000024 },
  { code: 'USDT', symbol: '', name: 'Tether', rate: 1 },
  { code: 'BUSD', symbol: 'B', name: 'Binance USD', rate: 1 },
];

type CurrencyContextType = {
  primaryCurrency: Currency;
  secondaryCurrency: Currency | null;
  currencies: Currency[];
  setPrimaryCurrency: (c: Currency) => void;
  setSecondaryCurrency: (c: Currency | null) => void;
  refreshExchangeRates: () => Promise<void>;
  convertAmount: (amount: number, from: Currency, to: Currency) => number;
  formatAmount: (amount: number, showBoth?: boolean, overrideCurrency?: Currency) => string;
  formatAmountInCurrency: (amount: number, currency: Currency) => string;
  isUpdating: boolean;
  lastUpdated: number | null;
  showBothCurrencies: boolean;
  setShowBothCurrencies: (show: boolean) => void;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [primaryCurrency, setPrimaryCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('kr_primary_currency');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return baseCurrencies[0];
      }
    }
    return baseCurrencies[0];
  });

  const [secondaryCurrency, setSecondaryCurrencyState] = useState<Currency | null>(() => {
    const saved = localStorage.getItem('kr_secondary_currency');
    if (saved && saved !== 'null') {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [showBothCurrencies, setShowBothCurrenciesState] = useState<boolean>(() => {
    const saved = localStorage.getItem('kr_currency_show_both');
    return saved === 'true';
  });

  const [currencies, setCurrencies] = useState<Currency[]>(baseCurrencies);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(() => {
    const saved = localStorage.getItem('kr_currency_last_update');
    return saved ? parseInt(saved) : null;
  });

  const setPrimaryCurrency = (c: Currency) => {
    setPrimaryCurrencyState(c);
    localStorage.setItem('kr_primary_currency', JSON.stringify(c));
  };

  const setSecondaryCurrency = (c: Currency | null) => {
    setSecondaryCurrencyState(c);
    localStorage.setItem('kr_secondary_currency', c ? JSON.stringify(c) : 'null');
  };

  const setShowBothCurrencies = (show: boolean) => {
    setShowBothCurrenciesState(show);
    localStorage.setItem('kr_currency_show_both', show.toString());
  };

  const refreshExchangeRates = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      const rates = data.rates;

      const updatedCurrencies = baseCurrencies.map(currency => {
        if (currency.code === 'USD') return currency;
        
        const rate = rates[currency.code];
        if (rate !== undefined) {
          return { ...currency, rate };
        }
        return currency;
      });

      setCurrencies(updatedCurrencies);

      const updatedPrimary = updatedCurrencies.find(c => c.code === primaryCurrency.code);
      if (updatedPrimary) {
        setPrimaryCurrencyState(updatedPrimary);
        localStorage.setItem('kr_primary_currency', JSON.stringify(updatedPrimary));
      }

      if (secondaryCurrency) {
        const updatedSecondary = updatedCurrencies.find(c => c.code === secondaryCurrency.code);
        if (updatedSecondary) {
          setSecondaryCurrencyState(updatedSecondary);
          localStorage.setItem('kr_secondary_currency', JSON.stringify(updatedSecondary));
        }
      }

      const now = Date.now();
      setLastUpdated(now);
      localStorage.setItem('kr_currency_last_update', now.toString());

      console.log('Exchange rates updated successfully');
    } catch (error) {
      console.error('Failed to refresh exchange rates:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const convertAmount = (amount: number, from: Currency, to: Currency): number => {
    if (from.code === to.code) return amount;
    
    const amountInUsd = amount / from.rate;
    const convertedAmount = amountInUsd * to.rate;
    
    return convertedAmount;
  };

  const formatAmount = (amount: number, showBoth?: boolean, overrideCurrency?: Currency): string => {
    const shouldShowBoth = showBoth !== undefined ? showBoth : showBothCurrencies;
    const displayCurrency = overrideCurrency || primaryCurrency;
    
    // Convert from primary to display currency if override is provided
    let displayAmount = amount;
    if (overrideCurrency && overrideCurrency.code !== primaryCurrency.code) {
      displayAmount = convertAmount(amount, primaryCurrency, overrideCurrency);
    }
    
    const primaryFormatted = `${displayCurrency.symbol}${Math.abs(displayAmount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    if (secondaryCurrency && shouldShowBoth && !overrideCurrency) {
      const convertedAmount = convertAmount(amount, primaryCurrency, secondaryCurrency);
      const secondaryFormatted = `${secondaryCurrency.symbol}${Math.abs(convertedAmount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
      
      return `${primaryFormatted} (${secondaryFormatted})`;
    }

    return primaryFormatted;
  };

  const formatAmountInCurrency = (amount: number, currency: Currency): string => {
    const convertedAmount = convertAmount(amount, primaryCurrency, currency);
    return `${currency.symbol}${Math.abs(convertedAmount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  useEffect(() => {
    const initialTimeout = setTimeout(() => {
      const lastUpdate = lastUpdated || 0;
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (Date.now() - lastUpdate > thirtyMinutes) {
        refreshExchangeRates();
      }
    }, 2000);

    const interval = setInterval(() => {
      refreshExchangeRates();
    }, 30 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <CurrencyContext.Provider
      value={{
        primaryCurrency,
        secondaryCurrency,
        currencies,
        setPrimaryCurrency,
        setSecondaryCurrency,
        refreshExchangeRates,
        convertAmount,
        formatAmount,
        formatAmountInCurrency,
        isUpdating,
        lastUpdated,
        showBothCurrencies,
        setShowBothCurrencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
