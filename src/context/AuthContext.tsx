// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';

interface AuthContextValue {
  isLoading:       boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  isLoading:       true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setClub, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        console.log('[Auth] Firebase user signed in:', firebaseUser.uid, firebaseUser.email);
        try {
          const appUser = await authService.getUser(firebaseUser.uid);
          console.log('[Auth] Firestore user doc:', appUser ? 'found' : 'NOT FOUND');
          if (appUser) {
            const club = await authService.getClub(appUser.clubId);
            console.log('[Auth] Club doc:', club ? club.name : 'NOT FOUND');
            setUser(appUser);
            setClub(club);
          } else if (authService.isRegistering()) {
            // Race condition: onAuthStateChanged fired before registerCoach finished
            // writing the Firestore docs. RegisterScreen will call setUser() directly.
            console.log('[Auth] No user doc yet — registration in progress, skipping');
            setUser(null);
          } else {
            console.warn('[Auth] No Firestore user doc for uid:', firebaseUser.uid, '— signing out');
            await authService.logout();
            Alert.alert(
              'Account Incomplete',
              'Your account registration was not completed. Please register again.',
            );
            setUser(null);
          }
        } catch (err) {
          console.error('[Auth] Error fetching user/club from Firestore:', err);
          if (!authService.isRegistering()) {
            await authService.logout();
            Alert.alert(
              'Sign-in Error',
              'Failed to load your account. Please try again.',
            );
          }
          setUser(null);
        }
      } else {
        console.log('[Auth] No Firebase user — signed out');
        setUser(null);
      }
    });

    return unsubscribe;
  }, [setUser, setClub, setLoading]);

  const { isLoading, isAuthenticated } = useAuthStore();
  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
