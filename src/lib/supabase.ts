import { createClient } from '@supabase/supabase-js'

// Optional cloud sync (Supabase). The app stays local-first: if these env vars
// aren't set, the app runs exactly as before with no cloud features.
// Vite exposes only VITE_-prefixed vars to the client.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'public-anon-key-not-set',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'kr_supabase_auth',
    },
  }
)
