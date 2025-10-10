import React, { useState } from 'react'
import { loadData, saveData } from '../utils/storage'

export default function Wallet(){
  const data = loadData()
  const [items, setItems] = useState(data.wallet || [])
  const [form, setForm] = useState({ date: '', type: 'deposit', amount: 0, notes: '' })

  const save = ()=>{
    const it = { id: Date.now(), ...form }
    const next = [it, ...items]
    setItems(next)
    saveData({ wallet: next })
  }

  const balance = items.reduce((s:any, it:any)=> s + (it.type==='deposit'? Number(it.amount): -Number(it.amount)), 0)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Wallet</h1>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-krgray/10 rounded-xl">
          <input className="w-full mb-2 p-2 rounded bg-krblack/40" placeholder="Date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} />
          <select value={form.type} onChange={e=>setForm({...form, type: e.target.value})} className="w-full mb-2 p-2 rounded bg-krblack/40">
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
          </select>
          <input type="number" className="w-full mb-2 p-2 rounded bg-krblack/40" placeholder="Amount" value={form.amount} onChange={e=>setForm({...form, amount: Number(e.target.value)})} />
          <textarea className="w-full mb-2 p-2 rounded bg-krblack/40" placeholder="Notes" value={form.notes} onChange={e=>setForm({...form, notes: e.target.value})} />
          <button className="px-4 py-2 bg-krgold text-krblack rounded font-bold" onClick={save}>Save</button>
        </div>
        <div className="md:col-span-2">
          <div className="bg-krgray/10 rounded-xl p-4 mb-4">Current Balance: <span className="font-bold">${balance.toFixed(2)}</span></div>
          <div className="space-y-2">
            {items.map((it:any)=> (
              <div key={it.id} className="p-3 bg-krgray/10 rounded flex justify-between">
                <div>{it.date} • {it.type}</div>
                <div>${Number(it.amount).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
