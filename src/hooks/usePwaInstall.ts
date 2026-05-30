import { useEffect, useState } from 'react'
import { canInstall, isInstalled, promptInstall, subscribe } from '../utils/pwa'

/** Reactive PWA install state: whether the app can be installed and a trigger. */
export function usePwaInstall() {
  const [, force] = useState(0)
  useEffect(() => subscribe(() => force((x) => x + 1)), [])
  return {
    canInstall: canInstall(),
    installed: isInstalled(),
    promptInstall,
  }
}
