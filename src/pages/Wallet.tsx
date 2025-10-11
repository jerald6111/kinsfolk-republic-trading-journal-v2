import React, { useState } from 'react'
import { loadData, saveData } from '../utils/storage'
import { useCurrency } from '../context/CurrencyContext'
import { Trash2, Edit2 } from 'lucide-react'

interface Transaction {
  id: number
  date: string
  type: 'deposit' | 'withdrawal'
  amount: number
  notes: string
}

export default function Wallet() {
  const data = loadData()
  const { formatAmount } = useCurrency()
  const [items, setItems] = useState<Transaction[]>(data.wallet || [])
  const [form, setForm] = useState({ date: '', type: 'deposit', amount: '', notes: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  const save = ()=>{
    if (!form.date || !form.amount) {
      alert('Please fill in date and amount');
      return;
    }
    
    if (editingId) {
      // Update existing transaction
      const next = items.map(it => 
        it.id === editingId 
          ? { id: editingId, date: form.date, type: form.type as 'deposit' | 'withdrawal', amount: Number(form.amount), notes: form.notes }
          : it
      )
      setItems(next)
      saveData({ wallet: next })
      setEditingId(null)
    } else {
      // Add new transaction
      const it = { id: Date.now(), date: form.date, type: form.type as 'deposit' | 'withdrawal', amount: Number(form.amount), notes: form.notes }
      const next = [it, ...items]
      setItems(next)
      saveData({ wallet: next })
    }
    
    setForm({ date: '', type: 'deposit', amount: '', notes: '' })
  }

  const editTransaction = (transaction: Transaction) => {
    setForm({
      date: transaction.date,
      type: transaction.type,
      amount: transaction.amount.toString(),
      notes: transaction.notes
    })
    setEditingId(transaction.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteTransaction = (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    const next = items.filter(it => it.id !== id)
    setItems(next)
    saveData({ wallet: next })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ date: '', type: 'deposit', amount: '', notes: '' })
  }

  // Calculate wallet balance from deposits/withdrawals
  const walletBalance = items.reduce((s, it)=> s + (it.type==='deposit'? Number(it.amount): -Number(it.amount)), 0)
  
  // Calculate total PnL from journal trades
  const journal = data.journal || []
  const totalTradingPnl = journal.reduce((s: number, j: any) => s + (j.pnlAmount || 0), 0)
  
  // Current balance = wallet balance + trading PnL
  const balance = walletBalance + totalTradingPnl

  return (
    <div className="min-h-screen bg-krcard/30 backdrop-blur-sm text-krtext p-6">
      <h1 className="text-2xl font-bold mb-6 text-krtext">Wallet</h1>
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Form Section */}
        <div className="bg-krcard backdrop-blur-sm rounded-xl shadow-sm border border-krborder p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-krtext">Date</div>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold" 
                value={form.date} 
                onChange={e=>setForm({...form, date: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-krtext">Type</div>
              <select 
                value={form.type} 
                onChange={e=>setForm({...form, type: e.target.value})} 
                className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold"
              >
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-krtext">Amount</div>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold" 
                placeholder="Enter amount" 
                value={form.amount} 
                onChange={e=>setForm({...form, amount: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-krtext">Notes</div>
              <textarea 
                className="w-full px-3 py-2 border border-krborder rounded-md bg-transparent text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold" 
                placeholder="Add notes" 
                value={form.notes} 
                onChange={e=>setForm({...form, notes: e.target.value})} 
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={save}
                className="flex-1 px-4 py-2 bg-krgold hover:bg-kryellow text-krblack rounded-md font-semibold transition-colors"
              >
                {editingId ? 'Update Transaction' : 'Save Transaction'}
              </button>
              {editingId && (
                <button 
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-krcard hover:bg-krgray/20 border border-krborder text-krtext rounded-md transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="md:col-span-2">
          <div className="bg-krcard backdrop-blur-sm rounded-xl shadow-sm border border-krborder p-6 mb-6">
            <div className="space-y-3">
              <div className="text-lg text-krtext">
                Current Balance: <span className="font-bold text-krgold text-2xl">{formatAmount(balance)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-krborder text-sm">
                <div>
                  <div className="text-gray-400 mb-1">Wallet Balance</div>
                  <div className="text-krtext font-semibold">{formatAmount(walletBalance)}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Trading P&L</div>
                  <div className={`font-semibold ${totalTradingPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalTradingPnl >= 0 ? '+' : ''}{formatAmount(totalTradingPnl)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {items.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No transactions yet. Add your first transaction to get started!
              </div>
            )}
            {items.map((it)=> (
              <div key={it.id} className="bg-krcard backdrop-blur-sm rounded-xl shadow-sm border border-krborder p-4 hover:border-krgold/50 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-medium text-krtext">{it.date}</div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${it.type === 'deposit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {it.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                      </span>
                    </div>
                    {it.notes && (
                      <div className="text-sm text-gray-400">
                        <strong className="text-krtext">Notes:</strong> {it.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`text-xl font-bold ${it.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                      {it.type === 'deposit' ? '+' : '-'}{formatAmount(Number(it.amount))}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => editTransaction(it)}
                        className="px-2 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-md transition-colors"
                        title="Edit Transaction"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteTransaction(it.id)}
                        className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-md transition-colors"
                        title="Delete Transaction"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
