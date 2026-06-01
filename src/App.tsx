import { Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { useHealthKit } from './hooks/useHealthKit'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { StepsPage } from './pages/StepsPage'
import { HeartPage } from './pages/HeartPage'
import { ActivityPage } from './pages/ActivityPage'
import { FoodLogScreen } from './features/food/screens/FoodLogScreen'
import { ConsentScreen } from './features/food/screens/ConsentScreen'
import { CameraScreen } from './features/food/screens/CameraScreen'
import { PortionSelectScreen } from './features/food/screens/PortionSelectScreen'
import { ManualFoodSearchScreen } from './features/food/screens/ManualFoodSearchScreen'
import { MealSummaryScreen } from './features/food/screens/MealSummaryScreen'
import { ProviderDashboard } from './pages/ProviderDashboard'

// ── Layout route shell for tab pages ──────────────────────────────

function AppShell() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}

// ── Authenticated app (Clients/Patients) ──────────────────────────

function AuthenticatedApp() {
  const [state, actions] = useHealthKit()

  return (
    <Routes>
      {/* All pages inside AppLayout with header + nav */}
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage state={state} actions={actions} />} />
        <Route path="steps" element={<StepsPage state={state} actions={actions} />} />
        <Route path="heart" element={<HeartPage state={state} actions={actions} />} />
        <Route path="activity" element={<ActivityPage state={state} actions={actions} />} />
        <Route path="food" element={<FoodLogScreen />}>
          <Route path="consent" element={<ConsentScreen />} />
          <Route path="camera" element={<CameraScreen />} />
          <Route path="portion-select" element={<PortionSelectScreen />} />
          <Route path="manual-search" element={<ManualFoodSearchScreen />} />
          <Route path="meal-summary" element={<MealSummaryScreen />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// ── Auth gate & Role Resolver ─────────────────────────────────────

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

  const providerEmail = (import.meta.env.VITE_PROVIDER_EMAIL ?? 'provider@healthtrack.com').trim().toLowerCase()
  const isProvider = user.email?.trim().toLowerCase() === providerEmail

  if (isProvider) {
    return <ProviderDashboard />
  }

  return <AuthenticatedApp />
}

// ── Root ──────────────────────────────────────────────────────────

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
