import { Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { useHealthKit } from './hooks/useHealthKit'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { StepsPage } from './pages/StepsPage'
import { HeartPage } from './pages/HeartPage'
import { ActivityPage } from './pages/ActivityPage'

// ── Layout route shell ─────────────────────────────────────────────────

function AppShell() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}

// ── Authenticated app ──────────────────────────────────────────────────

function AuthenticatedApp() {
  const [state, actions] = useHealthKit()

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage state={state} actions={actions} />} />
        <Route path="steps" element={<StepsPage state={state} actions={actions} />} />
        <Route path="heart" element={<HeartPage state={state} actions={actions} />} />
        <Route path="activity" element={<ActivityPage state={state} actions={actions} />} />
      </Route>
    </Routes>
  )
}

// ── Auth gate ──────────────────────────────────────────────────────────

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-[var(--color-bg)]">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl">💚</span>
          <p className="text-sm text-[var(--color-text)]">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) return <AuthPage />

  return <AuthenticatedApp />
}

// ── Root ───────────────────────────────────────────────────────────────

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
