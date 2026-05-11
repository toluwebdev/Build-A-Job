import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Check, ChevronRight, MessageCircle, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Typography, BorderRadius } from '../../../src/constants';
import { GlassCard } from '../../../src/components/ui/GlassCard';
import { PillBadge } from '../../../src/components/ui/PillBadge';
import { Button } from '../../../src/components/ui/Button';
import { mockLeads } from '../../../src/mock/data';
import type { Lead } from '../../../src/types';

function LeadCard({
  lead,
  onAccept,
  onDecline,
  onMessage,
}: {
  lead: Lead;
  onAccept: () => void;
  onDecline: () => void;
  onMessage: () => void;
}) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{lead.job.title}</Text>
          <Text style={styles.cardSub}>
            {lead.job.category} • {lead.job.region} • {lead.job.timing}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push(`/job/${lead.job.id}`)} style={styles.detailsBtn}>
          <Text style={styles.detailsText}>Brief</Text>
          <ChevronRight size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.badgeRow}>
        <PillBadge label={`Budget: ${lead.job.budgetBand}`} variant="info" />
        <PillBadge label={`Estimate: ${lead.job.estimateRange}`} variant="primary" />
      </View>

      <Text style={styles.desc} numberOfLines={3}>
        {lead.job.description}
      </Text>

      <View style={styles.actions}>
        <Button
          title="Decline"
          onPress={onDecline}
          variant="outline"
          icon={<X size={16} color={Colors.text} />}
          style={{ flex: 1 }}
        />
        <Button
          title="Message"
          onPress={onMessage}
          variant="secondary"
          icon={<MessageCircle size={16} color={Colors.text} />}
          style={{ flex: 1 }}
        />
        <Button
          title="Accept"
          onPress={onAccept}
          variant="primary"
          icon={<Check size={16} color={Colors.text} />}
          style={{ flex: 1 }}
        />
      </View>
    </GlassCard>
  );
}

export default function TraderLeadsScreen() {
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [declined, setDeclined] = useState<Record<string, boolean>>({});

  const leads = useMemo(
    () => mockLeads.filter((l) => !accepted[l.id] && !declined[l.id]),
    [accepted, declined]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Incoming leads</Text>
        <Text style={styles.subtitle}>Matches based on your services, region and availability.</Text>
      </View>

      <FlatList
        data={leads}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <LeadCard
            lead={item}
            onAccept={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setAccepted((p) => ({ ...p, [item.id]: true }));
              router.push(`/quote/${item.job.id}`);
            }}
            onDecline={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setDeclined((p) => ({ ...p, [item.id]: true }));
            }}
            onMessage={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(app)/(tabs)/messages');
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No new leads right now</Text>
            <Text style={styles.emptySub}>When jobs match your profile, they’ll appear here.</Text>
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
  list: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing['5xl'] },
  card: { padding: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cardTitle: { fontFamily: 'Inter-SemiBold', fontSize: Typography.sizes.base, color: Colors.text },
  cardSub: { fontFamily: 'Inter-Regular', fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailsText: { fontFamily: 'Inter-Medium', color: Colors.textSecondary, fontSize: 12 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: Spacing.md },
  desc: { marginTop: Spacing.md, fontFamily: 'Inter-Regular', color: Colors.textSecondary, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  empty: { padding: Spacing['4xl'], alignItems: 'center', gap: Spacing.sm },
  emptyTitle: { fontFamily: 'Inter-SemiBold', fontSize: Typography.sizes.lg, color: Colors.text },
  emptySub: { fontFamily: 'Inter-Regular', color: Colors.textSecondary, textAlign: 'center' },
});

