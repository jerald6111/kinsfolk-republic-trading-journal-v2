import React, { useState } from 'react'
import FileUploader from '../components/FileUploader'
import { loadData, saveData } from '../utils/storage'
import { marked } from 'marked'

export default function Playbook(){
  const data = loadData()
  const [items, setItems] = useState(data.playbook || [])
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [img, setImg] = useState('')

  const add = ()=>{
    const it = { id: Date.now(), title, desc, img }
    const next = [it, ...items]
    setItems(next)
    saveData({ playbook: next })
    setTitle(''); setDesc(''); setImg('')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Playbook</h1>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-krgray/10 rounded-xl">
          <input className="w-full mb-2 p-2 rounded bg-krblack/40" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <div className="mb-2">
            <FileUploader value={img} onChange={setImg} accept="image/*" />
          </div>
          <textarea className="w-full mb-2 p-2 rounded bg-krblack/40" placeholder="Description (markdown)" value={desc} onChange={e=>setDesc(e.target.value)} />
          <button className="px-4 py-2 bg-krgold text-krblack rounded font-bold" onClick={add}>Save Strategy</button>
        </div>
        <div className="md:col-span-2">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((it:any)=> (
              <div key={it.id} className="bg-krgray/10 rounded-xl p-3">
                {it.img && <img src={it.img} alt={it.title} className="w-full h-40 object-cover rounded mb-2" />}
                <div className="font-bold">{it.title}</div>
                <div className="text-sm" dangerouslySetInnerHTML={{__html: marked(it.desc||'')}}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
