import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { isNative } from '@pwa-kit/sdk'
import { useHealthKit, type HealthKitState, type HealthKitActions } from '../hooks/useHealthKit'

// ── Context ───────────────────────────────────────────────────────

interface HealthKitContextValue {
  state: HealthKitState
  actions: HealthKitActions
}

const HealthKitCtx = createContext<HealthKitContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────

export function HealthKitProvider({ children }: { children: ReactNode }) {
  const [state, actions] = useHealthKit()

  // 1. On mount → check availability (native only)
  useEffect(() => {
    if (!isNative) return
    actions.checkAvailability()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2. When available and not yet authorized → request auth
  useEffect(() => {
    if (!state.available || state.authorized) return
    actions.requestAuthorization()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.available, state.authorized])

  // 3. When authorized → pull today's steps
  useEffect(() => {
    if (!state.authorized) return
    actions.queryStepCount(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.authorized])

  return (
    <HealthKitCtx.Provider value={{ state, actions }}>
      {children}
    </HealthKitCtx.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────

export function useHealthKitCtx(): HealthKitContextValue {
  const ctx = useContext(HealthKitCtx)
  if (!ctx) throw new Error('useHealthKitCtx must be used inside <HealthKitProvider>')
  return ctx
}
