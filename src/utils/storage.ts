const KEY = 'kr_trading_journal_v1'
const WEBHOOK_KEY = 'kr_discord_webhook'

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

export function getDiscordWebhook(): string {
  return localStorage.getItem(WEBHOOK_KEY) || ''
}

export function setDiscordWebhook(url: string) {
  localStorage.setItem(WEBHOOK_KEY, url)
}

export async function sendToDiscord(data: any) {
  const webhookUrl = getDiscordWebhook()
  if (!webhookUrl) return false
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: `Trade: ${data.ticker} ${data.position}`,
          color: data.pnlAmount > 0 ? 0x00ff00 : 0xff0000,
          fields: [
            { name: 'Type', value: `${data.type} ${data.type === 'Futures' ? `${data.leverage}x` : ''}`, inline: true },
            { name: 'Objective', value: data.objective, inline: true },
            { name: 'Setup', value: data.setup || 'N/A', inline: true },
            { name: 'Entry', value: `${data.date} ${data.time}`, inline: true },
            { name: 'Entry Price', value: data.entryPrice.toString(), inline: true },
            { name: 'Exit Price', value: data.exitPrice.toString(), inline: true },
            { name: 'PnL', value: `${data.pnlAmount} (${data.pnlPercent.toFixed(2)}%)`, inline: true },
            { name: 'Entry Reason', value: data.reasonIn || 'N/A' },
            { name: 'Exit Reason', value: data.reasonOut || 'N/A' }
          ],
          image: data.chartImg ? { url: data.chartImg } : undefined,
          thumbnail: data.pnlImg ? { url: data.pnlImg } : undefined,
          timestamp: new Date().toISOString()
        }]
      })
    })
    return response.ok
  } catch (e) {
    console.error('Failed to send to Discord', e)
    return false
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
