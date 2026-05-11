import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  withSequence,
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Plus,
  ChevronRight,
  MessageSquare,
  Edit3,
  Trash2,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  XCircle,
  Briefcase,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Spacing, BorderRadius, Shadows } from '../../../src/constants';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = -80;

// Job status types
type JobStatus = 'ACTIVE' | 'QUOTES' | 'IN_PROGRESS' | 'COMPLETED';

interface Job {
  id: string;
  title: string;
  description: string;
  status: JobStatus;
  category: string;
  quoteCount: number;
  createdAt: string;
  budget: string;
  location: string;
  hasNewMessage: boolean;
}

// Mock jobs data
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Driveway Resurfacing',
    description: 'Need to resurface my driveway with block paving...',
    status: 'ACTIVE',
    category: 'Driveway',
    quoteCount: 5,
    createdAt: '2 days ago',
    budget: '£3,000 - £5,000',
    location: 'London, SW1',
    hasNewMessage: true,
  },
  {
    id: '2',
    title: 'Kitchen Renovation',
    description: 'Complete kitchen remodel including cabinets...',
    status: 'QUOTES',
    category: 'Kitchen',
    quoteCount: 3,
    createdAt: '1 week ago',
    budget: '£10,000+',
    location: 'Manchester, M1',
    hasNewMessage: false,
  },
  {
    id: '3',
    title: 'Garden Landscaping',
    description: 'Design and install new garden features...',
    status: 'IN_PROGRESS',
    category: 'Garden',
    quoteCount: 0,
    createdAt: '2 weeks ago',
    budget: '£2,000 - £4,000',
    location: 'Birmingham, B1',
    hasNewMessage: true,
  },
  {
    id: '4',
    title: 'Bathroom Refurbishment',
    description: 'Full bathroom renovation with new fixtures...',
    status: 'COMPLETED',
    category: 'Bathroom',
    quoteCount: 0,
    createdAt: '1 month ago',
    budget: '£5,000 - £7,000',
    location: 'Leeds, LS1',
    hasNewMessage: false,
  },
];

// Status config
const statusConfig: Record<
  JobStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  ACTIVE: { label: 'Active', color: '#00D4AA', icon: Briefcase },
  QUOTES: { label: 'Reviewing Quotes', color: '#F59E0B', icon: CheckCircle2 },
  IN_PROGRESS: { label: 'In Progress', color: '#3B82F6', icon: Clock },
  COMPLETED: { label: 'Completed', color: '#10B981', icon: CheckCircle2 },
};

// Tab button component
function TabButton({
  label,
  count,
  isActive,
  onPress,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
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
      <Animated.View
        style={[
          styles.tabButton,
          isActive && styles.tabButtonActive,
          animatedStyle,
        ]}
      >
        <Text
          style={[
            styles.tabButtonText,
            isActive && styles.tabButtonTextActive,
          ]}
        >
          {label}
        </Text>
        {count > 0 && (
          <View
            style={[
              styles.tabBadge,
              isActive && styles.tabBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                isActive && styles.tabBadgeTextActive,
              ]}
            >
              {count}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// Swipeable job card
function JobCard({
  job,
  onPress,
  onEdit,
  onDelete,
  onMessage,
}: {
  job: Job;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMessage: () => void;
}) {
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const status = statusConfig[job.status];
  const StatusIcon = status.icon;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -160);
      }
    })
    .onEnd((event) => {
      'worklet';
      if (event.translationX < SWIPE_THRESHOLD) {
        translateX.value = withSpring(-120);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }) as any);

  const actionsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-80, -120],
      [0, 1],
      Extrapolate.CLAMP
    ),
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.98, { duration: 50 }),
      withTiming(1, { duration: 100 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <View style={styles.cardContainer}>
      {/* Swipe Actions */}
      <Animated.View style={[styles.swipeActions, actionsStyle]}>
        <TouchableOpacity
          style={[styles.swipeAction, styles.messageAction]}
          onPress={onMessage}
        >
          <MessageSquare size={20} color={Colors.background} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeAction, styles.editAction]}
          onPress={onEdit}
        >
          <Edit3 size={20} color={Colors.background} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeAction, styles.deleteAction]}
          onPress={onDelete}
        >
          <Trash2 size={20} color={Colors.background} />
        </TouchableOpacity>
      </Animated.View>

      {/* Card */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.jobCard, cardStyle]}>
          <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${status.color}20` },
                ]}
              >
                <StatusIcon size={14} color={status.color} />
                <Text style={[styles.statusText, { color: status.color }]}>
                  {status.label}
                </Text>
              </View>
              {job.hasNewMessage && (
                <View style={styles.newMessageBadge}>
                  <Text style={styles.newMessageText}>New</Text>
                </View>
              )}
            </View>

            {/* Content */}
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.jobDescription} numberOfLines={2}>
              {job.description}
            </Text>

            {/* Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>Category</Text>
                <Text style={styles.footerValue}>{job.category}</Text>
              </View>
              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>Budget</Text>
                <Text style={styles.footerValue}>{job.budget}</Text>
              </View>
              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>
                  {job.status === 'ACTIVE' ? 'Quotes' : 'Posted'}
                </Text>
                <Text style={styles.footerValue}>
                  {job.status === 'ACTIVE'
                    ? `${job.quoteCount} received`
                    : job.createdAt}
                </Text>
              </View>
            </View>

            {/* Chevron */}
            <View style={styles.chevronContainer}>
              <ChevronRight size={20} color={Colors.textMuted} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// Empty state component
function EmptyState({ status }: { status: JobStatus | 'ALL' }) {
  const messages: Record<string, { title: string; subtitle: string }> = {
    ALL: {
      title: 'No jobs yet',
      subtitle: 'Post your first job to get quotes from local tradespeople',
    },
    ACTIVE: {
      title: 'No active jobs',
      subtitle: 'Jobs waiting for quotes will appear here',
    },
    QUOTES: {
      title: 'No quotes to review',
      subtitle: 'Jobs with quotes to review will appear here',
    },
    IN_PROGRESS: {
      title: 'No jobs in progress',
      subtitle: 'Jobs you have accepted will appear here',
    },
    COMPLETED: {
      title: 'No completed jobs',
      subtitle: 'Jobs you have marked complete will appear here',
    },
  };

  const message = messages[status] || messages.ALL;

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Briefcase size={48} color={Colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>{message.title}</Text>
      <Text style={styles.emptySubtitle}>{message.subtitle}</Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push('/main/create')}
      >
        <Plus size={18} color={Colors.background} />
        <Text style={styles.emptyButtonText}>Post a Job</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function MyJobsScreen() {
  const [activeTab, setActiveTab] = useState<JobStatus | 'ALL'>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);

  const tabs: { id: JobStatus | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All' },
    { id: 'ACTIVE', label: 'Active' },
    { id: 'QUOTES', label: 'Quotes' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'COMPLETED', label: 'Completed' },
  ];

  const filteredJobs =
    activeTab === 'ALL'
      ? jobs
      : jobs.filter((job) => job.status === activeTab);

  const getJobCount = (status: JobStatus | 'ALL') =>
    status === 'ALL'
      ? jobs.length
      : jobs.filter((job) => job.status === status).length;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleJobPress = (jobId: string) => {
    router.push(`/main/job-detail/${jobId}`);
  };

  const handleEdit = (jobId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to edit screen
  };

  const handleDelete = (jobId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setJobs(jobs.filter((job) => job.id !== jobId));
  };

  const handleMessage = (jobId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/main/messages');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Jobs</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/main/create')}
        >
          <Plus size={24} color={Colors.background} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tabs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => (
            <TabButton
              label={item.label}
              count={getJobCount(item.id)}
              isActive={activeTab === item.id}
              onPress={() => setActiveTab(item.id)}
            />
          )}
        />
      </View>

      {/* Job List */}
      {filteredJobs.length === 0 ? (
        <EmptyState status={activeTab} />
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item }) => (
            <JobCard
              job={item}
              onPress={() => handleJobPress(item.id)}
              onEdit={() => handleEdit(item.id)}
              onDelete={() => handleDelete(item.id)}
              onMessage={() => handleMessage(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },

  // Tabs
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabsList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },
  tabButtonTextActive: {
    color: Colors.background,
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeActive: {
    backgroundColor: Colors.background,
  },
  tabBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: Colors.background,
  },
  tabBadgeTextActive: {
    color: Colors.primary,
  },

  // List
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },

  // Card Container
  cardContainer: {
    marginBottom: Spacing.md,
  },

  // Swipe Actions
  swipeActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  swipeAction: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  messageAction: {
    backgroundColor: '#3B82F6',
  },
  editAction: {
    backgroundColor: '#F59E0B',
  },
  deleteAction: {
    backgroundColor: '#EF4444',
  },

  // Job Card
  jobCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  newMessageBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  newMessageText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: Colors.background,
  },
  jobTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  jobDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerItem: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  chevronContainer: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    marginTop: -10,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    ...Shadows.medium,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.background,
  },
});
