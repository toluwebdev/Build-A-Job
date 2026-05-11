import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Sparkles } from 'lucide-react-native';

import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { PillBadge } from '../../src/components/ui/PillBadge';
import { mockJobs } from '../../src/mock/data';

export default function TraderQuoteScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const job = useMemo(() => mockJobs.find((j) => j.id === jobId), [jobId]);

  const [amount, setAmount] = useState('850');
  const [startDate, setStartDate] = useState('2026-05-20');
  const [durationDays, setDurationDays] = useState('2');
  const [paymentTerms, setPaymentTerms] = useState('50% deposit, 50% on completion');
  const [includeAiConcept, setIncludeAiConcept] = useState(true);

  if (!job) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.title}>Job not found</Text>
        <Button title="Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const submit = () => {
    Alert.alert(
      'Quote submitted',
      'In the MVP this is mocked. Next step is negotiation via messages.',
      [
        { text: 'Go to messages', onPress: () => router.replace('/(app)/(tabs)/messages') },
        { text: 'Back to leads', onPress: () => router.replace('/(app)/(tabs)/leads') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ArrowLeft size={18} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Quote</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.sub}>
            {job.category} • {job.region}
          </Text>

          <View style={styles.badges}>
            <PillBadge label={`Budget: ${job.budgetBand}`} variant="info" />
            <PillBadge label={`Estimate: ${job.estimateRange}`} variant="primary" />
          </View>

          <GlassCard style={styles.card}>
            <Input
              label="Quote amount (£)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
            />
            <Input
              label="Proposed start date"
              value={startDate}
              onChangeText={setStartDate}
              icon={<Calendar size={18} color={Colors.textMuted} />}
            />
            <Input
              label="Estimated duration (days)"
              value={durationDays}
              onChangeText={setDurationDays}
              keyboardType="number-pad"
            />
            <Input
              label="Payment terms"
              value={paymentTerms}
              onChangeText={setPaymentTerms}
            />
          </GlassCard>

          <GlassCard style={styles.card}>
            <Text style={styles.cardTitle}>AI design concept (differentiator)</Text>
            <Text style={styles.paragraph}>
              You can include an alternative/enhanced concept with your quote. In MVP, this is a
              toggle.
            </Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                onPress={() => setIncludeAiConcept(false)}
                style={[styles.toggle, !includeAiConcept && styles.toggleOn]}
              >
                <Text style={[styles.toggleText, !includeAiConcept && styles.toggleTextOn]}>
                  No concept
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIncludeAiConcept(true)}
                style={[styles.toggle, includeAiConcept && styles.toggleOn]}
              >
                <Sparkles
                  size={16}
                  color={includeAiConcept ? Colors.background : Colors.text}
                />
                <Text style={[styles.toggleText, includeAiConcept && styles.toggleTextOn]}>
                  Include concept
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          <Button title="Submit quote" onPress={submit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.sm },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontFamily: 'Inter-SemiBold', color: Colors.text, fontSize: Typography.sizes.base },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 140 },
  title: { fontFamily: 'Inter-Bold', fontSize: Typography.sizes['2xl'], color: Colors.text },
  sub: { fontFamily: 'Inter-Regular', color: Colors.textSecondary },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { padding: Spacing.md, gap: Spacing.md, borderRadius: BorderRadius.lg },
  cardTitle: { fontFamily: 'Inter-SemiBold', color: Colors.text, fontSize: Typography.sizes.base },
  paragraph: { fontFamily: 'Inter-Regular', color: Colors.textSecondary, lineHeight: 20 },
  toggleRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  toggle: { flex: 1, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, flexDirection: 'row', gap: 8 },
  toggleOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  toggleText: { fontFamily: 'Inter-SemiBold', color: Colors.text, fontSize: Typography.sizes.sm },
  toggleTextOn: { color: Colors.background },
});

