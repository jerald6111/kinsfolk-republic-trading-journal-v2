// Captures the browser's install prompt so we can trigger "Install app" from the UI.
// The beforeinstallprompt event can fire before React mounts, so we capture it at
// module load and notify subscribers.

let deferredPrompt: any = null
let installed = false
const listeners = new Set<() => void>()

function notify() { listeners.forEach((l) => l()) }

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault()
    deferredPrompt = e
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    installed = true
    notify()
  })
}

export function canInstall(): boolean {
  return deferredPrompt !== null
}

export function isInstalled(): boolean {
  // Standalone display-mode means it's running as an installed PWA.
  const standalone =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true)
  return installed || !!standalone
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false
  deferredPrompt.prompt()
  const choice = await deferredPrompt.userChoice
  if (choice.outcome === 'accepted') {
    deferredPrompt = null
    notify()
    return true
  }
  return false
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}
