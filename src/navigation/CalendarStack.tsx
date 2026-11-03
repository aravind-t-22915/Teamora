// src/navigation/CalendarStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CalendarStackParamList } from '../types';
import { CalendarScreen }     from '../features/calendar/screens/CalendarScreen';
import { EventDetailScreen }  from '../features/events/screens/EventDetailScreen';
import { colors } from '../config/theme';

const Stack = createNativeStackNavigator<CalendarStackParamList>();
export function CalendarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background.primary } }}>
      <Stack.Screen name="Calendar"    component={CalendarScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
    </Stack.Navigator>
  );
}
