import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './features/food/screens/LoginScreen';
import { FoodLogScreen } from './features/food/screens/FoodLogScreen';
import { ConsentScreen } from './features/food/screens/ConsentScreen';
import { CameraScreen } from './features/food/screens/CameraScreen';
import { PortionSelectScreen } from './features/food/screens/PortionSelectScreen';
import { ManualFoodSearchScreen } from './features/food/screens/ManualFoodSearchScreen';
import { MealSummaryScreen } from './features/food/screens/MealSummaryScreen';
import { colors } from './features/food/constants/colors';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="app-shell"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.textLight,
          fontSize: 15,
        }}
      >
        Loading…
      </div>
    );
  }

  // Not authenticated → show login
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginScreen />} />
      </Routes>
    );
  }

  // Authenticated → show app
  return (
    <Routes>
      <Route path="/" element={<FoodLogScreen />} />
      <Route path="/consent" element={<ConsentScreen />} />
      <Route path="/camera" element={<CameraScreen />} />
      <Route path="/portion-select" element={<PortionSelectScreen />} />
      <Route path="/manual-search" element={<ManualFoodSearchScreen />} />
      <Route path="/meal-summary" element={<MealSummaryScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
