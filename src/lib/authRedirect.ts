// Capture Supabase auth-redirect info from the URL hash at module load time —
// before supabase-js (detectSessionInUrl) parses and clears it. Lets us show a
// "your email is confirmed" message after the user clicks the confirmation link.
function parse() {
  try {
    const raw = typeof window !== 'undefined' ? (window.location.hash || '') : ''
    const h = raw.startsWith('#') ? raw.slice(1) : raw
    const p = new URLSearchParams(h)
    return {
      type: p.get('type'),                       // 'signup' | 'recovery' | 'email' | 'magiclink' | null
      error: p.get('error'),
      errorDescription: p.get('error_description'),
      hasToken: p.has('access_token'),
    }
  } catch {
    return { type: null, error: null, errorDescription: null, hasToken: false }
  }
}

export const authRedirect = parse()
