import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Apple, Globe, Lock, Mail } from "lucide-react-native";

import { Colors, Spacing, Typography } from "../../src/constants";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";

export default function TraderLoginScreen() {
  const [email, setEmail] = useState("trader@example.com");
  const [password, setPassword] = useState("password123");

  const onSubmit = async () => {
    // Prototype behavior: signing in takes you straight to leads.
    router.replace("/(app)/(tabs)/leads");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Trader Portal</Text>
            <Text style={styles.subtitle}>
              Sign in to manage leads, quotes and reputation.
            </Text>
          </View>

          <View style={styles.form}>
            <Button
              title="Continue with Google"
              onPress={() =>
                Alert.alert(
                  "Google sign-in",
                  "Prototype UI only (not wired yet).",
                )
              }
              variant="secondary"
              icon={<Globe size={18} color={Colors.text} />}
            />
            <Button
              title="Continue with Apple"
              onPress={() =>
                Alert.alert(
                  "Apple sign-in",
                  "Prototype UI only (not wired yet).",
                )
              }
              variant="secondary"
              icon={<Apple size={18} color={Colors.text} />}
            />

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              icon={<Mail size={18} color={Colors.textMuted} />}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon={<Lock size={18} color={Colors.textMuted} />}
            />

            <Button title="Continue" onPress={onSubmit} />

            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              style={styles.linkRow}
            >
              <Text style={styles.linkText}>Don’t have an account?</Text>
              <Text style={[styles.linkText, styles.linkEm]}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  header: { marginTop: Spacing.xl, gap: Spacing.sm },
  title: {
    fontSize: Typography.sizes["3xl"],
    fontFamily: "Inter-Bold",
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    fontFamily: "Inter-Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  scrollContent: { paddingBottom: 140 },
  form: { marginTop: Spacing["3xl"], gap: Spacing.lg },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontFamily: "Inter-Medium", color: Colors.textMuted },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingTop: Spacing.sm,
  },
  linkText: { fontFamily: "Inter-Medium", color: Colors.textSecondary },
  linkEm: { color: Colors.primary },
});
