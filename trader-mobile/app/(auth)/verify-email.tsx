import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Mail, ShieldCheck } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Validation,
} from "../../src/constants";
import { GlassCard } from "../../src/components/ui/GlassCard";
import { Button } from "../../src/components/ui/Button";
import { useApp } from "../../src/context/AppContext";
import {
  getAuthErrorMessage,
  resendVerificationEmailRequest,
  verifyEmailWithOtp,
} from "../../src/services/auth.services";

const RESEND_COOLDOWN_SEC = 60;

function singleParam(v: string | string[] | undefined): string {
  if (v == null) return "";
  return Array.isArray(v) ? (v[0] ?? "") : v;
}

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const { user, refreshUser, syncSessionFromStoredToken, logoutAccount } =
    useApp();

  const paramEmail = singleParam(params.email).trim().toLowerCase();
  const resolvedEmail = paramEmail || user?.email?.trim().toLowerCase() || "";

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (user?.emailVerified) {
      router.replace("/(app)/(tabs)/leads");
    }
  }, [user?.emailVerified, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const emailInvalid =
    resolvedEmail.length > 0 && !Validation.EMAIL_REGEX.test(resolvedEmail);

  const handleVerify = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitError(null);

    if (!resolvedEmail) {
      setSubmitError("Missing email. Go back and sign in again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (emailInvalid) {
      setSubmitError("Invalid email address.");
      return;
    }
    const code = otp.trim();
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setSubmitError("Enter the 6-digit code from your email.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyEmailWithOtp({ email: resolvedEmail, otp: code });
      await syncSessionFromStoredToken();
      await refreshUser();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(app)/(tabs)/leads");
    } catch (e) {
      const msg = getAuthErrorMessage(e);
      setSubmitError(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (!resolvedEmail || emailInvalid || resendCooldown > 0) return;
    setSubmitError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await resendVerificationEmailRequest(resolvedEmail);
      setResendCooldown(RESEND_COOLDOWN_SEC);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setSubmitError(getAuthErrorMessage(e));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [resolvedEmail, emailInvalid, resendCooldown]);

  const handleUseAnotherAccount = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logoutAccount();
    router.replace("/(auth)/login");
  };

  const resendLabel = useMemo(() => {
    if (resendCooldown > 0) return `Resend code (${resendCooldown}s)`;
    return "Resend code";
  }, [resendCooldown]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>Trader Portal</Text>
          <Text style={styles.tagline}>Verify your email</Text>
        </View>

        <GlassCard style={styles.card}>
          <View style={styles.iconWrap}>
            <ShieldCheck size={40} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Check your inbox</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to your email. Enter it below to continue.
          </Text>

          {submitError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{submitError}</Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <Mail size={20} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.textMuted}
              value={resolvedEmail}
              editable={false}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.otpInput]}
              placeholder="6-digit code"
              placeholderTextColor={Colors.textMuted}
              value={otp}
              onChangeText={(t) => {
                const digits = t.replace(/\D/g, "").slice(0, 6);
                setOtp(digits);
                setSubmitError(null);
              }}
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
            />
          </View>

          <Button
            title="Verify & continue"
            onPress={handleVerify}
            loading={isSubmitting}
            style={styles.primaryBtn}
          />

          <TouchableOpacity
            onPress={handleResend}
            disabled={!resolvedEmail || emailInvalid || resendCooldown > 0}
            style={styles.linkRow}
          >
            <Text
              style={[
                styles.linkText,
                (!resolvedEmail || emailInvalid || resendCooldown > 0) &&
                  styles.linkDisabled,
              ]}
            >
              {resendLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleUseAnotherAccount}
            style={styles.secondaryLink}
          >
            <Text style={styles.secondaryLinkText}>Use another account</Text>
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    fontFamily: "Inter-Bold",
    fontSize: 32,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontFamily: "Inter-Regular",
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
  },
  card: {
    padding: Spacing.xl,
  },
  iconWrap: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: "Inter-Bold",
    fontSize: Typography.sizes["2xl"],
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter-Regular",
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: `${Colors.error}20`,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontFamily: "Inter-Regular",
    fontSize: Typography.sizes.sm,
    color: Colors.error,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: "Inter-Regular",
    fontSize: Typography.sizes.base,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  otpInput: {
    letterSpacing: 8,
    fontSize: Typography.sizes.xl,
    fontFamily: "Inter-SemiBold",
    textAlign: "center",
  },
  primaryBtn: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  linkRow: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  linkText: {
    fontFamily: "Inter-Medium",
    fontSize: Typography.sizes.base,
    color: Colors.primary,
  },
  linkDisabled: {
    color: Colors.textMuted,
  },
  secondaryLink: {
    alignItems: "center",
    marginTop: Spacing.md,
  },
  secondaryLinkText: {
    fontFamily: "Inter-Regular",
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
});
