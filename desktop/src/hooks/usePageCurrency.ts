import { useState, useEffect } from 'react';
import { Currency } from '../context/CurrencyContext';

/**
 * Custom hook for managing per-page currency selection
 * @param pageKey - Unique identifier for the page (e.g., 'wallet', 'dashboard', 'analytics')
 * @param defaultCurrency - Default currency to use (usually primaryCurrency from context)
 */
export function usePageCurrency(pageKey: string, defaultCurrency: Currency) {
  const [localCurrency, setLocalCurrency] = useState<Currency | null>(() => {
    // Load from localStorage
    const saved = localStorage.getItem(`kr_page_currency_${pageKey}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Save to localStorage when changed
  const handleCurrencyChange = (currency: Currency) => {
    setLocalCurrency(currency);
    localStorage.setItem(`kr_page_currency_${pageKey}`, JSON.stringify(currency));
  };

  // Reset to default if primary currency changes
  useEffect(() => {
    if (localCurrency && localCurrency.code !== defaultCurrency.code) {
      const saved = localStorage.getItem(`kr_page_currency_${pageKey}`);
      if (!saved) {
        setLocalCurrency(null);
      }
    }
  }, [defaultCurrency.code, pageKey]);

  return {
    localCurrency,
    setLocalCurrency: handleCurrencyChange,
    displayCurrency: localCurrency || defaultCurrency,
  };
}
