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
// ── Mock storage helpers ───────────────────────────────────────────────
const STORAGE_KEY_USERS = 'insforge_mock_users';
const STORAGE_KEY_TOKEN = 'insforge_mock_token';
function readUsers() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_USERS);
        if (!raw)
            return new Map();
        return new Map(JSON.parse(raw));
    }
    catch {
        return new Map();
    }
}
function writeUsers(map) {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(Array.from(map.entries())));
}
function generateId() {
    return crypto.randomUUID();
}
function generateToken() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return 'mock_jwt_' + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
function now() {
    return new Date().toISOString();
}
// ── Seed demo user on first load ───────────────────────────────────────
const DEMO_EMAIL = 'd@d.d';
const DEMO_PASSWORD = 'd';
function seedDemoUser() {
    const users = readUsers();
    if (!users.has(DEMO_EMAIL)) {
        const user = {
            id: generateId(),
            email: DEMO_EMAIL,
            name: 'Demo User',
            emailVerified: true,
            createdAt: now(),
            updatedAt: now(),
        };
        users.set(DEMO_EMAIL, { user, password: DEMO_PASSWORD });
        writeUsers(users);
    }
}
seedDemoUser();
// ── Mock client factory ────────────────────────────────────────────────
export function createClient(_config) {
    return {
        auth: {
            async signUp({ email, password, name }) {
                const users = readUsers();
                if (users.has(email)) {
                    return { error: { message: 'User already exists', statusCode: 409 } };
                }
                const user = {
                    id: generateId(),
                    email,
                    name,
                    emailVerified: false,
                    createdAt: now(),
                    updatedAt: now(),
                };
                users.set(email, { user, password });
                writeUsers(users);
                const accessToken = generateToken();
                localStorage.setItem(STORAGE_KEY_TOKEN, JSON.stringify({ token: accessToken, email }));
                return { data: { user, accessToken } };
            },
            async signInWithPassword({ email, password }) {
                const users = readUsers();
                const entry = users.get(email);
                if (!entry || entry.password !== password) {
                    return { error: { message: 'Invalid email or password', statusCode: 401 } };
                }
                const accessToken = generateToken();
                localStorage.setItem(STORAGE_KEY_TOKEN, JSON.stringify({ token: accessToken, email }));
                return { data: { user: entry.user, accessToken } };
            },
            async signOut() {
                localStorage.removeItem(STORAGE_KEY_TOKEN);
                return {};
            },
            async getCurrentUser() {
                try {
                    const raw = localStorage.getItem(STORAGE_KEY_TOKEN);
                    if (!raw)
                        return { data: { user: null } };
                    const { email } = JSON.parse(raw);
                    const users = readUsers();
                    const entry = users.get(email);
                    if (!entry) {
                        localStorage.removeItem(STORAGE_KEY_TOKEN);
                        return { data: { user: null } };
                    }
                    return { data: { user: entry.user } };
                }
                catch {
                    localStorage.removeItem(STORAGE_KEY_TOKEN);
                    return { data: { user: null } };
                }
            },
        },
    };
}
