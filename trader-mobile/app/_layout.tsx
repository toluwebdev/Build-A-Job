import React, { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import { Colors } from "../src/constants";
import { AppProvider, useApp } from "../src/context/AppContext";
import { PrototypeProvider } from "../src/context/PrototypeContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 2 },
  },
});

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { isReady, user } = useApp();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null,
  );

  /** Re-read when routes change — welcome/onboarding sets AsyncStorage; state must sync or guards bounce back. */
  useEffect(() => {
    void (async () => {
      const seen = await AsyncStorage.getItem("hasSeenOnboarding");
      setHasSeenOnboarding(seen === "true");
    })();
  }, [segments]);

  useEffect(() => {
    if (!isReady || hasSeenOnboarding === null) return;

    const group = segments[0];

    if (!hasSeenOnboarding && group !== "(welcome)") {
      router.replace("/(welcome)");
      return;
    }

    /** Verified: skip login/welcome only — allow (onboarding) so traders can finish setup & subscription */
    if (user && user.emailVerified === true) {
      if (group === "(auth)" || group === "(welcome)") {
        router.replace("/(app)/(tabs)/leads");
      }
      return;
    }

    /** Unverified: block main app until email verified; allow auth + full onboarding flow */
    if (hasSeenOnboarding && user && user.emailVerified !== true) {
      if (group === "(app)") {
        router.replace({
          pathname: "/(auth)/verify-email",
          params: { email: user.email },
        });
        return;
      }

      const inAuth = group === "(auth)";
      const authRouteRaw = segments.at(1);
      const authRoute =
        typeof authRouteRaw === "string" ? authRouteRaw : "";
      const allowedAuth = [
        "verify-email",
        "login",
        "register",
        "forgot-password",
      ];
      const allowedAuthRoute =
        inAuth &&
        authRoute.length > 0 &&
        allowedAuth.includes(authRoute);
      const onOnboarding = group === "(onboarding)";

      if (!allowedAuthRoute && !onOnboarding) {
        router.replace({
          pathname: "/(auth)/verify-email",
          params: { email: user.email },
        });
      }
    }
  }, [isReady, hasSeenOnboarding, segments, router, user]);

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
      <Stack.Screen name="index" options={{ animation: "none" }} />
      <Stack.Screen name="(welcome)" options={{ animation: "none" }} />
      <Stack.Screen name="(auth)" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="(onboarding)" options={{ animation: "fade" }} />
      <Stack.Screen name="(app)" options={{ animation: "fade" }} />
      <Stack.Screen name="job" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="quote" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="thread" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <PrototypeProvider>
            <SafeAreaProvider>
              <StatusBar style="light" />
              <RootLayoutNav />
            </SafeAreaProvider>
          </PrototypeProvider>
        </AppProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
