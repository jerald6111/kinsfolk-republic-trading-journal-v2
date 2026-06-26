import React, { useEffect, useState } from 'react'
import { Cloud, UploadCloud, DownloadCloud, LogOut, CheckCircle2, RefreshCw, Eye, EyeOff } from 'lucide-react'
import {
  isSupabaseConfigured, getCurrentUser, onAuthChange,
  signIn, signUp, signOut, pushToCloud, pullFromCloud,
  getLastSync, isAutoSyncOn, setAutoSync, type SyncUser,
} from '../lib/cloudSync'

function timeAgo(ts: number | null): string {
  if (!ts) return 'never'
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function CloudSync() {
  const [user, setUser] = useState<SyncUser | null>(null)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err' | 'info'; text: string } | null>(null)
  const [lastSync, setLastSync] = useState<number | null>(getLastSync())
  const [autoSync, setAuto] = useState(isAutoSyncOn())

  useEffect(() => {
    getCurrentUser().then(setUser)
    const off = onAuthChange(setUser)
    return off
  }, [])

  // Auto-sync: push to cloud (debounced) whenever local data changes.
  useEffect(() => {
    if (!user || !autoSync) return
    let t: ReturnType<typeof setTimeout> | null = null
    const onChange = () => {
      if (t) clearTimeout(t)
      t = setTimeout(() => {
        pushToCloud().then(() => setLastSync(getLastSync())).catch(() => {})
      }, 1500)
    }
    window.addEventListener('kr:data-change', onChange)
    return () => { if (t) clearTimeout(t); window.removeEventListener('kr:data-change', onChange) }
  }, [user, autoSync])

  const flash = (type: 'ok' | 'err' | 'info', text: string) => {
    setMsg({ type, text })
    if (type !== 'err') setTimeout(() => setMsg(null), 4000)
  }

  const handleAuth = async () => {
    if (!email || !password) { flash('err', 'Enter your email and password.'); return }
    setBusy(true); setMsg(null)
    try {
      if (mode === 'signup') {
        const { needsConfirmation } = await signUp(email, password)
        if (needsConfirmation) {
          flash('info', `Account created. Check ${email} to confirm, then sign in.`)
          setMode('signin')
        } else {
          flash('ok', 'Account created and signed in.')
        }
      } else {
        await signIn(email, password)
        flash('ok', 'Signed in.')
      }
      setPassword('')
    } catch (e: any) {
      flash('err', e?.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const handlePush = async () => {
    setBusy(true); setMsg(null)
    try { await pushToCloud(); setLastSync(getLastSync()); flash('ok', 'Backed up to the cloud.') }
    catch (e: any) { flash('err', e?.message || 'Backup failed.') }
    finally { setBusy(false) }
  }

  const handlePull = async () => {
    if (!window.confirm('Restore from cloud? This replaces the journal on this device with your cloud copy.')) return
    setBusy(true); setMsg(null)
    try {
      const data = await pullFromCloud()
      if (!data) { flash('info', 'No cloud backup found yet. Back up first.'); return }
      flash('ok', 'Restored from cloud. Reloading…')
      setTimeout(() => window.location.reload(), 900)
    } catch (e: any) { flash('err', e?.message || 'Restore failed.') }
    finally { setBusy(false) }
  }

  const toggleAuto = () => {
    const next = !autoSync
    setAuto(next); setAutoSync(next)
    if (next) flash('info', 'Auto-sync on — changes back up to the cloud automatically.')
  }

  const handleSignOut = async () => { await signOut(); flash('info', 'Signed out. Your data stays on this device.') }

  return (
    <div className="bg-krcard shadow-soft rounded-xl border border-krborder transition-all duration-200 hover:border-krgold/40 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-krborder bg-krpanel text-krgold"><Cloud size={18} /></span>
          <div>
            <h2 className="text-lg font-semibold text-krtext">Cloud Sync <span className="text-xs font-normal text-krmuted">· optional</span></h2>
            <p className="text-xs text-krmuted">Sign in to back up and sync your journal across devices</p>
          </div>
        </div>
        {user && (
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-krsuccess">
            <CheckCircle2 size={14} /> Synced {timeAgo(lastSync)}
          </span>
        )}
      </div>

      {!isSupabaseConfigured ? (
        <div className="rounded-xl border border-krborder bg-krblack/30 p-4 text-sm text-krmuted">
          Cloud sync isn't configured on this build. Add <span className="font-mono text-krgold">VITE_SUPABASE_URL</span> and{' '}
          <span className="font-mono text-krgold">VITE_SUPABASE_ANON_KEY</span> to enable it. Your data stays on this device regardless.
        </div>
      ) : !user ? (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com" autoComplete="email"
              className="w-full px-3 py-2 rounded-xl bg-krblack/30 border border-krborder text-krtext focus:ring-2 focus:ring-krgold/20 focus:border-krgold/50 transition-all"
            />
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                className="w-full px-3 py-2 pr-10 rounded-xl bg-krblack/30 border border-krborder text-krtext focus:ring-2 focus:ring-krgold/20 focus:border-krgold/50 transition-all"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-krmuted hover:text-krtext transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <button
              onClick={handleAuth} disabled={busy}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-krgold text-krblack rounded-xl hover:bg-kryellow transition-all font-semibold disabled:opacity-50"
            >
              {busy ? <RefreshCw size={16} className="animate-spin" /> : <Cloud size={16} />}
              {mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
            <button
              onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setMsg(null) }}
              className="text-sm text-krmuted hover:text-krgold transition-colors"
            >
              {mode === 'signup' ? 'Have an account? Sign in' : 'New here? Create an account'}
            </button>
          </div>
          <p className="text-xs text-krmuted">Cloud sync is optional — the app stays fully usable without an account.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-krborder bg-krblack/30 px-4 py-3">
            <div className="min-w-0">
              <div className="text-sm font-medium text-krtext truncate">{user.email}</div>
              <div className="text-xs text-krmuted">Last synced {timeAgo(lastSync)}</div>
            </div>
            <button onClick={handleSignOut} className="flex items-center gap-1.5 text-sm text-krmuted hover:text-krdanger transition-colors">
              <LogOut size={15} /> Sign out
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <button
              onClick={handlePush} disabled={busy}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-krgold text-krblack rounded-xl hover:bg-kryellow transition-all font-semibold disabled:opacity-50"
            >
              <UploadCloud size={18} /> Back up to cloud
            </button>
            <button
              onClick={handlePull} disabled={busy}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-krborder bg-krpanel text-krtext rounded-xl hover:border-krgold/50 transition-all font-semibold disabled:opacity-50"
            >
              <DownloadCloud size={18} /> Restore from cloud
            </button>
          </div>

          <label className="flex items-center justify-between rounded-xl border border-krborder bg-krblack/30 px-4 py-3 cursor-pointer">
            <span className="text-sm text-krtext">Auto-sync changes to the cloud</span>
            <span className="relative inline-flex" onClick={(e) => { e.preventDefault(); toggleAuto() }}>
              <span className={`h-6 w-11 rounded-full transition-colors ${autoSync ? 'bg-krgold' : 'bg-krborder'}`} />
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-krblack transition-all ${autoSync ? 'left-[1.4rem]' : 'left-0.5'}`} />
            </span>
          </label>
        </div>
      )}

      {msg && (
        <div className={`mt-4 rounded-xl border px-4 py-2.5 text-sm ${
          msg.type === 'ok' ? 'border-krsuccess/30 bg-krsuccess/10 text-krsuccess'
          : msg.type === 'err' ? 'border-krdanger/30 bg-krdanger/10 text-krdanger'
          : 'border-krgold/30 bg-krgold/10 text-krgold'
        }`}>
          {msg.text}
        </div>
      )}
    </div>
  )
}
