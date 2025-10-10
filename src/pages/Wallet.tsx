import React, { useState } from 'react'
import { loadData, saveData } from '../utils/storage'
import { useCurrency } from '../context/CurrencyContext'

export default function Wallet() {
  const data = loadData()
  const { formatAmount } = useCurrency()
  const [items, setItems] = useState(data.wallet || [])
  const [form, setForm] = useState({ date: '', type: 'deposit', amount: '', notes: '' })

  const save = ()=>{
    if (!form.date || !form.amount) {
      alert('Please fill in date and amount');
      return;
    }
    const it = { id: Date.now(), ...form, amount: Number(form.amount) }
    const next = [it, ...items]
    setItems(next)
    saveData({ wallet: next })
    setForm({ date: '', type: 'deposit', amount: '', notes: '' })
  }

  const balance = items.reduce((s:any, it:any)=> s + (it.type==='deposit'? Number(it.amount): -Number(it.amount)), 0)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-krtext">Wallet</h1>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="p-6 bg-krcard rounded-xl shadow-sm border border-krborder">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-krtext">Date</div>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:ring-1 focus:ring-krgold" 
                value={form.date} 
                onChange={e=>setForm({...form, date: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-krtext">Type</div>
              <select 
                value={form.type} 
                onChange={e=>setForm({...form, type: e.target.value})} 
                className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:ring-1 focus:ring-krgold"
              >
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-krtext">Amount</div>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:ring-1 focus:ring-krgold" 
                placeholder="Enter amount" 
                value={form.amount} 
                onChange={e=>setForm({...form, amount: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-krtext">Notes</div>
              <textarea 
                className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:ring-1 focus:ring-krgold" 
                placeholder="Add notes" 
                value={form.notes} 
                onChange={e=>setForm({...form, notes: e.target.value})} 
                rows={4}
              />
            </div>
            <button 
              onClick={save}
              className="w-full px-4 py-2 bg-krgold text-white rounded-md font-semibold hover:bg-kryellow transition-colors"
            >
              Save Transaction
            </button>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="bg-krcard rounded-xl shadow-sm border border-krborder p-4 mb-4">
            <div className="text-lg text-krtext">Current Balance: <span className="font-bold text-krgold">{formatAmount(balance)}</span></div>
          </div>
          <div className="space-y-3">
            {items.map((it:any)=> (
              <div key={it.id} className="p-4 bg-krcard rounded-xl shadow-sm border border-krborder">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-krtext">{it.date}</div>
                    <div className={`text-sm font-medium ${it.type === 'deposit' ? 'text-krsuccess' : 'text-krdanger'}`}>
                      {it.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                    </div>
                  </div>
                  <div className={`text-xl font-bold ${it.type === 'deposit' ? 'text-krsuccess' : 'text-krdanger'}`}>
                    {it.type === 'deposit' ? '+' : '-'}{formatAmount(Number(it.amount))}
                  </div>
                </div>
                {it.notes && (
                  <div className="mt-2 text-sm text-krmuted">
                    <strong>Notes:</strong> {it.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
