import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, SendHorizontal } from 'lucide-react-native';

import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { mockJobs } from '../../src/mock/data';

type ChatMessage = { id: string; from: 'customer' | 'trader'; text: string; at: string };

export default function TraderThreadScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const job = useMemo(() => mockJobs.find((j) => j.id === jobId), [jobId]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'm1', from: 'customer', text: 'Hi! Can you confirm availability?', at: new Date().toISOString() },
    { id: 'm2', from: 'trader', text: 'Yes — I can start next week. Any constraints on access?', at: new Date().toISOString() },
  ]);
  const [draft, setDraft] = useState('');

  const send = () => {
    const v = draft.trim();
    if (!v) return;
    setMessages((p) => [...p, { id: `m_${p.length + 1}`, from: 'trader', text: v, at: new Date().toISOString() }]);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ArrowLeft size={18} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.topTitle}>{job?.customerName ?? 'Customer'}</Text>
          <Text style={styles.topSub} numberOfLines={1}>
            {job?.title ?? 'Conversation'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => jobId && router.push(`/quote/${jobId}`)} style={styles.quoteCta}>
          <Text style={styles.quoteText}>Revise quote</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.bubbleWrap, item.from === 'trader' ? styles.right : styles.left]}>
            <GlassCard style={[styles.bubble, item.from === 'trader' ? styles.bubbleTrader : styles.bubbleCustomer]}>
              <Text style={styles.bubbleText}>{item.text}</Text>
            </GlassCard>
          </View>
        )}
      />

      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Message..."
          placeholderTextColor={Colors.textMuted}
          style={styles.input}
        />
        <TouchableOpacity onPress={send} style={styles.send}>
          <SendHorizontal size={18} color={Colors.background} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.sm },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontFamily: 'Inter-SemiBold', color: Colors.text, fontSize: Typography.sizes.base },
  topSub: { fontFamily: 'Inter-Regular', color: Colors.textSecondary, fontSize: Typography.sizes.sm },
  quoteCta: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: BorderRadius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  quoteText: { fontFamily: 'Inter-Medium', color: Colors.primary, fontSize: 12 },
  list: { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: Spacing.lg },
  bubbleWrap: { flexDirection: 'row' },
  left: { justifyContent: 'flex-start' },
  right: { justifyContent: 'flex-end' },
  bubble: { padding: Spacing.md, maxWidth: '85%' },
  bubbleTrader: { backgroundColor: 'rgba(123, 92, 246, 0.22)' },
  bubbleCustomer: { backgroundColor: 'rgba(28, 28, 40, 0.65)' },
  bubbleText: { fontFamily: 'Inter-Regular', color: Colors.text, lineHeight: 20 },
  composer: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  input: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.full, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter-Regular', color: Colors.text, backgroundColor: Colors.background },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});

