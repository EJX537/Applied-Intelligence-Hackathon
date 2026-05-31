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

// ── Layout route shell for tab pages ──────────────────────────────

function AppShell() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}

// ── Authenticated app ─────────────────────────────────────────────

function AuthenticatedApp() {
  const [state, actions] = useHealthKit()

  return (
    <Routes>
      {/* Tab-based pages (inside AppLayout with bottom nav) */}
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage state={state} actions={actions} />} />
        <Route path="steps" element={<StepsPage state={state} actions={actions} />} />
        <Route path="heart" element={<HeartPage state={state} actions={actions} />} />
        <Route path="activity" element={<ActivityPage state={state} actions={actions} />} />
      </Route>

      {/* Food logging (full-screen, no tab bar) */}
      <Route path="food" element={<FoodLogScreen />} />
      <Route path="food/consent" element={<ConsentScreen />} />
      <Route path="food/camera" element={<CameraScreen />} />
      <Route path="food/portion-select" element={<PortionSelectScreen />} />
      <Route path="food/manual-search" element={<ManualFoodSearchScreen />} />
      <Route path="food/meal-summary" element={<MealSummaryScreen />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// ── Auth gate ─────────────────────────────────────────────────────

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

// ── Root ──────────────────────────────────────────────────────────

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
