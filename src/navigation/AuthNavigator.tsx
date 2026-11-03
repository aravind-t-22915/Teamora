// src/navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { SplashScreen }       from '../features/auth/screens/SplashScreen';
import { WelcomeScreen }      from '../features/auth/screens/WelcomeScreen';
import { LoginScreen }        from '../features/auth/screens/LoginScreen';
import { RegisterScreen }     from '../features/auth/screens/RegisterScreen';
import { JoinClubScreen }     from '../features/auth/screens/JoinClubScreen';
import { ProfileSetupScreen } from '../features/auth/screens/ProfileSetupScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="Splash"        component={SplashScreen} />
      <Stack.Screen name="Welcome"       component={WelcomeScreen} />
      <Stack.Screen name="Login"         component={LoginScreen} />
      <Stack.Screen name="Register"      component={RegisterScreen} />
      <Stack.Screen name="JoinClub"      component={JoinClubScreen} />
      <Stack.Screen name="ProfileSetup"  component={ProfileSetupScreen} />
    </Stack.Navigator>
  );
}
