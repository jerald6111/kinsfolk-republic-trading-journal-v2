const KEY = 'kr_trading_journal_v1'

export type AppData = {
  vision: any[],
  journal: any[],
  playbook: any[],
  wallet: any[],
}

export function loadData(): AppData {
  const raw = localStorage.getItem(KEY)
  if(!raw) return { vision: [], journal: [], playbook: [], wallet: [] }
  try{ return JSON.parse(raw) }catch(e){
    console.error('Failed to parse storage', e)
    return { vision: [], journal: [], playbook: [], wallet: [] }
  }
}

export function saveData(data: Partial<AppData>){
  const cur = loadData()
  const merged = { ...cur, ...data }
  localStorage.setItem(KEY, JSON.stringify(merged))
}

export function exportData(){
  const data = loadData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'kinsfolk-republic-data.json'
  a.click()
  URL.revokeObjectURL(url)
}

export async function importData(file: File, { overwrite = false } = {}){
  const txt = await file.text()
  const data = JSON.parse(txt)
  if(overwrite) {
    localStorage.setItem(KEY, JSON.stringify(data))
    return
  }
  const cur = loadData()
  const merged = { ...cur, ...data }
  localStorage.setItem(KEY, JSON.stringify(merged))
}

export function deleteAllData(){
  localStorage.removeItem(KEY)
}
