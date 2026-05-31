/**
 * Mock InsForge auth client.
 *
 * Mirrors the real @insforge/sdk auth surface exactly.
 * Swap `createClient` below with the real SDK when ready:
 *
 *   import { createClient as insforgeCreateClient } from '@insforge/sdk'
 *   export const createClient = insforgeCreateClient
 *
 * The rest of the app stays the same — same types, same calls.
 */

// ── Types (match @insforge/sdk) ────────────────────────────────────────

export interface InsForgeUser {
  id: string
  email: string
  name?: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  profile?: {
    nickname?: string
    avatar_url?: string
    bio?: string
  }
  metadata?: Record<string, unknown>
}

export interface AuthResponse<T> {
  data?: T
  error?: { message: string; statusCode: number }
}

export interface SignUpParams {
  email: string
  password: string
  name?: string
}

export interface SignInParams {
  email: string
  password: string
}

export interface AuthClient {
  signUp(
    params: SignUpParams,
  ): Promise<AuthResponse<{ user: InsForgeUser; accessToken: string }>>
  signInWithPassword(
    params: SignInParams,
  ): Promise<AuthResponse<{ user: InsForgeUser; accessToken: string }>>
  signOut(): Promise<AuthResponse<void>>
  getCurrentUser(): Promise<AuthResponse<{ user: InsForgeUser | null }>>
}

export interface InsForgeSDK {
  auth: AuthClient
}

// ── Mock storage helpers ───────────────────────────────────────────────

const STORAGE_KEY_USERS = 'insforge_mock_users'
const STORAGE_KEY_TOKEN = 'insforge_mock_token'

function readUsers(): Map<string, { user: InsForgeUser; password: string }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS)
    if (!raw) return new Map()
    return new Map(JSON.parse(raw))
  } catch {
    return new Map()
  }
}

function writeUsers(
  map: Map<string, { user: InsForgeUser; password: string }>,
) {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(Array.from(map.entries())))
}

function generateId(): string {
  return crypto.randomUUID()
}

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return 'mock_jwt_' + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function now(): string {
  return new Date().toISOString()
}

// ── Seed users on first load ───────────────────────────────────────────

const DEMO_EMAIL = 'd@d.d'
const DEMO_PASSWORD = 'd'
const ADMIN_EMAIL = 'a@a.a'
const ADMIN_PASSWORD = 'a'

function seedUsers() {
  const users = readUsers()
  if (!users.has(DEMO_EMAIL)) {
    users.set(DEMO_EMAIL, {
      user: {
        id: generateId(),
        email: DEMO_EMAIL,
        name: 'Demo User',
        emailVerified: true,
        createdAt: now(),
        updatedAt: now(),
      },
      password: DEMO_PASSWORD,
    })
  }
  if (!users.has(ADMIN_EMAIL)) {
    users.set(ADMIN_EMAIL, {
      user: {
        id: generateId(),
        email: ADMIN_EMAIL,
        name: 'Admin',
        emailVerified: true,
        createdAt: now(),
        updatedAt: now(),
        metadata: { role: 'admin' },
      },
      password: ADMIN_PASSWORD,
    })
  }
  writeUsers(users)
}

seedUsers()

// ── Mock client factory ────────────────────────────────────────────────

export function createClient(_config: {
  baseUrl: string
  anonKey: string
}): InsForgeSDK {
  return {
    auth: {
      async signUp({ email, password, name }) {
        const users = readUsers()

        if (users.has(email)) {
          return { error: { message: 'User already exists', statusCode: 409 } }
        }

        const user: InsForgeUser = {
          id: generateId(),
          email,
          name,
          emailVerified: false,
          createdAt: now(),
          updatedAt: now(),
        }

        users.set(email, { user, password })
        writeUsers(users)

        const accessToken = generateToken()
        localStorage.setItem(STORAGE_KEY_TOKEN, JSON.stringify({ token: accessToken, email }))

        return { data: { user, accessToken } }
      },

      async signInWithPassword({ email, password }) {
        const users = readUsers()
        const entry = users.get(email)

        if (!entry || entry.password !== password) {
          return { error: { message: 'Invalid email or password', statusCode: 401 } }
        }

        const accessToken = generateToken()
        localStorage.setItem(STORAGE_KEY_TOKEN, JSON.stringify({ token: accessToken, email }))

        return { data: { user: entry.user, accessToken } }
      },

      async signOut() {
        localStorage.removeItem(STORAGE_KEY_TOKEN)
        return {}
      },

      async getCurrentUser() {
        try {
          const raw = localStorage.getItem(STORAGE_KEY_TOKEN)
          if (!raw) return { data: { user: null } }

          const { email } = JSON.parse(raw) as { token: string; email: string }
          const users = readUsers()
          const entry = users.get(email)

          if (!entry) {
            localStorage.removeItem(STORAGE_KEY_TOKEN)
            return { data: { user: null } }
          }

          return { data: { user: entry.user } }
        } catch {
          localStorage.removeItem(STORAGE_KEY_TOKEN)
          return { data: { user: null } }
        }
      },
    },
  }
}
