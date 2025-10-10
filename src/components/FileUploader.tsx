import React from 'react'

export default function FileUploader({onFile}:{onFile:(f:string)=>void}){
  const handle = async (e: React.ChangeEvent<HTMLInputElement>)=>{
    const file = e.target.files?.[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = ()=>{
      if(typeof reader.result === 'string') onFile(reader.result)
    }
    reader.readAsDataURL(file)
  }
  return (
    <input type="file" accept="image/*" onChange={handle} className="text-sm text-krwhite" />
  )
}
