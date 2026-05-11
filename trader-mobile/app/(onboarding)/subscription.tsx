import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Check, Crown, Sparkles } from 'lucide-react-native';

import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { Button } from '../../src/components/ui/Button';
import { PillBadge } from '../../src/components/ui/PillBadge';
import type { TraderTier } from '../../src/types';
import { usePrototype } from '../../src/context/PrototypeContext';

type Plan = {
  id: TraderTier;
  title: string;
  price: string;
  tagline: string;
  badge?: { label: string; variant: Parameters<typeof PillBadge>[0]['variant'] };
  icon: React.ReactNode;
  features: string[];
};

export default function SubscriptionScreen() {
  const { plan, setPlan } = usePrototype();
  const [selected, setSelected] = useState<TraderTier>(plan);

  const plans: Plan[] = useMemo(
    () => [
      {
        id: 'FREE',
        title: 'Free',
        price: '£0 / month',
        tagline: 'Get started and respond to leads.',
        icon: <Check size={18} color={Colors.textSecondary} />,
        features: [
          'Basic profile',
          'Standard visibility',
          'Receive matching leads',
        ],
      },
      {
        id: 'PRO',
        title: 'Pro',
        price: '£19 / month',
        tagline: 'Boost visibility and save on leads.',
        badge: { label: 'Most Popular', variant: 'primary' },
        icon: <Sparkles size={18} color={Colors.primary} />,
        features: [
          'Higher search visibility',
          'Featured placement (limited)',
          'Discounted lead credits',
          'Priority support (MVP stub)',
        ],
      },
      {
        id: 'PREMIUM',
        title: 'Premium',
        price: '£39 / month',
        tagline: 'Maximum exposure and premium perks.',
        badge: { label: 'Best Value', variant: 'success' },
        icon: <Crown size={18} color={Colors.warning} />,
        features: [
          'Top-tier search visibility',
          'More featured placement',
          'Best lead credit discounts',
          'Top Rated fast-track (Phase 2)',
        ],
      },
    ],
    []
  );

  const subscribe = () => {
    setPlan(selected);
    Alert.alert('Subscribed', `You are now on the ${selected} plan (prototype).`, [
      { text: 'Continue', onPress: () => router.replace('/(app)/(tabs)/leads') },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={18} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Choose a plan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Subscription</Text>
        <Text style={styles.subtitle}>
          Pick the plan that matches how fast you want to grow. (Prototype UI — no payments wired yet.)
        </Text>

        <View style={{ gap: Spacing.md }}>
          {plans.map((p) => {
            const isSelected = selected === p.id;
            return (
              <TouchableOpacity key={p.id} activeOpacity={0.9} onPress={() => setSelected(p.id)}>
                <GlassCard style={[styles.planCard, isSelected && styles.planCardSelected]}>
                  <View style={styles.planHeader}>
                    <View style={styles.planIcon}>{p.icon}</View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.planTitleRow}>
                        <Text style={styles.planTitle}>{p.title}</Text>
                        {p.badge ? <PillBadge label={p.badge.label} variant={p.badge.variant} size="sm" /> : null}
                      </View>
                      <Text style={styles.planPrice}>{p.price}</Text>
                      <Text style={styles.planTagline}>{p.tagline}</Text>
                    </View>
                    <View style={[styles.radio, isSelected && styles.radioOn]}>
                      {isSelected ? <View style={styles.radioDot} /> : null}
                    </View>
                  </View>

                  <View style={styles.featureList}>
                    {p.features.map((f) => (
                      <View key={f} style={styles.featureRow}>
                        <Check size={16} color={Colors.success} />
                        <Text style={styles.featureText}>{f}</Text>
                      </View>
                    ))}
                  </View>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button title={`Subscribe to ${selected}`} onPress={subscribe} />
        <Button title="Continue without subscribing" onPress={() => router.replace('/(app)/(tabs)/leads')} variant="outline" />
      </ScrollView>
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
  container: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 140 },
  title: { fontFamily: 'Inter-Bold', fontSize: Typography.sizes['2xl'], color: Colors.text },
  subtitle: { fontFamily: 'Inter-Regular', color: Colors.textSecondary, lineHeight: 20 },

  planCard: { padding: Spacing.md, borderRadius: BorderRadius.lg, gap: Spacing.md },
  planCardSelected: { borderColor: Colors.primary, borderWidth: 1 },
  planHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  planIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  planTitle: { fontFamily: 'Inter-Bold', color: Colors.text, fontSize: Typography.sizes.lg },
  planPrice: { fontFamily: 'Inter-SemiBold', color: Colors.primary, marginTop: 2 },
  planTagline: { fontFamily: 'Inter-Regular', color: Colors.textSecondary, marginTop: 2, lineHeight: 18, fontSize: Typography.sizes.sm },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioOn: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  featureList: { gap: Spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  featureText: { flex: 1, fontFamily: 'Inter-Regular', color: Colors.textSecondary, lineHeight: 18 },
});

