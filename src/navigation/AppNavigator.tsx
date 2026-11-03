// src/navigation/AppNavigator.tsx
import React from 'react';
import { MainTabNavigator } from './MainTabNavigator';

// AppNavigator is a thin wrapper so RootNavigator can mount modals
// on top of the tab stack when needed (GalleryViewer, Statistics, etc.)
export function AppNavigator() {
  return <MainTabNavigator />;
}
