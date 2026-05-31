import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { insforge } from '../shared/api/insforgeClient'
import type { UserSchema } from '@insforge/sdk'

// ── Context shape ──────────────────────────────────────────────────────

interface AuthContextValue {
  user: UserSchema | null
  loading: boolean
  error: string | null

  signUp(email: string, password: string, name?: string): Promise<void>
  signIn(email: string, password: string): Promise<void>
  signOut(): Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ───────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSchema | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // On mount, check if a session already exists
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    insforge.auth.getCurrentUser().then((res) => {
      if (cancelled) return
      if (res.data?.user) {
        setUser(res.data.user)
      }
      setLoading(false)
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    setError(null)
    const res = await insforge.auth.signUp({ email, password, name })
    if (res.error) {
      setError(res.error.message)
      throw new Error(res.error.message)
    }
    if (res.data?.user) setUser(res.data.user)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    let res = await insforge.auth.signInWithPassword({ email, password })

    const providerEmail = import.meta.env.VITE_PROVIDER_EMAIL ?? 'provider@healthtrack.com'
    const providerPassword = import.meta.env.VITE_PROVIDER_PASSWORD ?? 'providerpassword'

    if (res.error && email === providerEmail && password === providerPassword) {
      // Auto-signup Provider if account doesn't exist yet
      const signUpRes = await insforge.auth.signUp({ email, password, name: 'Provider' })
      if (!signUpRes.error) {
        res = await insforge.auth.signInWithPassword({ email, password })
      }
    }

    if (res.error) {
      setError(res.error.message)
      throw new Error(res.error.message)
    }
    if (res.data) setUser(res.data.user)
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    await insforge.auth.signOut()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
