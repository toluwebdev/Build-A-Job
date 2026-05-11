import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Apple, Building2, Globe, Lock, Mail, User } from 'lucide-react-native';

import { Colors, Spacing, Typography } from '../../src/constants';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';

export default function TraderRegisterScreen() {
  const [companyName, setCompanyName] = useState('Premier Trades Ltd');
  const [firstName, setFirstName] = useState('Alex');
  const [lastName, setLastName] = useState('Taylor');
  const [email, setEmail] = useState('trader@example.com');
  const [password, setPassword] = useState('password123');

  const onSubmit = async () => {
    // Prototype behavior: signing up takes you to onboarding setup.
    router.replace('/(onboarding)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create trader account</Text>
            <Text style={styles.subtitle}>Set up your company profile and start receiving leads.</Text>
          </View>

          <View style={styles.form}>
            <Button
              title="Sign up with Google"
              onPress={() => Alert.alert('Google sign-up', 'Prototype UI only (not wired yet).')}
              variant="secondary"
              icon={<Globe size={18} color={Colors.text} />}
            />
            <Button
              title="Sign up with Apple"
              onPress={() => Alert.alert('Apple sign-up', 'Prototype UI only (not wired yet).')}
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
            <Input label="Last name" value={lastName} onChangeText={setLastName} />
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

            <TouchableOpacity onPress={() => router.back()} style={styles.linkRow}>
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
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg },
  header: { marginTop: Spacing.xl, gap: Spacing.sm },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontFamily: 'Inter-Bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  scrollContent: { paddingBottom: 140 },
  form: { marginTop: Spacing['3xl'], gap: Spacing.lg },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontFamily: 'Inter-Medium', color: Colors.textMuted },
  linkRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: Spacing.sm },
  linkText: { fontFamily: 'Inter-Medium', color: Colors.textSecondary },
  linkEm: { color: Colors.primary },
});

