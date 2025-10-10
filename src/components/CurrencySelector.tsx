import React, { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { ChevronDown } from 'lucide-react';

export default function CurrencySelector() {
  const { currency, currencies, setCurrency, addCustomCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customForm, setCustomForm] = useState({ code: '', symbol: '', name: '', rate: 1 });

  const addCustom = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomCurrency(customForm);
    setCurrency(customForm);
    setShowCustom(false);
    setCustomForm({ code: '', symbol: '', name: '', rate: 1 });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-krborder hover:border-krgold"
      >
        <span>{currency.code}</span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-krcard rounded-lg shadow-lg border border-krborder z-50">
          <div className="py-1">
            {currencies.map(c => (
              <button
                key={c.code}
                className="w-full px-4 py-2 text-left hover:bg-krbg"
                onClick={() => {
                  setCurrency(c);
                  setIsOpen(false);
                }}
              >
                {c.symbol} - {c.name}
              </button>
            ))}
            <button
              className="w-full px-4 py-2 text-left hover:bg-krbg text-krgold"
              onClick={() => {
                setShowCustom(true);
                setIsOpen(false);
              }}
            >
              + Add Custom Currency
            </button>
          </div>
        </div>
      )}

      {showCustom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={addCustom} className="bg-krcard p-6 rounded-xl w-96">
            <h3 className="text-lg font-bold mb-4">Add Custom Currency</h3>
            <div className="space-y-4">
              <input
                className="w-full p-2 border rounded"
                placeholder="Code (e.g. EUR)"
                value={customForm.code}
                onChange={e => setCustomForm({...customForm, code: e.target.value})}
                required
              />
              <input
                className="w-full p-2 border rounded"
                placeholder="Symbol (e.g. €)"
                value={customForm.symbol}
                onChange={e => setCustomForm({...customForm, symbol: e.target.value})}
                required
              />
              <input
                className="w-full p-2 border rounded"
                placeholder="Name (e.g. Euro)"
                value={customForm.name}
                onChange={e => setCustomForm({...customForm, name: e.target.value})}
                required
              />
              <input
                type="number"
                step="0.000001"
                className="w-full p-2 border rounded"
                placeholder="Rate to USD (e.g. 0.92)"
                value={customForm.rate}
                onChange={e => setCustomForm({...customForm, rate: Number(e.target.value)})}
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-krgold text-white rounded">Add</button>
                <button type="button" onClick={() => setShowCustom(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}