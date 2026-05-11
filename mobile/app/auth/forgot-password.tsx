import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

import { Colors, Typography, Spacing, BorderRadius, Validation } from '../../src/constants';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { Button } from '../../src/components/ui/Button';
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const lottieRef = useRef<LottieView>(null);

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!Validation.EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError('');

    if (!validateEmail()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      lottieRef.current?.play();
    } catch (err) {
      setError('Something went wrong. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={styles.container}>
        <Animated.View entering={FadeIn.duration(500)} style={styles.successContainer}>
          {/* Animated Email Icon */}
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
                <CheckCircle size={32} color={Colors.success} fill={`${Colors.success}20`} />
              </Animated.View>
            </Animated.View>
          </View>

          <Animated.Text entering={FadeInUp.delay(400).duration(500)} style={styles.successTitle}>
            Check your inbox
          </Animated.Text>

          <Animated.Text entering={FadeInUp.delay(500).duration(500)} style={styles.successText}>
            We've sent a password reset link to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Animated.Text>

          <Animated.View entering={FadeInUp.delay(700).duration(500)} style={styles.successButtons}>
            <Button
              title="Back to Sign In"
              onPress={() => router.push('/auth/login')}
              style={styles.backButton}
            />

            <TouchableOpacity
              onPress={() => {
                setIsSuccess(false);
                setEmail('');
              }}
              style={styles.resendButton}
            >
              <Text style={styles.resendText}>Didn't receive it? Resend</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButtonTop}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.logo}>Build-A-Job</Text>
        </View>

        <GlassCard style={styles.card}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Mail size={20} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoFocus
            />
          </View>

          <Button
            title="Send Reset Link"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.submitButton}
          />

          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            style={styles.rememberPassword}
          >
            <Text style={styles.rememberPasswordText}>
              Remember your password? <Text style={styles.signInLink}>Sign In</Text>
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
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  backButtonTop: {
    position: 'absolute',
    top: 60,
    left: Spacing.lg,
    zIndex: 10,
    padding: Spacing.sm,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: Colors.primary,
  },
  card: {
    padding: Spacing.xl,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: Typography.sizes['2xl'],
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: `${Colors.error}20`,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.sm,
    color: Colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.base,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  submitButton: {
    marginBottom: Spacing.lg,
  },
  rememberPassword: {
    alignItems: 'center',
  },
  rememberPasswordText: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  signInLink: {
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
  },
  // Success State Styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  iconContainer: {
    marginBottom: Spacing['2xl'],
  },
  emailIconWrapper: {
    position: 'relative',
    padding: Spacing.xl,
    backgroundColor: `${Colors.primary}15`,
    borderRadius: 100,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 4,
  },
  successTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  successText: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing['2xl'],
  },
  emailHighlight: {
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
  },
  successButtons: {
    width: '100%',
    alignItems: 'center',
  },
  backButton: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  resendButton: {
    padding: Spacing.md,
  },
  resendText: {
    fontFamily: 'Inter-Medium',
    fontSize: Typography.sizes.base,
    color: Colors.primary,
  },
});
