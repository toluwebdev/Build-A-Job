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
  Animated as RNAnimated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, User, Check, Globe } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

import { Colors, Typography, Spacing, BorderRadius, Validation } from '../../src/constants';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { Button } from '../../src/components/ui/Button';
import { useApp } from '../../src/context/AppContext';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const strengths: PasswordStrength[] = [
    { score: 0, label: 'Too weak', color: Colors.error },
    { score: 1, label: 'Weak', color: '#F59E0B' },
    { score: 2, label: 'Fair', color: '#F59E0B' },
    { score: 3, label: 'Good', color: '#3B82F6' },
    { score: 4, label: 'Strong', color: Colors.success },
    { score: 5, label: 'Very strong', color: Colors.success },
  ];

  return strengths[score];
}

export default function RegisterScreen() {
  const router = useRouter();
  const { registerAccount } = useApp();
  const shakeAnimation = useRef(new RNAnimated.Value(0)).current;

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const passwordStrength = getPasswordStrength(password);

  const strengthWidth = useAnimatedStyle(() => ({
    width: withTiming(`${(passwordStrength.score / 5) * 100}%`, { duration: 300 }),
    backgroundColor: passwordStrength.color,
  }));

  const validateFields = () => {
    const errors: Record<string, string> = {};

    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';

    if (!email) {
      errors.email = 'Email is required';
    } else if (!Validation.EMAIL_REGEX.test(email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength.score < 3) {
      errors.password = 'Password is too weak';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      errors.terms = 'You must agree to the terms';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const shakeForm = () => {
    RNAnimated.sequence([
      RNAnimated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      RNAnimated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      RNAnimated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      RNAnimated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleRegister = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitError(null);

    if (!validateFields()) {
      shakeForm();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerAccount({
        firstName,
        lastName,
        email,
        password,
      });
      if (!result.ok) {
        setSubmitError(result.message ?? 'Registration failed');
        shakeForm();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/main');
    } finally {
      setIsLoading(false);
    }
  };

  const animatedStyle = {
    transform: [{ translateX: shakeAnimation }],
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>Build-A-Job</Text>
          <Text style={styles.tagline}>Create your account</Text>
        </View>

        <RNAnimated.View style={animatedStyle}>
          <GlassCard style={styles.card}>
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>Join thousands of homeowners</Text>

            {submitError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{submitError}</Text>
              </View>
            ) : null}

            {/* Name Row */}
            <View style={styles.nameRow}>
              <View style={[styles.inputContainer, styles.halfInput]}>
                <User size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="First name"
                  placeholderTextColor={Colors.textMuted}
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    setFieldErrors((prev) => ({ ...prev, firstName: '' }));
                  }}
                  autoCapitalize="words"
                />
              </View>
              <View style={[styles.inputContainer, styles.halfInput]}>
                <TextInput
                  style={styles.input}
                  placeholder="Last name"
                  placeholderTextColor={Colors.textMuted}
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    setFieldErrors((prev) => ({ ...prev, lastName: '' }));
                  }}
                  autoCapitalize="words"
                />
              </View>
            </View>
            {(fieldErrors.firstName || fieldErrors.lastName) && (
              <Text style={styles.fieldError}>
                {fieldErrors.firstName || fieldErrors.lastName}
              </Text>
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
                  setFieldErrors((prev) => ({ ...prev, email: '' }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            {fieldErrors.email && (
              <Text style={styles.fieldError}>{fieldErrors.email}</Text>
            )}

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setFieldErrors((prev) => ({ ...prev, password: '' }));
                }}
                secureTextEntry={!showPassword}
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

            {/* Password Strength Meter */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <Animated.View style={[styles.strengthFill, strengthWidth]} />
                </View>
                <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.label}
                </Text>
              </View>
            )}
            {fieldErrors.password && (
              <Text style={styles.fieldError}>{fieldErrors.password}</Text>
            )}

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                placeholderTextColor={Colors.textMuted}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                secureTextEntry={!showPassword}
              />
            </View>
            {fieldErrors.confirmPassword && (
              <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text>
            )}

            {/* Terms Checkbox */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => {
                setAgreedToTerms(!agreedToTerms);
                setFieldErrors((prev) => ({ ...prev, terms: '' }));
              }}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms && <Check size={14} color={Colors.text} />}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {fieldErrors.terms && (
              <Text style={styles.fieldError}>{fieldErrors.terms}</Text>
            )}

            {/* Sign Up Button */}
            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.registerButton}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Sign Up */}
            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <Globe size={24} color={Colors.text} />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.appleIcon}></Text>
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </RNAnimated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
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
  nameRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.base,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  eyeButton: {
    padding: Spacing.sm,
  },
  fieldError: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.sm,
    color: Colors.error,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    marginLeft: Spacing.sm,
  },
  strengthContainer: {
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  strengthBar: {
    height: 4,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontFamily: 'Inter-Medium',
    fontSize: Typography.sizes.xs,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsText: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    flex: 1,
    flexWrap: 'wrap',
  },
  termsLink: {
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
  },
  registerButton: {
    marginBottom: Spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginHorizontal: Spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socialButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  appleIcon: {
    fontSize: 20,
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontFamily: 'Inter-SemiBold',
    fontSize: Typography.sizes.base,
    color: Colors.primary,
  },
});
