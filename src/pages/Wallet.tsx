import React, { useState } from 'react'
import { loadData, saveData, triggerAutoEmailBackup } from '../utils/storage'
import { useCurrency } from '../context/CurrencyContext'
import { Trash2, Edit2, Wallet as WalletIcon, Plus, ScrollText } from 'lucide-react'
import EmptyState from '../components/EmptyState'

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
      triggerAutoEmailBackup('update')
      setEditingId(null)
    } else {
      // Add new transaction
      const it = { id: Date.now(), date: form.date, type: form.type as 'deposit' | 'withdrawal', amount: Number(form.amount), notes: form.notes }
      const next = [it, ...items]
      setItems(next)
      saveData({ wallet: next })
      triggerAutoEmailBackup('add')
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
    triggerAutoEmailBackup('delete')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ date: '', type: 'deposit', amount: '', notes: '' })
  }

  // Calculate wallet balance from deposits/withdrawals
  const walletBalance = items.reduce((s, it)=> s + (it.type==='deposit'? Number(it.amount): -Number(it.amount)), 0)
  
  // Calculate total PnL from journal trades (pnlAmount - fee for each trade)
  const journal = data.journal || []
  const totalTradingPnl = journal.reduce((s: number, j: any) => s + (j.pnlAmount || 0) - (j.fee || 0), 0)
  
  // Current balance = wallet balance + trading PnL (after fees)
  const balance = walletBalance + totalTradingPnl
  
  // Calculate stats
  const totalDeposits = items.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0)
  const totalWithdrawals = items.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-krblack to-gray-950 text-krtext relative overflow-hidden">
      {/* Animated gradient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-krgold/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-kryellow/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-krborder bg-krpanel text-krgold"><WalletIcon size={22} /></span>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-krwhite"><span className="text-krgold">Wallet</span></h1>
              <p className="text-krmuted text-sm mt-1">Manage deposits, withdrawals, and track your balance</p>
            </div>
          </div>
        </div>

        {/* Balance Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-krcard shadow-soft rounded-xl border border-krborder p-4">
            <p className="text-xs text-krmuted mb-1">Current Balance</p>
            <p className={`text-2xl font-bold tnum ${balance >= 0 ? 'text-krsuccess' : 'text-krdanger'}`}>
              {formatAmount(balance)}
            </p>
          </div>
          <div className="bg-krcard shadow-soft rounded-xl border border-krborder p-4">
            <p className="text-xs text-krmuted mb-1">Total Deposits</p>
            <p className="text-2xl font-bold tnum text-blue-400">{formatAmount(totalDeposits)}</p>
          </div>
          <div className="bg-krcard shadow-soft rounded-xl border border-krborder p-4">
            <p className="text-xs text-krmuted mb-1">Total Withdrawals</p>
            <p className="text-2xl font-bold tnum text-orange-400">{formatAmount(totalWithdrawals)}</p>
          </div>
          <div className="bg-krcard shadow-soft rounded-xl border border-krborder p-4">
            <p className="text-xs text-krmuted mb-1">Trading P&L</p>
            <p className={`text-2xl font-bold tnum ${totalTradingPnl >= 0 ? 'text-krsuccess' : 'text-krdanger'}`}>
              {formatAmount(totalTradingPnl)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Form Section */}
        <div className="bg-krcard/90 backdrop-blur-md rounded-2xl shadow-2xl border border-krborder/50 p-6">
          <h2 className="text-2xl font-bold mb-4 text-krtext flex items-center gap-2">
            {editingId ? (
              <>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-krborder bg-krpanel text-krgold"><Edit2 size={18} /></span> Edit Transaction
              </>
            ) : (
              <>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-krborder bg-krpanel text-krgold"><Plus size={18} /></span> New Transaction
              </>
            )}
          </h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-krtext">Date</div>
              <input 
                type="date" 
                className="w-full px-3 py-3 border border-krborder rounded-xl bg-krblack/30 text-krtext focus:border-krgold focus:ring-2 focus:ring-krgold/20 transition-all" 
                value={form.date} 
                onChange={e=>setForm({...form, date: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-krtext">Type</div>
              <select 
                value={form.type} 
                onChange={e=>setForm({...form, type: e.target.value})} 
                className="w-full px-3 py-3 border border-krborder rounded-xl bg-krblack/30 text-krtext focus:border-krgold focus:ring-2 focus:ring-krgold/20 transition-all"
              >
                <option value="deposit" className="bg-krblack text-krtext">💵 Deposit</option>
                <option value="withdrawal" className="bg-krblack text-krtext">💸 Withdrawal</option>
              </select>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-krtext">Amount</div>
              <input 
                type="number" 
                className="w-full px-3 py-3 border border-krborder rounded-xl bg-krblack/30 text-krtext focus:border-krgold focus:ring-2 focus:ring-krgold/20 transition-all" 
                placeholder="Enter amount" 
                value={form.amount} 
                onChange={e=>setForm({...form, amount: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-krtext">Notes</div>
              <textarea 
                className="w-full px-3 py-3 border border-krborder rounded-xl bg-krblack/30 text-krtext focus:border-krgold focus:ring-2 focus:ring-krgold/20 transition-all" 
                placeholder="Add notes" 
                value={form.notes} 
                onChange={e=>setForm({...form, notes: e.target.value})} 
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={save}
                className="flex-1 px-4 py-3 bg-krgold hover:bg-kryellow text-krblack rounded-xl font-bold transition-colors"
              >
                {editingId ? 'Update Transaction' : 'Save Transaction'}
              </button>
              {editingId && (
                <button 
                  onClick={cancelEdit}
                  className="px-4 py-3 bg-krblack/50 text-krtext rounded-xl font-medium hover:bg-krblack/70 border border-krborder transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4 text-krtext flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-krborder bg-krpanel text-krgold"><ScrollText size={18} /></span> Transaction History ({items.length})
          </h2>
          
          <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2 custom-scrollbar">
            {items.length === 0 && (
              <EmptyState
                icon={<WalletIcon size={26} />}
                title="No transactions yet"
                description="Record your first deposit or withdrawal using the form on the left to start tracking your balance."
              />
            )}
            {items.slice().reverse().map((it)=> (
              <div key={it.id} className="bg-krcard/90 backdrop-blur-md rounded-xl border border-krborder/50 p-4 transition-all duration-200 hover:border-krgold/40 group">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-semibold text-krtext group-hover:text-krgold transition-colors">{it.date}</div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${it.type === 'deposit' ? 'bg-krsuccess/15 text-krsuccess border-krsuccess/30' : 'bg-krdanger/15 text-krdanger border-krdanger/30'}`}>
                        {it.type === 'deposit' ? '💵 Deposit' : '💸 Withdrawal'}
                      </span>
                    </div>
                    {it.notes && (
                      <div className="text-sm text-krmuted mt-1">
                        {it.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`text-xl font-bold ${it.type === 'deposit' ? 'text-krsuccess' : 'text-krdanger'}`}>
                      {it.type === 'deposit' ? '+' : '-'}{formatAmount(Number(it.amount))}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => editTransaction(it)}
                        className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-lg transition-all font-semibold"
                        title="Edit Transaction"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteTransaction(it.id)}
                        className="px-3 py-2 bg-krdanger/15 hover:bg-red-500/30 border border-krdanger/30 text-krdanger rounded-lg transition-all font-semibold"
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
      </div>
    </div>
  )
}
