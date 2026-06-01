import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { HealthKitProvider, useHealthKitCtx } from './contexts/HealthKitContext'
import { AppLayout } from './components/layout/AppLayout'
import { AdminLayout } from './components/layout/AdminLayout'
import { StepsPage } from './pages/StepsPage'
import { HeartPage } from './pages/HeartPage'
import { ActivityPage } from './pages/ActivityPage'
import { FoodLogScreen } from './features/food/screens/FoodLogScreen'
import { ConsentScreen } from './features/food/screens/ConsentScreen'
import { CameraScreen } from './features/food/screens/CameraScreen'
import { PortionSelectScreen } from './features/food/screens/PortionSelectScreen'
import { ManualFoodSearchScreen } from './features/food/screens/ManualFoodSearchScreen'
import { MealSummaryScreen } from './features/food/screens/MealSummaryScreen'
import { WellPathHomePage } from './pages/WellPathHomePage'
import { WellPathOralHealthPage } from './pages/WellPathOralHealthPage'
import { WellPathFoodDietPage } from './pages/WellPathFoodDietPage'
import { WellPathLabDataPage } from './pages/WellPathLabDataPage'
import { AiPage } from './pages/AiPage'
import { SettingsPage } from './pages/SettingsPage'
import { AdminPage } from './pages/AdminPage'
import { AdminAiPage } from './pages/AdminAiPage'
import { AdminPatientPage } from './pages/AdminPatientPage'
import { ProviderDashboard } from './pages/ProviderDashboard'

// ── Authenticated app (Clients/Patients) ──────────────────────────

function AuthenticatedApp() {
  const { state, actions } = useHealthKitCtx()

  return (
    <Routes>
      {/* User pages → /user/* with AppLayout as layout route */}
      <Route path="user" element={<AppLayout />}>
        <Route index element={<WellPathHomePage />} />
        <Route path="steps" element={<StepsPage />} />
        <Route path="heart" element={<HeartPage state={state} actions={actions} />} />
        <Route path="activity" element={<ActivityPage state={state} actions={actions} />} />
        <Route path="food" element={<FoodLogScreen />}>
          <Route path="consent" element={<ConsentScreen />} />
          <Route path="camera" element={<CameraScreen />} />
          <Route path="portion-select" element={<PortionSelectScreen />} />
          <Route path="manual-search" element={<ManualFoodSearchScreen />} />
          <Route path="meal-summary" element={<MealSummaryScreen />} />
        </Route>
        <Route path="oral-health" element={<WellPathOralHealthPage />} />
        <Route path="food-diet" element={<WellPathFoodDietPage />} />
        <Route path="lab" element={<WellPathLabDataPage />} />
        <Route path="ai" element={<AiPage />} />
        <Route path="settings" element={<SettingsPage />} />
        {/* Admin routes inside same layout so TabBar works */}
        <Route path="admin" element={<AdminPage />} />
        <Route path="admin/patient" element={<AdminPatientPage />} />
        <Route path="admin/ai" element={<AdminAiPage />} />
      </Route>

      {/* Standalone /admin redirects into the layout route */}
      <Route path="admin" element={<Navigate to="/user/admin" replace />} />

      {/* Redirect root to /user */}
      <Route index element={<Navigate to="/user" replace />} />
      <Route path="*" element={<Navigate to="/user" replace />} />
    </Routes>
  )
}

// ── Auth gate & Role Resolver ─────────────────────────────────────

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--color-bg)]">
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
      <HealthKitProvider>
        <AppContent />
      </HealthKitProvider>
    </AuthProvider>
  )
}

export default App
