import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

import { AppProvider, useApp } from "../src/context/AppContext";
import { CreateJobProvider } from "../src/context/CreateJobContext";
import { Colors } from "../src/constants";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 2 },
  },
});

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { isReady } = useApp();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    void (async () => {
      const seen = await AsyncStorage.getItem("hasSeenOnboarding");
      setHasSeenOnboarding(seen === "true");
    })();
  }, []);

  useEffect(() => {
    if (!isReady || hasSeenOnboarding === null) return;

    const inOnboarding = segments[0] === "(onboarding)";
    if (!hasSeenOnboarding && !inOnboarding) {
      router.replace("/(onboarding)");
    }
  }, [isReady, hasSeenOnboarding, segments, router]);

  if (!isReady || hasSeenOnboarding === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(onboarding)" options={{ animation: "none" }} />
      <Stack.Screen name="auth" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="main" options={{ animation: "fade" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <CreateJobProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar style="light" />
            <RootLayoutNav />
          </QueryClientProvider>
        </CreateJobProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
