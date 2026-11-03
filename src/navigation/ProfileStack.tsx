// src/navigation/ProfileStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types';
import { ProfileScreen }       from '../features/profile/screens/ProfileScreen';
import { EditProfileScreen }   from '../features/profile/screens/EditProfileScreen';
import { SettingsScreen }      from '../features/profile/screens/SettingsScreen';
import { NotificationsScreen } from '../features/profile/screens/NotificationsScreen';
import { colors } from '../config/theme';

const Stack = createNativeStackNavigator<ProfileStackParamList>();
export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background.primary } }}>
      <Stack.Screen name="Profile"       component={ProfileScreen} />
      <Stack.Screen name="EditProfile"   component={EditProfileScreen} />
      <Stack.Screen name="Settings"      component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
