import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, ChevronRight, CheckCircle2, Construction } from 'lucide-react-native';

import { Colors, Spacing, Typography, BorderRadius } from '../../../src/constants';
import { GlassCard } from '../../../src/components/ui/GlassCard';
import { PillBadge } from '../../../src/components/ui/PillBadge';
import { Button } from '../../../src/components/ui/Button';
import { mockJobs } from '../../../src/mock/data';
import type { JobBrief, JobStatus } from '../../../src/types';

function statusToBadge(status: JobStatus) {
  switch (status) {
    case 'CONFIRMED':
      return { label: 'Confirmed', variant: 'success' as const };
    case 'IN_PROGRESS':
      return { label: 'In progress', variant: 'info' as const };
    case 'COMPLETED':
      return { label: 'Completed', variant: 'default' as const };
    case 'CANCELLED':
      return { label: 'Cancelled', variant: 'error' as const };
    case 'NEGOTIATING':
      return { label: 'Negotiating', variant: 'warning' as const };
    case 'QUOTING':
      return { label: 'Quoting', variant: 'primary' as const };
    case 'NEW':
    default:
      return { label: 'New', variant: 'default' as const };
  }
}

function JobCard({
  job,
  onStart,
  onComplete,
}: {
  job: JobBrief;
  onStart: () => void;
  onComplete: () => void;
}) {
  const badge = statusToBadge(job.status);
  return (
    <GlassCard style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{job.title}</Text>
          <Text style={styles.cardSub}>
            {job.category} • {job.region}
          </Text>
        </View>
        <TouchableOpacity onPress={() => Alert.alert('Job details', 'In MVP we reuse the Job Brief screen for details.', [{ text: 'Open brief', onPress: () => {} }])} style={styles.detailsBtn}>
          <ChevronRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.badges}>
        <PillBadge label={badge.label} variant={badge.variant} />
        <PillBadge label={job.timing} variant="default" />
      </View>

      {job.status === 'CONFIRMED' ? (
        <View style={styles.actions}>
          <Button
            title="Start job"
            onPress={onStart}
            variant="primary"
            icon={<Construction size={16} color={Colors.text} />}
            style={{ flex: 1 }}
          />
        </View>
      ) : job.status === 'IN_PROGRESS' ? (
        <View style={styles.actions}>
          <Button
            title="Upload progress"
            onPress={() => Alert.alert('Progress upload', 'UI stub for uploading progress photos.')}
            variant="secondary"
            icon={<Camera size={16} color={Colors.text} />}
            style={{ flex: 1 }}
          />
          <Button
            title="Mark complete"
            onPress={onComplete}
            variant="primary"
            icon={<CheckCircle2 size={16} color={Colors.text} />}
            style={{ flex: 1 }}
          />
        </View>
      ) : null}
    </GlassCard>
  );
}

export default function TraderJobsScreen() {
  const [status, setStatus] = useState<Record<string, JobStatus>>(
    Object.fromEntries(mockJobs.map((j) => [j.id, j.status]))
  );

  const jobs = useMemo(
    () => mockJobs.map((j) => ({ ...j, status: status[j.id] ?? j.status })),
    [status]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Jobs</Text>
        <Text style={styles.subtitle}>Track confirmed work, progress and completion.</Text>
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onStart={() =>
              setStatus((p) => ({ ...p, [item.id]: 'IN_PROGRESS' }))
            }
            onComplete={() => {
              setStatus((p) => ({ ...p, [item.id]: 'COMPLETED' }));
              Alert.alert('Job completed', 'Customer will be prompted to review. (Mocked)');
            }}
          />
        )}
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
  card: { padding: Spacing.md, borderRadius: BorderRadius.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cardTitle: { fontFamily: 'Inter-SemiBold', color: Colors.text, fontSize: Typography.sizes.base },
  cardSub: { fontFamily: 'Inter-Regular', color: Colors.textSecondary, marginTop: 2, fontSize: Typography.sizes.sm },
  detailsBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: Spacing.md },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
});

