import { supabase, isSupabaseConfigured } from './supabase'
import { loadData, saveData, type AppData } from '../utils/storage'

export { isSupabaseConfigured }

export type SyncUser = { id: string; email: string }

const LAST_SYNC_KEY = 'kr_cloud_last_sync'
const AUTOSYNC_KEY = 'kr_cloud_autosync'

export function getLastSync(): number | null {
  const raw = localStorage.getItem(LAST_SYNC_KEY)
  const n = raw ? Number(raw) : NaN
  return Number.isFinite(n) ? n : null
}
function markSynced() {
  localStorage.setItem(LAST_SYNC_KEY, String(Date.now()))
}

export function isAutoSyncOn(): boolean {
  return localStorage.getItem(AUTOSYNC_KEY) === '1'
}
export function setAutoSync(on: boolean) {
  localStorage.setItem(AUTOSYNC_KEY, on ? '1' : '0')
}

export async function getCurrentUser(): Promise<SyncUser | null> {
  const { data } = await supabase.auth.getUser()
  const u = data.user
  return u ? { id: u.id, email: u.email || '' } : null
}

/** Sign up. If the project requires email confirmation, no session is returned yet. */
export async function signUp(email: string, password: string): Promise<{ needsConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return { needsConfirmation: !data.session }
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

/** Push the current local journal up to the cloud (upsert one row per user). */
export async function pushToCloud(): Promise<void> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Please sign in first.')
  const data = loadData()
  const { error } = await supabase
    .from('journals')
    .upsert({ user_id: user.id, data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  if (error) throw error
  markSynced()
}

/** Pull the cloud journal and write it into the local (encrypted) store. */
export async function pullFromCloud(): Promise<AppData | null> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Please sign in first.')
  const { data, error } = await supabase
    .from('journals')
    .select('data')
    .eq('user_id', user.id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const appData = (data.data || {}) as AppData
  saveData(appData)
  markSynced()
  return appData
}

/** Subscribe to Supabase auth changes. Returns an unsubscribe function. */
export function onAuthChange(cb: (user: SyncUser | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user ? { id: session.user.id, email: session.user.email || '' } : null)
  })
  return () => data.subscription.unsubscribe()
}
