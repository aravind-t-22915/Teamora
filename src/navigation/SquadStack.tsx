// src/navigation/SquadStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SquadStackParamList } from '../types';
import { SquadScreen }            from '../features/squad/screens/SquadScreen';
import { PlayerProfileScreen }    from '../features/squad/screens/PlayerProfileScreen';
import { GroupsScreen }           from '../features/squad/screens/GroupsScreen';
import { GroupDetailScreen }      from '../features/squad/screens/GroupDetailScreen';
import { PendingApprovalsScreen } from '../features/squad/screens/PendingApprovalsScreen';
import { colors } from '../config/theme';

const Stack = createNativeStackNavigator<SquadStackParamList>();
export function SquadStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background.primary } }}>
      <Stack.Screen name="Squad"            component={SquadScreen} />
      <Stack.Screen name="PlayerProfile"    component={PlayerProfileScreen} />
      <Stack.Screen name="Groups"           component={GroupsScreen} />
      <Stack.Screen name="GroupDetail"      component={GroupDetailScreen} />
      <Stack.Screen name="PendingApprovals" component={PendingApprovalsScreen} />
    </Stack.Navigator>
  );
}
