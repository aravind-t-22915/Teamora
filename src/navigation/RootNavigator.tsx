// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuthStore } from '../stores/authStore';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../config/theme';
import { linking } from './linking';
import { useRegisterPushToken, useNotificationNavigation } from '../hooks/useNotifications';
import { StatisticsScreen } from '../features/statistics/screens/StatisticsScreen';
import { MediaViewerScreen } from '../features/gallery/screens/MediaViewerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Must render INSIDE NavigationContainer because useNotificationNavigation calls useNavigation()
function NotificationNavigationWatcher() {
  useNotificationNavigation();
  return null;
}

export function RootNavigator() {
  const { isLoading, isAuthenticated, user } = useAuthStore();

  // Register push token (no navigation dependency)
  useRegisterPushToken();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background.primary, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.accent.primary} size="large" />
      </View>
    );
  }

  // Active player must be approved
  const isApproved = isAuthenticated && user?.status === 'active';

  return (
    <NavigationContainer linking={linking}>
      <NotificationNavigationWatcher />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isApproved ? (
          <Stack.Screen name="App"  component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
        <Stack.Screen
          name="Statistics"
          component={StatisticsScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="GalleryViewer"
          component={MediaViewerScreen}
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
