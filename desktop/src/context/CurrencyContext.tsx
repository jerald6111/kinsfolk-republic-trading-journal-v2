import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = {
  code: string;
  symbol: string;
  name: string;
  rate: number;
};

const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', rate: 56.5 },
  { code: 'BTC', symbol: '₿', name: 'Bitcoin', rate: 0.000024 },
  { code: 'USDT', symbol: '₮', name: 'Tether', rate: 1 },
  { code: 'BUSD', symbol: 'B', name: 'Binance USD', rate: 1 },
];

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  currencies: Currency[];
  addCustomCurrency: (c: Currency) => void;
  formatAmount: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(currencies[0]);
  const [allCurrencies, setAllCurrencies] = useState(currencies);

  useEffect(() => {
    const saved = localStorage.getItem('kr_currency');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCurrency(parsed);
    }
  }, []);

  const addCustomCurrency = (newCurrency: Currency) => {
    setAllCurrencies([...allCurrencies, newCurrency]);
  };

  const formatAmount = (amount: number) => {
    const converted = amount * currency.rate;
    if (currency.code === 'BTC') {
      return `${currency.symbol}${converted.toFixed(8)}`;
    }
    return `${currency.symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency: (c) => {
        setCurrency(c);
        localStorage.setItem('kr_currency', JSON.stringify(c));
      },
      currencies: allCurrencies,
      addCustomCurrency,
      formatAmount,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
}