import React from 'react'

export default function Card({ children, className = '' }:{children:any,className?:string}){
  return (
    <div className={`bg-krgray/10 border border-krgray/40 rounded-xl p-4 ${className}`}>
      {children}
    </div>
  )
}
