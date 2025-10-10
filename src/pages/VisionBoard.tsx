import React, { useState } from 'react'
import FileUploader from '../components/FileUploader'
import { loadData, saveData } from '../utils/storage'

export default function VisionBoard(){
  const data = loadData()
  const [items, setItems] = useState(data.vision || [])
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [target, setTarget] = useState('')
  const [date, setDate] = useState('')
  const [img, setImg] = useState('')

  const add = () => {
    const it = { id: Date.now(), title, desc, target, date, img }
    const next = [it, ...items]
    setItems(next)
    saveData({ vision: next })
    setTitle(''); setDesc(''); setTarget(''); setDate(''); setImg('')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Vision Board</h1>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-krgray/10 rounded-xl">
          <input className="w-full mb-2 p-2 rounded bg-krblack/40" placeholder="Goal title" value={title} onChange={e=>setTitle(e.target.value)} />
          <textarea className="w-full mb-2 p-2 rounded bg-krblack/40" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
          <input className="w-full mb-2 p-2 rounded bg-krblack/40" placeholder="Target amount" value={target} onChange={e=>setTarget(e.target.value)} />
          <input type="date" className="w-full mb-2 p-2 rounded bg-krblack/40" value={date} onChange={e=>setDate(e.target.value)} />
          <div className="mb-2">
            <FileUploader value={img} onChange={setImg} accept="image/*" />
          </div>
          <button className="px-4 py-2 bg-krgold text-krblack rounded font-bold" onClick={add}>Add Goal</button>
        </div>

        <div className="md:col-span-2">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((it:any)=> (
              <div key={it.id} className="bg-krgray/10 rounded-xl p-3">
                {it.img && <img src={it.img} alt={it.title} className="w-full h-40 object-cover rounded mb-2" />}
                <div className="font-bold">{it.title}</div>
                <div className="text-sm text-krwhite/80">{it.desc}</div>
                <div className="text-sm mt-2">Target: {it.target} • Due: {it.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
