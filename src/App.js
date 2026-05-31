import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
import { FoodLogScreen } from './features/food/screens/FoodLogScreen';
import { ConsentScreen } from './features/food/screens/ConsentScreen';
import { CameraScreen } from './features/food/screens/CameraScreen';
import { PortionSelectScreen } from './features/food/screens/PortionSelectScreen';
import { ManualFoodSearchScreen } from './features/food/screens/ManualFoodSearchScreen';
import { MealSummaryScreen } from './features/food/screens/MealSummaryScreen';
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(FoodLogScreen, {}) }), _jsx(Route, { path: "/consent", element: _jsx(ConsentScreen, {}) }), _jsx(Route, { path: "/camera", element: _jsx(CameraScreen, {}) }), _jsx(Route, { path: "/portion-select", element: _jsx(PortionSelectScreen, {}) }), _jsx(Route, { path: "/manual-search", element: _jsx(ManualFoodSearchScreen, {}) }), _jsx(Route, { path: "/meal-summary", element: _jsx(MealSummaryScreen, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }));
}
