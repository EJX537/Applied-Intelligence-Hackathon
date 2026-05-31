import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { createClient, type InsForgeUser } from '../lib/auth'

// Singleton client — instantiated once (swap the import here for real SDK)
const client = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_URL ?? 'http://localhost:7130',
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY ?? 'mock-anon-key',
})

// ── Context shape ──────────────────────────────────────────────────────

interface AuthContextValue {
  user: InsForgeUser | null
  loading: boolean
  error: string | null

  signUp(email: string, password: string, name?: string): Promise<void>
  signIn(email: string, password: string): Promise<void>
  signOut(): Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ───────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<InsForgeUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // On mount, check if a session already exists
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    client.auth.getCurrentUser().then((res) => {
      if (cancelled) return
      if (res.data?.user) {
        setUser(res.data.user)
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    setError(null)
    const res = await client.auth.signUp({ email, password, name })
    if (res.error) {
      setError(res.error.message)
      throw new Error(res.error.message)
    }
    if (res.data) setUser(res.data.user)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    const res = await client.auth.signInWithPassword({ email, password })
    if (res.error) {
      setError(res.error.message)
      throw new Error(res.error.message)
    }
    if (res.data) setUser(res.data.user)
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    await client.auth.signOut()
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
