import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

import { AuthProvider, useAuthStore } from '../src/context/AuthContext';
import { CreateJobProvider } from '../src/context/CreateJobContext';
import { Colors } from '../src/constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 2 },
  },
});

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading, user, initialize } = useAuthStore();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    initialize();
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const seen = await AsyncStorage.getItem('hasSeenOnboarding');
    setHasSeenOnboarding(seen === 'true');
  };

  useEffect(() => {
    if (isLoading || hasSeenOnboarding === null) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === '(onboarding)';
    const inMainGroup = segments[0] === 'main';

    if (!isAuthenticated && !inAuthGroup && !inOnboarding) {
      if (!hasSeenOnboarding) {
        router.replace('/(onboarding)');
      } else {
        router.replace('/auth/login');
      }
    } else if (isAuthenticated && (inAuthGroup || inOnboarding)) {
      router.replace(user?.type === 'TRADESPERSON' ? '/main/trade' : '/main');
    }
  }, [isAuthenticated, isLoading, segments, hasSeenOnboarding]);

  if (isLoading || hasSeenOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen name="(onboarding)" options={{ animation: 'none' }} />
      <Stack.Screen name="auth" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="main" options={{ animation: 'fade' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <CreateJobProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar style="light" />
            <RootLayoutNav />
          </QueryClientProvider>
        </CreateJobProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
