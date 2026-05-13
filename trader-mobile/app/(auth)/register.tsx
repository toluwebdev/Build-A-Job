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
import { Apple, Building2, Globe, Lock, Mail, User } from "lucide-react-native";
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

export default function TraderRegisterScreen() {
  const { registerAccount } = useApp();
  const { setProfile } = usePrototype();

  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setSubmitError("First and last name are required.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!email.trim() || !Validation.EMAIL_REGEX.test(email.trim())) {
      setSubmitError("Please enter a valid email.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (password.length < Validation.PASSWORD_MIN_LENGTH) {
      setSubmitError(
        `Password must be at least ${Validation.PASSWORD_MIN_LENGTH} characters.`,
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerAccount({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });
      if (!result.ok) {
        setSubmitError(result.message ?? "Registration failed");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      setProfile({
        companyName: companyName.trim() || "My company",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: result.email ?? email.trim().toLowerCase(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (result.needsEmailVerification) {
        router.replace({
          pathname: "/(auth)/verify-email",
          params: {
            email: result.email ?? email.trim().toLowerCase(),
          },
        });
      } else {
        router.replace("/(app)/(tabs)/leads");
      }
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
            <Text style={styles.title}>Create trader account</Text>
            <Text style={styles.subtitle}>
              Set up your company profile and start receiving leads.
            </Text>
          </View>

          <View style={styles.form}>
            {submitError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{submitError}</Text>
              </View>
            ) : null}

            <Button
              title="Sign up with Google"
              onPress={() =>
                Alert.alert("Google sign-up", "Prototype UI only (not wired yet).")
              }
              variant="secondary"
              icon={<Globe size={18} color={Colors.text} />}
            />
            <Button
              title="Sign up with Apple"
              onPress={() =>
                Alert.alert("Apple sign-up", "Prototype UI only (not wired yet).")
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
              label="Company name"
              value={companyName}
              onChangeText={setCompanyName}
              icon={<Building2 size={18} color={Colors.textMuted} />}
            />
            <Input
              label="First name"
              value={firstName}
              onChangeText={setFirstName}
              icon={<User size={18} color={Colors.textMuted} />}
            />
            <Input
              label="Last name"
              value={lastName}
              onChangeText={setLastName}
            />
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

            <Button
              title="Continue"
              onPress={onSubmit}
              loading={isLoading}
            />

            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              style={styles.linkRow}
            >
              <Text style={styles.linkText}>Already have an account?</Text>
              <Text style={[styles.linkText, styles.linkEm]}>Sign in</Text>
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
    fontSize: Typography.sizes["2xl"],
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
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingTop: Spacing.sm,
  },
  linkText: { fontFamily: "Inter-Medium", color: Colors.textSecondary },
  linkEm: { color: Colors.primary },
});
