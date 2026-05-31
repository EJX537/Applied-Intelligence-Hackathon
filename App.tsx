import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FoodNavigator } from './src/features/food/navigation/FoodNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <FoodNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
