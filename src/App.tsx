import { Routes, Route, Navigate } from 'react-router-dom';
import { FoodLogScreen } from './features/food/screens/FoodLogScreen';
import { ConsentScreen } from './features/food/screens/ConsentScreen';
import { CameraScreen } from './features/food/screens/CameraScreen';
import { PortionSelectScreen } from './features/food/screens/PortionSelectScreen';
import { ManualFoodSearchScreen } from './features/food/screens/ManualFoodSearchScreen';
import { MealSummaryScreen } from './features/food/screens/MealSummaryScreen';

export default function App() {
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
