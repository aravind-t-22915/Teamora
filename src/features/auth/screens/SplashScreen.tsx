// src/features/auth/screens/SplashScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../types';
import { colors, typography } from '../../../config/theme';
import { useAuthStore } from '../../../stores/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        navigation.replace('Welcome');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>⚽</Text>
      <Text style={styles.appName}>TEAMORA</Text>
      <Text style={styles.subtitle}>FC Revelation</Text>
      <ActivityIndicator
        color={colors.accent.primary}
        size="small"
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.background.primary,
    alignItems:      'center',
    justifyContent:  'center',
    gap:             12,
  },
  logo: {
    fontSize: 64,
  },
  appName: {
    fontSize:   typography.size['4xl'],
    color:      colors.text.primary,
    fontWeight: '900',
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: typography.size.md,
    color:    colors.accent.primary,
    letterSpacing: 2,
  },
  loader: {
    marginTop: 40,
  },
});
