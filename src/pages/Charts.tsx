import React, { useState } from 'react'
import { loadData, saveData } from '../utils/storage'

export default function Charts(){
  const data = loadData()
  const journal = data.journal || []
  const charts = journal.filter((j:any)=> j.chartImg)
  const [items, setItems] = useState(charts)

  const updateReason = (id:number, key:'reasonIn'|'reasonOut', val:string)=>{
    const j = journal.map((it:any)=> it.id===id ? { ...it, [key]: val } : it)
    saveData({ journal: j })
    setItems(j.filter((it:any)=> it.chartImg))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Charts</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((it:any)=> (
          <div key={it.id} className="bg-krgray/10 rounded-xl p-3">
            <img src={it.chartImg} className="w-full h-48 object-cover rounded mb-2" />
            <div className="font-bold">{it.coin}</div>
            <div className="text-sm">Entry: {it.entryPrice} • Exit: {it.exitPrice}</div>
            <textarea className="w-full mt-2 p-2 rounded bg-krblack/40" value={it.reasonIn} onChange={e=> updateReason(it.id, 'reasonIn', e.target.value)} />
            <textarea className="w-full mt-2 p-2 rounded bg-krblack/40" value={it.reasonOut} onChange={e=> updateReason(it.id, 'reasonOut', e.target.value)} />
          </div>
        ))}
      </div>
    </div>
  )
}
