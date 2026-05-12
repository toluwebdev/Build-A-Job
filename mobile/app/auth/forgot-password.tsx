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
import { useRouter } from "expo-router";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInUp,
} from "react-native-reanimated";

import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Validation,
} from "../../src/constants";
import { GlassCard } from "../../src/components/ui/GlassCard";
import { Button } from "../../src/components/ui/Button";
import {
  getAuthErrorMessage,
  requestPasswordReset,
  resetPasswordWithOtp,
} from "../../src/services/auth.services";

const RESEND_COOLDOWN_SEC = 60;

type Phase = "email" | "reset" | "success";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const resendLabel = useMemo(() => {
    if (resendCooldown > 0) return `Resend code (${resendCooldown}s)`;
    return "Resend code";
  }, [resendCooldown]);

  const validateEmail = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!Validation.EMAIL_REGEX.test(email.trim())) {
      setError("Please enter a valid email");
      return false;
    }
    return true;
  };

  const handleSendCode = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError("");

    if (!validateEmail()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setPhase("reset");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setResendCooldown(RESEND_COOLDOWN_SEC);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setError(getAuthErrorMessage(err));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = useCallback(async () => {
    const e = email.trim().toLowerCase();
    if (!e || !Validation.EMAIL_REGEX.test(e) || resendCooldown > 0) return;
    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await requestPasswordReset(e);
      setResendCooldown(RESEND_COOLDOWN_SEC);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setError(getAuthErrorMessage(err));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [email, resendCooldown]);

  const handleResetPassword = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError("");

    const code = otp.trim();
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (newPassword.length < Validation.PASSWORD_MIN_LENGTH) {
      setError(
        `Password must be at least ${Validation.PASSWORD_MIN_LENGTH} characters`,
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordWithOtp({
        email: email.trim(),
        otp: code,
        newPassword,
      });
      setPhase("success");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setError(getAuthErrorMessage(err));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const goBackTop = () => {
    if (phase === "reset") {
      setPhase("email");
      setError("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      return;
    }
    router.back();
  };

  if (phase === "success") {
    return (
      <View style={styles.container}>
        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.successContainer}
        >
          <View style={styles.iconContainer}>
            <Animated.View
              entering={FadeInUp.delay(200).duration(600)}
              style={styles.emailIconWrapper}
            >
              <Mail size={80} color={Colors.primary} strokeWidth={1.5} />
              <Animated.View
                entering={FadeInUp.delay(600).duration(400)}
                style={styles.checkBadge}
              >
                <CheckCircle
                  size={32}
                  color={Colors.success}
                  fill={`${Colors.success}20`}
                />
              </Animated.View>
            </Animated.View>
          </View>

          <Animated.Text
            entering={FadeInUp.delay(400).duration(500)}
            style={styles.successTitle}
          >
            Password updated
          </Animated.Text>

          <Animated.Text
            entering={FadeInUp.delay(500).duration(500)}
            style={styles.successText}
          >
            You can sign in with your new password.
          </Animated.Text>

          <Animated.View
            entering={FadeInUp.delay(700).duration(500)}
            style={styles.successButtons}
          >
            <Button
              title="Sign In"
              onPress={() => router.replace("/auth/login")}
              style={styles.backButton}
            />
          </Animated.View>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backButtonTop} onPress={goBackTop}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.logo}>Build-A-Job</Text>
        </View>

        <GlassCard style={styles.card}>
          {phase === "email" ? (
            <>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email and we&apos;ll send you a 6-digit code to reset
                your password.
              </Text>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputContainer}>
                <Mail
                  size={20}
                  color={Colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoFocus
                />
              </View>

              <Button
                title="Send reset code"
                onPress={handleSendCode}
                loading={isLoading}
                style={styles.submitButton}
              />
            </>
          ) : (
            <>
              <Text style={styles.title}>New password</Text>
              <Text style={styles.subtitle}>
                Enter the code sent to{" "}
                <Text style={styles.emailInline}>{email.trim()}</Text> and choose
                a new password.
              </Text>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="6-digit code"
                  placeholderTextColor={Colors.textMuted}
                  value={otp}
                  onChangeText={(t) => {
                    setOtp(t.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock
                  size={20}
                  color={Colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="New password"
                  placeholderTextColor={Colors.textMuted}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setError("");
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={Colors.textMuted} />
                  ) : (
                    <Eye size={20} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Lock
                  size={20}
                  color={Colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor={Colors.textMuted}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setError("");
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                />
              </View>

              <Button
                title="Update password"
                onPress={handleResetPassword}
                loading={isLoading}
                style={styles.submitButton}
              />

              <TouchableOpacity
                onPress={handleResendCode}
                disabled={resendCooldown > 0}
                style={styles.resendRow}
              >
                <Text
                  style={[
                    styles.resendLink,
                    resendCooldown > 0 && styles.resendDisabled,
                  ]}
                >
                  {resendLabel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setPhase("email");
                  setError("");
                  setOtp("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                style={styles.changeEmail}
              >
                <Text style={styles.changeEmailText}>Use a different email</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={() => router.push("/auth/login")}
            style={styles.rememberPassword}
          >
            <Text style={styles.rememberPasswordText}>
              Remember your password?{" "}
              <Text style={styles.signInLink}>Sign In</Text>
            </Text>
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
  backButtonTop: {
    position: "absolute",
    top: 60,
    left: Spacing.lg,
    zIndex: 10,
    padding: Spacing.sm,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logo: {
    fontFamily: "Inter-Bold",
    fontSize: 32,
    color: Colors.primary,
  },
  card: {
    padding: Spacing.xl,
  },
  title: {
    fontFamily: "Inter-Bold",
    fontSize: Typography.sizes["2xl"],
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: "Inter-Regular",
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  emailInline: {
    fontFamily: "Inter-Medium",
    color: Colors.primary,
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
    paddingVertical: Spacing.md,
  },
  eyeButton: {
    padding: Spacing.sm,
  },
  submitButton: {
    marginBottom: Spacing.md,
  },
  resendRow: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  resendLink: {
    fontFamily: "Inter-Medium",
    fontSize: Typography.sizes.base,
    color: Colors.primary,
  },
  resendDisabled: {
    color: Colors.textMuted,
  },
  changeEmail: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  changeEmailText: {
    fontFamily: "Inter-Regular",
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  rememberPassword: {
    alignItems: "center",
  },
  rememberPasswordText: {
    fontFamily: "Inter-Regular",
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  signInLink: {
    color: Colors.primary,
    fontFamily: "Inter-Medium",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  iconContainer: {
    marginBottom: Spacing["2xl"],
  },
  emailIconWrapper: {
    position: "relative",
    padding: Spacing.xl,
    backgroundColor: `${Colors.primary}15`,
    borderRadius: 100,
  },
  checkBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 4,
  },
  successTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 28,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  successText: {
    fontFamily: "Inter-Regular",
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Spacing["2xl"],
  },
  successButtons: {
    width: "100%",
    alignItems: "center",
  },
  backButton: {
    width: "100%",
    marginBottom: Spacing.md,
  },
});
