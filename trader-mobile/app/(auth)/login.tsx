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
import * as Haptics from "expo-haptics";

import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Validation,
} from "../../src/constants";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { useApp } from "../../src/context/AppContext";
import { usePrototype } from "../../src/context/PrototypeContext";

export default function TraderLoginScreen() {
  const { loginAccount } = useApp();
  const { setProfile } = usePrototype();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitError(null);

    if (!email.trim() || !Validation.EMAIL_REGEX.test(email.trim())) {
      setSubmitError("Please enter a valid email.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!password) {
      setSubmitError("Password is required.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginAccount({
        email: email.trim(),
        password,
      });
      if (!result.ok) {
        setSubmitError(result.message ?? "Sign in failed");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      setProfile({
        email: result.email ?? email.trim(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (result.needsEmailVerification && result.email) {
        router.replace({
          pathname: "/(auth)/verify-email",
          params: { email: result.email },
        });
        return;
      }
      router.replace("/(app)/(tabs)/leads");
    } finally {
      setIsLoading(false);
    }
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
            {submitError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{submitError}</Text>
              </View>
            ) : null}

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
              onChangeText={(t) => {
                setEmail(t);
                setSubmitError(null);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              icon={<Mail size={18} color={Colors.textMuted} />}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setSubmitError(null);
              }}
              secureTextEntry
              icon={<Lock size={18} color={Colors.textMuted} />}
            />

            <TouchableOpacity
              onPress={() => router.push("/(auth)/forgot-password")}
              style={styles.forgotRow}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <Button
              title="Continue"
              onPress={onSubmit}
              loading={isLoading}
            />

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
  errorBanner: {
    backgroundColor: `${Colors.error}20`,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  errorText: {
    fontFamily: "Inter-Regular",
    fontSize: Typography.sizes.sm,
    color: Colors.error,
  },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontFamily: "Inter-Medium", color: Colors.textMuted },
  forgotRow: { alignSelf: "flex-end", marginTop: -Spacing.sm },
  forgotText: {
    fontFamily: "Inter-Medium",
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingTop: Spacing.sm,
  },
  linkText: { fontFamily: "Inter-Medium", color: Colors.textSecondary },
  linkEm: { color: Colors.primary },
});
