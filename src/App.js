import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { useHealthKit } from './hooks/useHealthKit';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { StepsPage } from './pages/StepsPage';
import { HeartPage } from './pages/HeartPage';
import { ActivityPage } from './pages/ActivityPage';
import { FoodLogScreen } from './features/food/screens/FoodLogScreen';
import { ConsentScreen } from './features/food/screens/ConsentScreen';
import { CameraScreen } from './features/food/screens/CameraScreen';
import { PortionSelectScreen } from './features/food/screens/PortionSelectScreen';
import { ManualFoodSearchScreen } from './features/food/screens/ManualFoodSearchScreen';
import { MealSummaryScreen } from './features/food/screens/MealSummaryScreen';
// ── Layout route shell for tab pages ──────────────────────────────
function AppShell() {
    return (_jsx(AppLayout, { children: _jsx(Outlet, {}) }));
}
// ── Authenticated app ─────────────────────────────────────────────
function AuthenticatedApp() {
    const [state, actions] = useHealthKit();
    return (_jsxs(Routes, { children: [_jsxs(Route, { element: _jsx(AppShell, {}), children: [_jsx(Route, { index: true, element: _jsx(DashboardPage, { state: state, actions: actions }) }), _jsx(Route, { path: "steps", element: _jsx(StepsPage, { state: state, actions: actions }) }), _jsx(Route, { path: "heart", element: _jsx(HeartPage, { state: state, actions: actions }) }), _jsx(Route, { path: "activity", element: _jsx(ActivityPage, { state: state, actions: actions }) })] }), _jsx(Route, { path: "food", element: _jsx(FoodLogScreen, {}) }), _jsx(Route, { path: "food/consent", element: _jsx(ConsentScreen, {}) }), _jsx(Route, { path: "food/camera", element: _jsx(CameraScreen, {}) }), _jsx(Route, { path: "food/portion-select", element: _jsx(PortionSelectScreen, {}) }), _jsx(Route, { path: "food/manual-search", element: _jsx(ManualFoodSearchScreen, {}) }), _jsx(Route, { path: "food/meal-summary", element: _jsx(MealSummaryScreen, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }));
}
// ── Auth gate ─────────────────────────────────────────────────────
function AppContent() {
    const { user, loading } = useAuth();
    if (loading) {
        return (_jsx("div", { className: "h-dvh flex items-center justify-center bg-[var(--color-bg)]", children: _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("span", { className: "text-3xl", children: "\uD83D\uDC9A" }), _jsx("p", { className: "text-sm text-[var(--color-text)]", children: "Loading\u2026" })] }) }));
    }
    if (!user)
        return _jsx(AuthPage, {});
    return _jsx(AuthenticatedApp, {});
}
// ── Root ──────────────────────────────────────────────────────────
function App() {
    return (_jsx(AuthProvider, { children: _jsx(AppContent, {}) }));
}
export default App;
