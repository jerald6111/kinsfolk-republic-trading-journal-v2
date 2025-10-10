import React, { useRef } from 'react'
import { exportData, importData, deleteAllData } from '../utils/storage'

export default function DataSettings(){
  const fileRef = useRef<HTMLInputElement|null>(null)

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>)=>{
    const f = e.target.files?.[0]
    if(!f) return
    const ok = confirm('Merge data or overwrite? OK = Merge, Cancel = Overwrite')
    await importData(f, { overwrite: !ok })
    alert('Import complete')
  }

  const onDelete = ()=>{
    const ok = confirm('Type YES to confirm delete all data')
    if(ok) deleteAllData()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Data Settings</h1>
      <div className="space-y-3">
        <button className="px-4 py-2 bg-krgold text-krblack rounded" onClick={()=> exportData()}>Export Data (JSON)</button>
        <div>
          <input ref={fileRef} type="file" accept="application/json" onChange={onImport} />
        </div>
        <div>
          <button onDoubleClick={onDelete} className="px-4 py-2 bg-red-600 text-white rounded">Double-click to Delete All Data</button>
        </div>
      </div>
    </div>
  )
}
