import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
export function AuthPage() {
    const { signUp, signIn, error } = useAuth();
    const [mode, setMode] = useState('sign-in');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (mode === 'sign-up') {
                await signUp(email, password, name || undefined);
            }
            else {
                await signIn(email, password);
            }
        }
        catch {
            // error is set in context
        }
        finally {
            setSubmitting(false);
        }
    }
    return (_jsxs("div", { className: "min-h-[100dvh] flex flex-col overflow-hidden", children: [_jsx("div", { className: "h-[env(safe-area-inset-top,0px)]" }), _jsxs("div", { className: "flex-1 flex flex-col items-center justify-center px-6", children: [_jsxs("div", { className: "flex items-center gap-2.5 mb-8", children: [_jsx("span", { className: "text-3xl leading-none", children: "\uD83D\uDC9A" }), _jsx("h1", { className: "text-2xl font-semibold text-[var(--color-text-h)] tracking-tight m-0", children: "Step Counter" })] }), _jsxs("div", { className: "w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-[var(--color-text-h)] m-0 mb-1", children: mode === 'sign-in' ? 'Sign in' : 'Create account' }), _jsx("p", { className: "text-sm text-[var(--color-text)] mb-5", children: mode === 'sign-in'
                                    ? 'Enter your email and password to continue'
                                    : 'Enter your details to get started' }), _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-3", children: [mode === 'sign-up' && (_jsx("input", { type: "text", placeholder: "Name (optional)", value: name, onChange: (e) => setName(e.target.value), className: "w-full h-11 px-4 rounded-xl border border-[var(--color-border)] bg-transparent text-sm text-[var(--color-text-h)] outline-none focus:border-green-500/50 transition-colors" })), _jsx("input", { type: "email", placeholder: "Email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "w-full h-11 px-4 rounded-xl border border-[var(--color-border)] bg-transparent text-sm text-[var(--color-text-h)] outline-none focus:border-green-500/50 transition-colors" }), _jsx("input", { type: "password", placeholder: "Password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "w-full h-11 px-4 rounded-xl border border-[var(--color-border)] bg-transparent text-sm text-[var(--color-text-h)] outline-none focus:border-green-500/50 transition-colors" }), error && (_jsx("p", { className: "text-sm text-red-500 m-0", children: error })), _jsx("button", { type: "submit", disabled: submitting, className: "w-full h-11 rounded-xl bg-green-500 text-white text-sm font-semibold cursor-pointer border-none transition-all active:scale-[0.98] disabled:opacity-35 disabled:cursor-not-allowed", children: submitting
                                            ? 'Please wait…'
                                            : mode === 'sign-in'
                                                ? 'Sign in'
                                                : 'Create account' })] })] }), _jsx("p", { className: "text-sm text-[var(--color-text)] mt-5", children: mode === 'sign-in' ? (_jsxs(_Fragment, { children: ["Don't have an account?", ' ', _jsx("button", { onClick: () => { setMode('sign-up'); setEmail(''); setPassword(''); setName(''); }, className: "text-green-500 font-medium bg-transparent border-none cursor-pointer p-0 text-sm", children: "Sign up" })] })) : (_jsxs(_Fragment, { children: ["Already have an account?", ' ', _jsx("button", { onClick: () => { setMode('sign-in'); setEmail(''); setPassword(''); setName(''); }, className: "text-green-500 font-medium bg-transparent border-none cursor-pointer p-0 text-sm", children: "Sign in" })] })) })] }), _jsx("div", { className: "h-[env(safe-area-inset-bottom,0px)]" })] }));
}
