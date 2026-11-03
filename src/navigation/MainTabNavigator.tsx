// src/navigation/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { colors, spacing, radius } from '../config/theme';
import { Platform, View, Text, StyleSheet } from 'react-native';

// Tab stacks
import { HomeStack }     from './HomeStack';
import { CalendarStack } from './CalendarStack';
import { EventsStack }   from './EventsStack';
import { SquadStack }    from './SquadStack';
import { ProfileStack }  from './ProfileStack';

import { useAuthStore }  from '../stores/authStore';
import { useUIStore }    from '../stores/uiStore';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export function MainTabNavigator() {
  const { can } = useAuthStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="CalendarTab"
        component={CalendarStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📅" label="Calendar" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.fabTab, focused && styles.fabTabActive]}>
              <Text style={styles.fabIcon}>+</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="SquadTab"
        component={SquadStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👥" label="Squad" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor:  colors.background.secondary,
    borderTopColor:   colors.border,
    borderTopWidth:   1,
    height:           Platform.OS === 'ios' ? 84 : 64,
    paddingBottom:    Platform.OS === 'ios' ? 24 : 8,
    paddingTop:       8,
  },
  tabItem: {
    alignItems: 'center',
    gap:        2,
  },
  tabEmoji: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize:   10,
    color:      colors.text.muted,
    fontFamily: 'Inter_400Regular',
  },
  tabLabelActive: {
    color: colors.accent.primary,
  },
  fabTab: {
    width:           52,
    height:          52,
    borderRadius:    26,
    backgroundColor: colors.background.tertiary,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    16,
    borderWidth:     1,
    borderColor:     colors.border,
  },
  fabTabActive: {
    backgroundColor: colors.accent.primary,
    borderColor:     colors.accent.primary,
  },
  fabIcon: {
    fontSize: 28,
    color:    colors.text.primary,
    lineHeight: 32,
  },
});
