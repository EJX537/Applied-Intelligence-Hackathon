import { useState, useEffect } from 'react'
import { isNative } from '@pwa-kit/sdk'

export type AppMode = 'native' | 'pwa' | 'browser'

function detectMode(): AppMode {
  if (isNative) return 'native'
  const standalone = window.matchMedia('(display-mode: standalone)').matches
  const minimalUi = window.matchMedia('(display-mode: minimal-ui)').matches
  if (standalone || minimalUi) return 'pwa'
  return 'browser'
}

export function usePwaMode(): AppMode {
  const [mode, setMode] = useState<AppMode>(detectMode)

  useEffect(() => {
    // Re-evaluate when display-mode changes (e.g. user installs the PWA)
    const mql = window.matchMedia('(display-mode: standalone), (display-mode: minimal-ui)')
    const handler = () => setMode(detectMode())
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return mode
}
