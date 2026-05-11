import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, BadgeCheck, MapPin, PoundSterling, Shield, Sparkles } from 'lucide-react-native';

import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { PillBadge } from '../../src/components/ui/PillBadge';

const certificationSuggestions = ['Gas Safe', 'NICEIC', 'NAPIT', 'CSCS', 'City & Guilds'];
const serviceSuggestions = ['Plumbing', 'Electrical', 'Roofing', 'Carpentry', 'Tiling', 'Painting'];

export default function TraderOnboardingScreen() {
  const [services, setServices] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [dayRate, setDayRate] = useState<string>('350');
  const [areaText, setAreaText] = useState('London (Zone 1-3)');

  const steps = useMemo(
    () => [
      {
        id: 'profile',
        icon: <BadgeCheck size={18} color={Colors.primary} />,
        title: 'Complete your profile',
        subtitle: 'Company, services, coverage, day rate and certifications.',
      },
      {
        id: 'verify',
        icon: <Shield size={18} color={Colors.success} />,
        title: 'Verification (MVP)',
        subtitle: 'Manual review + email confirmation (Phase 2 = automated).',
      },
      {
        id: 'upgrade',
        icon: <Sparkles size={18} color={Colors.warning} />,
        title: 'Optional: Pro / Premium',
        subtitle: 'Boost visibility + discounted lead credits.',
      },
    ],
    []
  );

  const toggleItem = (value: string, set: React.Dispatch<React.SetStateAction<string[]>>) => {
    set((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  };

  const addArea = () => {
    const v = areaText.trim();
    if (!v) return;
    setAreas((p) => (p.includes(v) ? p : [...p, v]));
    setAreaText('');
  };

  const continueToSubscription = async () => {
    router.push('/(onboarding)/subscription');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.backBtn}>
            <ArrowLeft size={18} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Onboarding</Text>
          <TouchableOpacity onPress={continueToSubscription} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Set up your trader profile</Text>
          <Text style={styles.subtitle}>This is what powers lead matching and your reputation later.</Text>

          <View style={{ gap: Spacing.md }}>
            {steps.map((item) => (
              <GlassCard key={item.id} style={styles.stepCard}>
                <View style={styles.stepRow}>
                  <View style={styles.stepIcon}>{item.icon}</View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepTitle}>{item.title}</Text>
                    <Text style={styles.stepSub}>{item.subtitle}</Text>
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>

          <GlassCard style={styles.block}>
            <Text style={styles.blockTitle}>Services offered</Text>
            <View style={styles.pills}>
              {serviceSuggestions.map((s) => (
                <Text
                  key={s}
                  onPress={() => toggleItem(s, setServices)}
                  style={[styles.pill, services.includes(s) && styles.pillOn]}
                >
                  {s}
                </Text>
              ))}
            </View>

            <Text style={[styles.blockTitle, { marginTop: Spacing.lg }]}>Coverage areas</Text>
            <Input
              value={areaText}
              onChangeText={setAreaText}
              placeholder="Add an area (e.g. Manchester, M1-M20)"
              icon={<MapPin size={18} color={Colors.textMuted} />}
            />
            <View style={styles.badges}>
              {areas.map((a) => (
                <PillBadge key={a} label={a} variant="primary" />
              ))}
            </View>
            <Button title="Add area" onPress={addArea} variant="secondary" />

            <Text style={[styles.blockTitle, { marginTop: Spacing.lg }]}>Day rate</Text>
            <Input
              value={dayRate}
              onChangeText={setDayRate}
              keyboardType="number-pad"
              placeholder="e.g. 350"
              icon={<PoundSterling size={18} color={Colors.textMuted} />}
            />
          </GlassCard>

          <GlassCard style={styles.block}>
            <Text style={styles.blockTitle}>Certifications</Text>
            <Text style={styles.blockSub}>Tap to add the common ones (you can edit later).</Text>
            <View style={styles.pills}>
              {certificationSuggestions.map((c) => (
                <Text
                  key={c}
                  onPress={() => toggleItem(c, setCertifications)}
                  style={[styles.pill, certifications.includes(c) && styles.pillOn]}
                >
                  {c}
                </Text>
              ))}
            </View>
          </GlassCard>

          <GlassCard style={styles.block}>
            <Text style={styles.blockTitle}>Subscription (optional)</Text>
            <Text style={styles.blockSub}>This is just UI for now (no payments wired).</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <Button title="Free" onPress={() => {}} variant="outline" style={{ flex: 1 }} />
              <Button title="Pro" onPress={() => {}} variant="secondary" style={{ flex: 1 }} />
              <Button title="Premium" onPress={() => {}} variant="primary" style={{ flex: 1 }} />
            </View>
          </GlassCard>

          <Button title="Continue to subscription" onPress={continueToSubscription} />

          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.signInLink}>
            <Text style={styles.signInText}>Back to sign in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { fontFamily: 'Inter-SemiBold', color: Colors.text, fontSize: Typography.sizes.base },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skipText: { fontFamily: 'Inter-Medium', color: Colors.textSecondary, fontSize: Typography.sizes.sm },

  container: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: 140,
  },
  title: { fontSize: Typography.sizes['2xl'], fontFamily: 'Inter-Bold', color: Colors.text },
  subtitle: { fontSize: Typography.sizes.base, fontFamily: 'Inter-Regular', color: Colors.textSecondary, marginBottom: Spacing.sm },
  stepCard: { padding: Spacing.md, borderRadius: BorderRadius.lg },
  stepRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  stepIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  stepTitle: { fontFamily: 'Inter-SemiBold', color: Colors.text, fontSize: Typography.sizes.base },
  stepSub: { fontFamily: 'Inter-Regular', color: Colors.textSecondary, marginTop: 2, lineHeight: 18, fontSize: Typography.sizes.sm },
  block: { padding: Spacing.md, gap: Spacing.sm },
  blockTitle: { fontFamily: 'Inter-SemiBold', fontSize: Typography.sizes.base, color: Colors.text },
  blockSub: { fontFamily: 'Inter-Regular', fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
    fontSize: Typography.sizes.sm,
  },
  pillOn: { borderColor: Colors.primary, color: Colors.text, backgroundColor: `${Colors.primary}20` },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6, marginBottom: 6 },
  signInLink: { paddingTop: Spacing.sm, alignItems: 'center' },
  signInText: { fontFamily: 'Inter-Medium', color: Colors.primary },
});

