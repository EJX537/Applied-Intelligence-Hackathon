// Native stack navigator for the food feature.

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { FoodStackParamList } from './types';
import { FoodLogScreen } from '../screens/FoodLogScreen';
import { ConsentScreen } from '../screens/ConsentScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { PortionSelectScreen } from '../screens/PortionSelectScreen';
import { ManualFoodSearchScreen } from '../screens/ManualFoodSearchScreen';
import { MealSummaryScreen } from '../screens/MealSummaryScreen';

const Stack = createNativeStackNavigator<FoodStackParamList>();

export function FoodNavigator() {
  return (
    <Stack.Navigator initialRouteName="FoodLog">
      <Stack.Screen name="FoodLog" component={FoodLogScreen} options={{ title: 'Food & Drinks' }} />
      <Stack.Screen name="Consent" component={ConsentScreen} options={{ title: 'Privacy' }} />
      <Stack.Screen name="Camera" component={CameraScreen} options={{ title: 'New meal' }} />
      <Stack.Screen
        name="PortionSelect"
        component={PortionSelectScreen}
        options={{ title: 'Portions' }}
      />
      <Stack.Screen
        name="ManualFoodSearch"
        component={ManualFoodSearchScreen}
        options={{ title: 'Search food' }}
      />
      <Stack.Screen
        name="MealSummary"
        component={MealSummaryScreen}
        options={{ title: 'Summary' }}
      />
    </Stack.Navigator>
  );
}
