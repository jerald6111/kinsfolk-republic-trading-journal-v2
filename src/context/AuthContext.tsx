import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import {
  hasVault, createVault, unlockVault, lockVault,
  verifyPasscode, changePasscode as changeVaultPasscode,
} from '../utils/storage'

type AuthStatus = 'setup' | 'locked' | 'unlocked'

const AUTOLOCK_KEY = 'kr_autolock_min'
const DEFAULT_AUTOLOCK_MIN = 15

export function getAutoLockMinutes(): number {
  const raw = localStorage.getItem(AUTOLOCK_KEY)
  if (raw === null) return DEFAULT_AUTOLOCK_MIN
  const n = Number(raw)
  return Number.isFinite(n) ? n : DEFAULT_AUTOLOCK_MIN
}

export function setAutoLockMinutes(min: number): void {
  localStorage.setItem(AUTOLOCK_KEY, String(min))
  window.dispatchEvent(new Event('kr:autolock-change'))
}

type AuthContextType = {
  status: AuthStatus
  createPasscode: (passcode: string) => Promise<void>
  unlock: (passcode: string) => Promise<void>
  lock: () => void
  /** Verify the current passcode then re-encrypt under a new one. Throws if old is wrong. */
  changePasscode: (oldPasscode: string, newPasscode: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() => (hasVault() ? 'locked' : 'setup'))

  const createPasscode = useCallback(async (passcode: string) => {
    await createVault(passcode)
    setStatus('unlocked')
  }, [])

  const unlock = useCallback(async (passcode: string) => {
    await unlockVault(passcode)
    setStatus('unlocked')
  }, [])

  const lock = useCallback(() => {
    lockVault()
    setStatus(hasVault() ? 'locked' : 'setup')
  }, [])

  const changePasscode = useCallback(async (oldPasscode: string, newPasscode: string) => {
    const ok = await verifyPasscode(oldPasscode)
    if (!ok) throw new Error('Current passcode is incorrect')
    await changeVaultPasscode(newPasscode)
  }, [])

  // ===== Auto-lock on inactivity =====
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (status !== 'unlocked') return

    const clear = () => { if (timerRef.current) clearTimeout(timerRef.current) }
    const arm = () => {
      clear()
      const mins = getAutoLockMinutes()
      if (!mins || mins <= 0) return // disabled
      timerRef.current = setTimeout(() => lock(), mins * 60 * 1000)
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    const onActivity = () => arm()
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))
    window.addEventListener('kr:autolock-change', arm)
    arm()

    return () => {
      clear()
      events.forEach((e) => window.removeEventListener(e, onActivity))
      window.removeEventListener('kr:autolock-change', arm)
    }
  }, [status, lock])

  return (
    <AuthContext.Provider value={{ status, createPasscode, unlock, lock, changePasscode }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
