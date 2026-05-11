import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, MapPin, PiggyBank, Sparkles } from 'lucide-react-native';

import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { Button } from '../../src/components/ui/Button';
import { PillBadge } from '../../src/components/ui/PillBadge';
import { mockJobs } from '../../src/mock/data';

export default function TraderJobBriefScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const job = useMemo(() => mockJobs.find((j) => j.id === id), [id]);

  if (!job) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.title}>Job not found</Text>
        <Button title="Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ArrowLeft size={18} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Job brief</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.sub}>{job.category} • {job.region}</Text>

        <View style={styles.badges}>
          <PillBadge label={`Timing: ${job.timing}`} variant="default" />
          <PillBadge label={`Budget: ${job.budgetBand}`} variant="info" />
          <PillBadge label={`Estimate: ${job.estimateRange}`} variant="primary" />
        </View>

        <GlassCard style={styles.card}>
          <View style={styles.row}>
            <MapPin size={16} color={Colors.textSecondary} />
            <Text style={styles.rowText}>Region: {job.region}</Text>
          </View>
          <View style={styles.row}>
            <Calendar size={16} color={Colors.textSecondary} />
            <Text style={styles.rowText}>Timing: {job.timing}</Text>
          </View>
          <View style={styles.row}>
            <PiggyBank size={16} color={Colors.textSecondary} />
            <Text style={styles.rowText}>Budget band: {job.budgetBand}</Text>
          </View>
          <View style={styles.row}>
            <Sparkles size={16} color={Colors.textSecondary} />
            <Text style={styles.rowText}>AI concept: {job.aiConceptImage ? 'Included' : 'Not selected'}</Text>
          </View>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Customer brief</Text>
          <Text style={styles.paragraph}>{job.description}</Text>
        </GlassCard>

        <View style={styles.ctaRow}>
          <Button title="Message customer" onPress={() => router.push(`/thread/${job.id}`)} variant="secondary" style={{ flex: 1 }} />
          <Button title="Proceed to quote" onPress={() => router.push(`/quote/${job.id}`)} variant="primary" style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.sm },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontFamily: 'Inter-SemiBold', color: Colors.text, fontSize: Typography.sizes.base },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing['6xl'] },
  title: { fontFamily: 'Inter-Bold', fontSize: Typography.sizes['2xl'], color: Colors.text },
  sub: { fontFamily: 'Inter-Regular', color: Colors.textSecondary },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { padding: Spacing.md, gap: Spacing.sm, borderRadius: BorderRadius.lg },
  cardTitle: { fontFamily: 'Inter-SemiBold', color: Colors.text, fontSize: Typography.sizes.base },
  paragraph: { fontFamily: 'Inter-Regular', color: Colors.textSecondary, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rowText: { fontFamily: 'Inter-Regular', color: Colors.textSecondary },
  ctaRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
});

