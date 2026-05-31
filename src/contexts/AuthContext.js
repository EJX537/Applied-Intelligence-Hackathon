import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '../lib/auth';
// Singleton client — instantiated once (swap the import here for real SDK)
const client = createClient({
    baseUrl: import.meta.env.VITE_INSFORGE_URL ?? 'http://localhost:7130',
    anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY ?? 'mock-anon-key',
});
const AuthContext = createContext(null);
// ── Provider ───────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // On mount, check if a session already exists
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        client.auth.getCurrentUser().then((res) => {
            if (cancelled)
                return;
            if (res.data?.user) {
                setUser(res.data.user);
            }
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, []);
    const signUp = useCallback(async (email, password, name) => {
        setError(null);
        const res = await client.auth.signUp({ email, password, name });
        if (res.error) {
            setError(res.error.message);
            throw new Error(res.error.message);
        }
        if (res.data)
            setUser(res.data.user);
    }, []);
    const signIn = useCallback(async (email, password) => {
        setError(null);
        const res = await client.auth.signInWithPassword({ email, password });
        if (res.error) {
            setError(res.error.message);
            throw new Error(res.error.message);
        }
        if (res.data)
            setUser(res.data.user);
    }, []);
    const signOut = useCallback(async () => {
        setError(null);
        await client.auth.signOut();
        setUser(null);
    }, []);
    return (_jsx(AuthContext.Provider, { value: { user, loading, error, signUp, signIn, signOut }, children: children }));
}
// ── Hook ────────────────────────────────────────────────────────────────
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
