import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import {
  ChevronLeft,
  MoreVertical,
  Phone,
  Image as ImageIcon,
  Send,
  Check,
  CheckCheck,
  Clock,
  FileText,
  PoundSterling,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Spacing, BorderRadius, Shadows } from '../../../src/constants';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'SENDING' | 'SENT' | 'DELIVERED' | 'READ';
  type: 'TEXT' | 'IMAGE' | 'QUOTE' | 'FILE';
  metadata?: {
    quoteAmount?: number;
    fileName?: string;
    imageUrl?: string;
  };
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    companyName?: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: string;
  };
  lastMessage: Message;
  unreadCount: number;
  jobTitle?: string;
}

const mockConversations: Conversation[] = [
  {
    id: 'c1',
    participant: {
      id: 'u1',
      name: 'Jamie Morgan',
      companyName: 'Homeowner',
      isOnline: true,
    },
    lastMessage: {
      id: 'm1',
      senderId: 'u1',
      text: 'Could you confirm your earliest start date?',
      timestamp: '2024-05-20T14:30:00Z',
      status: 'READ',
      type: 'TEXT',
    },
    unreadCount: 2,
    jobTitle: 'Driveway repair + edging',
  },
  {
    id: 'c2',
    participant: {
      id: 'u2',
      name: 'Sam Taylor',
      companyName: 'Homeowner',
      isOnline: false,
      lastSeen: '2 hours ago',
    },
    lastMessage: {
      id: 'm2',
      senderId: 'me',
      text: 'Thanks — I will send an updated quote shortly.',
      timestamp: '2024-05-19T10:15:00Z',
      status: 'READ',
      type: 'TEXT',
    },
    unreadCount: 0,
    jobTitle: 'Kitchen tap + under-sink pipe leak',
  },
  {
    id: 'c3',
    participant: {
      id: 'u3',
      name: 'Morgan Lee',
      companyName: 'Homeowner',
      isOnline: true,
    },
    lastMessage: {
      id: 'm3',
      senderId: 'u3',
      text: 'Please find attached the updated scope document.',
      timestamp: '2024-05-18T16:45:00Z',
      status: 'DELIVERED',
      type: 'FILE',
      metadata: { fileName: 'Scope_Updated.pdf' },
    },
    unreadCount: 1,
    jobTitle: 'Replace bathroom tiles + reseal shower',
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'u1',
    text: 'Hi! Thanks for replying — could you confirm availability?',
    timestamp: '2024-05-20T10:00:00Z',
    status: 'READ',
    type: 'TEXT',
  },
  {
    id: '2',
    senderId: 'me',
    text: 'Yes — I can start next week. Any access constraints?',
    timestamp: '2024-05-20T10:05:00Z',
    status: 'READ',
    type: 'TEXT',
  },
  {
    id: '3',
    senderId: 'me',
    text: 'I can also share a concept option for the finish if you want.',
    timestamp: '2024-05-20T10:06:00Z',
    status: 'READ',
    type: 'TEXT',
  },
  {
    id: '4',
    senderId: 'u1',
    text: 'That would be great. Also, does the quote include removing the old surface?',
    timestamp: '2024-05-20T10:15:00Z',
    status: 'READ',
    type: 'TEXT',
  },
  {
    id: '5',
    senderId: 'me',
    text: 'Yes. The quote includes removal, base prep, waste disposal, and a 10-year guarantee.',
    timestamp: '2024-05-20T10:20:00Z',
    status: 'READ',
    type: 'TEXT',
  },
  {
    id: '6',
    senderId: 'me',
    text: 'Updated quote attached.',
    timestamp: '2024-05-20T10:30:00Z',
    status: 'DELIVERED',
    type: 'FILE',
    metadata: { fileName: 'Quote_Updated.pdf' },
  },
  {
    id: '7',
    senderId: 'u1',
    text: 'Looks good. Earliest start date?',
    timestamp: '2024-05-20T14:30:00Z',
    status: 'READ',
    type: 'TEXT',
  },
];

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return date.toLocaleDateString('en-GB', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  }
}

function MessageStatus({ status }: { status: Message['status'] }) {
  switch (status) {
    case 'SENDING':
      return <Clock size={12} color={Colors.textMuted} />;
    case 'SENT':
      return <Check size={12} color={Colors.textMuted} />;
    case 'DELIVERED':
      return <CheckCheck size={12} color={Colors.textMuted} />;
    case 'READ':
      return <CheckCheck size={12} color={Colors.primary} />;
    default:
      return null;
  }
}

function ConversationItem({
  conversation,
  onPress,
}: {
  conversation: Conversation;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.98, { duration: 50 }),
      withTiming(1, { duration: 100 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <Animated.View style={[styles.conversationItem, animatedStyle]}>
        <View style={styles.avatarContainer}>
          <LinearGradient colors={['#7B5CF6', '#00D4AA']} style={styles.avatarGradient}>
            <Text style={styles.avatarText}>
              {conversation.participant.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </Text>
          </LinearGradient>
          {conversation.participant.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.participantName}>{conversation.participant.name}</Text>
            <Text style={styles.timestamp}>{formatTime(conversation.lastMessage.timestamp)}</Text>
          </View>

          {conversation.participant.companyName && (
            <Text style={styles.companyName}>{conversation.participant.companyName}</Text>
          )}

          {conversation.jobTitle && <Text style={styles.jobTitle}>{conversation.jobTitle}</Text>}

          <View style={styles.messagePreview}>
            {conversation.lastMessage.type === 'FILE' && (
              <FileText size={14} color={Colors.textMuted} />
            )}
            <Text
              style={[
                styles.lastMessage,
                conversation.unreadCount > 0 && styles.lastMessageUnread,
              ]}
              numberOfLines={1}
            >
              {conversation.lastMessage.type === 'FILE'
                ? conversation.lastMessage.metadata?.fileName
                : conversation.lastMessage.text}
            </Text>
          </View>
        </View>

        {conversation.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

function MessageBubble({ message, isMe }: { message: Message; isMe: boolean }) {
  return (
    <View
      style={[
        styles.messageBubble,
        isMe ? styles.myMessage : styles.theirMessage,
      ]}
    >
      {message.type === 'QUOTE' && (
        <View style={styles.quoteContainer}>
          <PoundSterling size={16} color={Colors.primary} />
          <Text style={styles.quoteAmount}>
            £{message.metadata?.quoteAmount?.toLocaleString()}
          </Text>
        </View>
      )}

      <Text
        style={[
          styles.messageText,
          isMe ? styles.myMessageText : styles.theirMessageText,
        ]}
      >
        {message.text}
      </Text>

      <View style={styles.messageFooter}>
        <Text
          style={[
            styles.messageTime,
            isMe ? styles.myMessageTime : styles.theirMessageTime,
          ]}
        >
          {formatTime(message.timestamp)}
        </Text>
        {isMe && <MessageStatus status={message.status} />}
      </View>
    </View>
  );
}

function ChatHeader({
  participant,
  onBack,
}: {
  participant: Conversation['participant'];
  onBack: () => void;
}) {
  return (
    <View style={styles.chatHeader}>
      <TouchableOpacity style={styles.headerButton} onPress={onBack}>
        <ChevronLeft size={24} color={Colors.text} />
      </TouchableOpacity>

      <View style={styles.headerInfo}>
        <LinearGradient colors={['#7B5CF6', '#00D4AA']} style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {participant.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </Text>
        </LinearGradient>

        <View style={styles.headerText}>
          <Text style={styles.headerName}>{participant.name}</Text>
          <Text style={styles.headerStatus}>
            {participant.isOnline ? 'Online' : participant.lastSeen || 'Offline'}
          </Text>
        </View>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerButton}>
          <Phone size={20} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <MoreVertical size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity style={styles.attachButton}>
        <ImageIcon size={22} color={Colors.textMuted} />
      </TouchableOpacity>

      <View style={styles.textInputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
        />
      </View>

      <TouchableOpacity
        style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!text.trim()}
      >
        <Send size={20} color={text.trim() ? Colors.background : Colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

export default function MessagesScreen() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);

  const flatListRef = useRef<FlatList>(null);

  const activeConversation = conversations.find((c) => c.id === activeChat);

  useEffect(() => {
    if (activeChat && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [activeChat, messages]);

  const handleConversationPress = (conversationId: string) => {
    setActiveChat(conversationId);
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: 'me',
      text,
      timestamp: new Date().toISOString(),
      status: 'SENDING',
      type: 'TEXT',
    };

    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'SENT' } : m))
      );
    }, 500);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMessage.id ? { ...m, status: 'DELIVERED' } : m
        )
      );
    }, 1500);
  };

  const handleBackToList = () => setActiveChat(null);

  if (activeChat && activeConversation) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ChatHeader participant={activeConversation.participant} onBack={handleBackToList} />

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <MessageBubble message={item} isMe={item.senderId === 'me'} />
            )}
          />

          <MessageInput onSend={handleSendMessage} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Messages</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.conversationsList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ConversationItem conversation={item} onPress={() => handleConversationPress(item.id)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>Start a conversation with a customer</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  keyboardView: { flex: 1 },

  listHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
  },

  conversationsList: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.xl * 2,
  },

  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarContainer: { position: 'relative' },
  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.background,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  conversationContent: { flex: 1 },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  participantName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
  },
  companyName: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    flex: 1,
  },
  lastMessageUnread: {
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: Colors.background,
  },

  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Colors.background,
  },
  headerText: { flex: 1 },
  headerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  headerStatus: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  headerActions: { flexDirection: 'row', gap: Spacing.xs },

  messagesList: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },

  messageBubble: {
    maxWidth: width * 0.8,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  quoteAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  myMessageText: { color: Colors.background },
  theirMessageText: { color: Colors.text },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  messageTime: { fontSize: 11, fontFamily: 'Inter-Regular' },
  myMessageTime: { color: 'rgba(255, 255, 255, 0.7)' },
  theirMessageTime: { color: Colors.textMuted },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 100,
  },
  textInput: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.surface,
  },

  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl * 2 },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
});

