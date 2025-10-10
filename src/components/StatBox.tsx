import React from 'react'

export default function StatBox({title, value}:{title:string, value: any}){
  return (
    <div className="bg-gradient-to-br from-krblack to-#0b1113 border border-krgray rounded-xl p-4 w-full">
      <div className="text-sm text-krgold font-semibold">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  )
}
