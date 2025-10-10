import React, { useState } from 'react'
import FileUploader from '../components/FileUploader'
import { loadData, saveData } from '../utils/storage'

export default function Journal(){
  const data = loadData()
  const [items, setItems] = useState(data.journal || [])
  const [form, setForm] = useState<any>({ date: '', coin: '', objective: '', setup: '', type: 'Long', positionSize: '', leverage: 1, entryPrice: '', marginCost: '', exitDate: '', exitPrice: '', fee: '', pnlAmount: 0, pnlPercent: 0, chartImg: '', pnlImg: '', reasonIn: '', reasonOut: '' })

  const save = ()=>{
    const it = { id: Date.now(), ...form }
    const next = [it, ...items]
    setItems(next)
    saveData({ journal: next })
  }

  const remove = (id:number)=>{
    const next = items.filter((i:any)=> i.id !== id)
    setItems(next)
    saveData({ journal: next })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Journal</h1>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-krgray/10 rounded-xl">
          <input className="w-full mb-2 p-2 rounded bg-krblack/40" placeholder="Date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} />
          <input className="w-full mb-2 p-2 rounded bg-krblack/40" placeholder="Coin / Stock" value={form.coin} onChange={e=>setForm({...form, coin: e.target.value})} />
          <input className="w-full mb-2 p-2 rounded bg-krblack/40" placeholder="Objective" value={form.objective} onChange={e=>setForm({...form, objective: e.target.value})} />
          <input className="w-full mb-2 p-2 rounded bg-krblack/40" placeholder="Entry Price" value={form.entryPrice} onChange={e=>setForm({...form, entryPrice: e.target.value})} />
          <div className="mb-2">Chart Image <FileUploader onFile={(f)=> setForm({...form, chartImg: f})} /></div>
          <div className="mb-2">PnL Image <FileUploader onFile={(f)=> setForm({...form, pnlImg: f})} /></div>
          <textarea className="w-full mb-2 p-2 rounded bg-krblack/40" placeholder="Reason for entry" value={form.reasonIn} onChange={e=>setForm({...form, reasonIn: e.target.value})} />
          <textarea className="w-full mb-2 p-2 rounded bg-krblack/40" placeholder="Reason for exit" value={form.reasonOut} onChange={e=>setForm({...form, reasonOut: e.target.value})} />
          <button className="px-4 py-2 bg-krgold text-krblack rounded font-bold" onClick={save}>Save Entry</button>
        </div>
        <div className="md:col-span-2">
          <div className="space-y-3">
            {items.map((it:any)=> (
              <div key={it.id} className="bg-krgray/10 rounded-xl p-3 flex gap-3 items-start">
                {it.chartImg && <img src={it.chartImg} className="w-28 h-20 object-cover rounded" />}
                <div className="flex-1">
                  <div className="font-bold">{it.coin} • {it.date}</div>
                  <div className="text-sm">{it.objective}</div>
                  <div className="text-sm mt-1">Pnl: {it.pnlAmount} ({it.pnlPercent}%)</div>
                </div>
                <div>
                  <button className="text-sm px-3 py-1 bg-krgray/60 rounded mr-2" onClick={()=>remove(it.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
