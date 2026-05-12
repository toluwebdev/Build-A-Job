import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0A0A0F" },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen
        name="register"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="verify-email"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}
