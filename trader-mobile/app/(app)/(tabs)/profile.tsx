import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, Star, LogOut, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';

import { Colors, Spacing, Typography, BorderRadius } from '../../../src/constants';
import { GlassCard } from '../../../src/components/ui/GlassCard';
import { PillBadge } from '../../../src/components/ui/PillBadge';
import { Button } from '../../../src/components/ui/Button';
import { mockReviews } from '../../../src/mock/data';
import type { VerificationStatus } from '../../../src/types';
import { usePrototype } from '../../../src/context/PrototypeContext';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function TraderProfileScreen() {
  const { plan, profile } = usePrototype();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('PENDING');
  const [ratingAvg] = useState(4.9);
  const [ratingCount] = useState(42);
  const [reputationScore] = useState(86);

  const reputation = useMemo(() => {
    const score = clamp(reputationScore ?? 50, 0, 100);
    const topRated = (ratingAvg ?? 0) >= 4.8 && (ratingCount ?? 0) >= 20;
    return { score, topRated };
  }, [reputationScore, ratingAvg, ratingCount]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Registration → verification → reputation in one place.</Text>
      </View>

      <FlatList
        data={mockReviews}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={{ gap: Spacing.md }}>
            <GlassCard style={styles.card}>
              <View style={styles.profileRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(profile.firstName[0] ?? 'A').toUpperCase()}
                    {(profile.lastName[0] ?? 'T').toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{profile.companyName}</Text>
                  <Text style={styles.meta}>
                    {profile.firstName} {profile.lastName} • {profile.email}
                  </Text>
                  <View style={{ marginTop: 8 }}>
                    <PillBadge label={`Plan: ${plan}`} variant={plan === 'FREE' ? 'default' : 'primary'} />
                  </View>
                </View>
              </View>

              <View style={styles.badges}>
                <PillBadge
                  label={`Verification: ${verificationStatus}`}
                  variant={verificationStatus === 'VERIFIED' ? 'success' : verificationStatus === 'REJECTED' ? 'error' : 'warning'}
                />
                <PillBadge label={`Reputation: ${reputation.score}/100`} variant="info" />
                {reputation.topRated ? <PillBadge label="Top Rated" variant="success" /> : null}
              </View>
            </GlassCard>

            <GlassCard style={styles.card}>
              <Text style={styles.cardTitle}>Plan & upgrades</Text>
              <Text style={styles.paragraph}>
                Your current plan is shown above. Upgrade anytime to get more visibility and better lead pricing.
              </Text>
              <Button
                title="View / upgrade plan"
                onPress={() => router.push('/(onboarding)/subscription')}
                variant="primary"
                icon={<Sparkles size={16} color={Colors.text} />}
              />
            </GlassCard>

            <GlassCard style={styles.card}>
              <Text style={styles.cardTitle}>Verification controls (MVP)</Text>
              <Text style={styles.paragraph}>
                Manual review is mocked here so you can see the UX states.
              </Text>
              <View style={styles.actionRow}>
                <Button title="Pending" onPress={() => setVerificationStatus('PENDING')} variant="secondary" style={{ flex: 1 }} />
                <Button
                  title="Verified"
                  onPress={() => setVerificationStatus('VERIFIED')}
                  variant="primary"
                  icon={<ShieldCheck size={16} color={Colors.text} />}
                  style={{ flex: 1 }}
                />
                <Button title="Rejected" onPress={() => setVerificationStatus('REJECTED')} variant="outline" style={{ flex: 1 }} />
              </View>
            </GlassCard>

            <Text style={styles.sectionTitle}>Reviews & reputation building</Text>
          </View>
        }
        renderItem={({ item }) => (
          <GlassCard style={styles.reviewCard}>
            <View style={styles.reviewRow}>
              <View style={styles.reviewIcon}>
                <Star size={16} color={Colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewTitle}>{item.rating}/5</Text>
                <Text style={styles.reviewText}>{item.comment}</Text>
              </View>
            </View>
          </GlassCard>
        )}
        ListFooterComponent={
          <View style={{ paddingTop: Spacing.md, gap: Spacing.sm }}>
            <TouchableOpacity
              onPress={() => Alert.alert('Portfolio', 'Portfolio + AI concepts UI is next (Phase 1).')}
              style={styles.inlineLink}
            >
              <Text style={styles.inlineLinkText}>Manage portfolio + AI concepts</Text>
            </TouchableOpacity>
            <Button
              title="Back to onboarding"
              onPress={() => router.replace('/(onboarding)')}
              variant="outline"
              icon={<LogOut size={16} color={Colors.text} />}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.xs },
  title: { fontFamily: 'Inter-Bold', fontSize: Typography.sizes['2xl'], color: Colors.text },
  subtitle: { fontFamily: 'Inter-Regular', fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  list: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing['6xl'] },
  card: { padding: Spacing.md, borderRadius: BorderRadius.lg, gap: Spacing.sm },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.primary}25`,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Inter-Bold', color: Colors.text, fontSize: 18 },
  name: { fontFamily: 'Inter-Bold', color: Colors.text, fontSize: Typography.sizes.lg },
  meta: { fontFamily: 'Inter-Regular', color: Colors.textSecondary, marginTop: 4 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  cardTitle: { fontFamily: 'Inter-SemiBold', color: Colors.text, fontSize: Typography.sizes.base },
  paragraph: { fontFamily: 'Inter-Regular', color: Colors.textSecondary, lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: 6 },
  sectionTitle: { fontFamily: 'Inter-SemiBold', color: Colors.text, fontSize: Typography.sizes.base, marginTop: 4 },
  reviewCard: { padding: Spacing.md, borderRadius: BorderRadius.lg },
  reviewRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  reviewIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: `${Colors.warning}18`, alignItems: 'center', justifyContent: 'center' },
  reviewTitle: { fontFamily: 'Inter-SemiBold', color: Colors.text, fontSize: Typography.sizes.base },
  reviewText: { fontFamily: 'Inter-Regular', color: Colors.textSecondary, marginTop: 2, lineHeight: 20 },
  inlineLink: { paddingVertical: 12, alignItems: 'center' },
  inlineLinkText: { fontFamily: 'Inter-Medium', color: Colors.primary },
});

