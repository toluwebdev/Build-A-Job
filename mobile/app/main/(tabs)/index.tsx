import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  Camera,
  ChevronRight,
  ChevronDown,
  MapPin,
  Star,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Colors, Typography, Spacing, BorderRadius } from '../../../src/constants';
import { GlassCard } from '../../../src/components/ui/GlassCard';
import { PillBadge } from '../../../src/components/ui/PillBadge';
import { useAuthStore } from '../../../src/context/AuthContext';

interface DashboardData {
  unreadNotifications?: number;
  activeJobs?: { id: string; [key: string]: unknown }[];
  featuredTrades?: { id: string; [key: string]: unknown }[];
}

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'driveway', name: 'Driveway', icon: '🚗', color: '#7B5CF6' },
  { id: 'garden', name: 'Garden', icon: '🌳', color: '#22C55E' },
  { id: 'patio', name: 'Patio', icon: '🏡', color: '#F59E0B' },
  { id: 'interior', name: 'Interior', icon: '🛋️', color: '#EC4899' },
  { id: 'extension', name: 'Extension', icon: '🏗️', color: '#3B82F6' },
  { id: 'other', name: 'Other', icon: '🔧', color: '#6B7280' },
];

const MOCK_DASHBOARD: DashboardData = {
  unreadNotifications: 0,
  activeJobs: [],
  featuredTrades: [],
};

const HOW_IT_WORKS_STEPS = [
  {
    title: 'Snap a photo',
    description: 'Take a picture of your outdoor space - driveway, garden, patio, or any area you want to transform.',
    icon: Camera,
  },
  {
    title: 'AI generates designs',
    description: 'Our AI analyzes your space and creates stunning design concepts tailored to your style and budget.',
    icon: TrendingUp,
  },
  {
    title: 'Get quotes from trades',
    description: 'Connect with verified local tradespeople and receive competitive quotes within hours.',
    icon: CheckCircle2,
  },
];

function JobStatusCard({ job }: { job: any }) {
  const statusColors: Record<string, string> = {
    DRAFT: Colors.textMuted,
    OPEN: Colors.primary,
    QUOTES_RECEIVED: Colors.warning,
    CONFIRMED: Colors.success,
    IN_PROGRESS: Colors.info,
    COMPLETED: Colors.success,
  };

  return (
    <GlassCard style={styles.jobCard}>
      <View style={styles.jobCardContent}>
        <View style={[styles.categoryIcon, { backgroundColor: `${job.categoryColor}20` }]}>
          <Text style={styles.categoryEmoji}>{job.categoryIcon}</Text>
        </View>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
          <View style={styles.jobMeta}>
            <PillBadge
              label={job.status}
              variant={job.status === 'OPEN' ? 'primary' : 'default'}
              size="sm"
            />
            <Text style={styles.jobTime}>{job.lastActivity}</Text>
          </View>
        </View>
        <ChevronRight size={20} color={Colors.textMuted} />
      </View>
    </GlassCard>
  );
}

function TradeProfileCard({ trade }: { trade: any }) {
  return (
    <GlassCard style={styles.tradeCard}>
      <Image source={{ uri: trade.avatar }} style={styles.tradeAvatar} />
      <Text style={styles.tradeName} numberOfLines={1}>{trade.name}</Text>
      <Text style={styles.tradeSpecialty} numberOfLines={1}>{trade.specialty}</Text>
      <View style={styles.tradeRating}>
        <Star size={14} color={Colors.warning} fill={Colors.warning} />
        <Text style={styles.tradeRatingText}>{trade.rating}</Text>
        <Text style={styles.tradeReviews}>({trade.reviews})</Text>
      </View>
      {trade.isTopRated && (
        <View style={styles.topRatedBadge}>
          <Text style={styles.topRatedText}>Top Rated</Text>
        </View>
      )}
      <View style={styles.distanceBadge}>
        <MapPin size={12} color={Colors.textMuted} />
        <Text style={styles.distanceText}>{trade.distance}</Text>
      </View>
    </GlassCard>
  );
}

function AnimatedHeroButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const borderProgress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const borderStyle = useAnimatedStyle(
    () =>
      ({
        borderDashOffset: interpolate(borderProgress.value, [0, 1], [0, 20]),
      }) as any
  );

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.95, { damping: 20 }),
      withSpring(1, { damping: 20 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <Animated.View style={[styles.heroCard, animatedStyle]}>
        <LinearGradient
          colors={['#7B5CF620', '#00D4AA20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.dashedBorder}>
            <View style={styles.heroContent}>
              <View style={styles.heroIconContainer}>
                <Camera size={32} color={Colors.primary} />
              </View>
              <View style={styles.heroTextContainer}>
                <Text style={styles.heroTitle}>Start a new project</Text>
                <Text style={styles.heroSubtitle}>
                  Snap a photo and get AI designs in seconds
                </Text>
              </View>
              <ChevronRight size={24} color={Colors.primary} />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [dashboardData] = useState<DashboardData>(MOCK_DASHBOARD);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 400));
    setRefreshing(false);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const toggleStep = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedStep(expandedStep === index ? null : index);
  };

  const handleCategoryPress = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/main/create',
      params: { category: categoryId },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push('/main/profile')}>
            <View style={styles.avatarContainer}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.firstName}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={24} color={Colors.text} />
          {(dashboardData?.unreadNotifications || 0) > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>
                {dashboardData?.unreadNotifications > 9 ? '9+' : dashboardData?.unreadNotifications}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Hero CTA */}
      <AnimatedHeroButton onPress={() => router.push('/main/create')} />

      {/* Active Jobs */}
      {dashboardData?.activeJobs?.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Jobs</Text>
            <TouchableOpacity onPress={() => router.push('/main/jobs')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.jobsScroll}
          >
            {dashboardData.activeJobs.map((job: any) => (
              <JobStatusCard key={job.id} job={job} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Category Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What do you need?</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category.id)}
            >
              <View style={[styles.categoryIconLarge, { backgroundColor: `${category.color}20` }]}>
                <Text style={styles.categoryEmojiLarge}>{category.icon}</Text>
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Featured Trades */}
      {dashboardData?.featuredTrades?.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Trades Near You</Text>
            <TouchableOpacity onPress={() => router.push('/trade/search')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tradesScroll}
          >
            {dashboardData.featuredTrades.map((trade: any) => (
              <TradeProfileCard key={trade.id} trade={trade} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* How It Works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How it works</Text>
        <GlassCard style={styles.howItWorksCard}>
          {HOW_IT_WORKS_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isExpanded = expandedStep === index;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.stepItem,
                  index < HOW_IT_WORKS_STEPS.length - 1 && styles.stepItemBorder,
                ]}
                onPress={() => toggleStep(index)}
              >
                <View style={styles.stepHeader}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.stepIconContainer}>
                    <Icon size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <ChevronDown
                    size={20}
                    color={Colors.textMuted}
                    style={[styles.stepChevron, isExpanded && styles.stepChevronExpanded]}
                  />
                </View>
                {isExpanded && (
                  <Text style={styles.stepDescription}>{step.description}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </GlassCard>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'Inter-Bold',
    fontSize: Typography.sizes.lg,
    color: Colors.text,
  },
  greeting: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  userName: {
    fontFamily: 'Inter-Bold',
    fontSize: Typography.sizes.lg,
    color: Colors.text,
  },
  notificationButton: {
    position: 'relative',
    padding: Spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationCount: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: Colors.text,
  },
  heroCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  heroGradient: {
    borderRadius: BorderRadius.xl,
  },
  dashedBorder: {
    margin: 2,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.xl - 2,
    padding: Spacing.lg,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  heroIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: `${Colors.primary}30`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: Typography.sizes.lg,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: Typography.sizes.lg,
    color: Colors.text,
  },
  seeAll: {
    fontFamily: 'Inter-Medium',
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
  },
  jobsScroll: {
    gap: Spacing.md,
  },
  jobCard: {
    width: 280,
    padding: Spacing.md,
  },
  jobCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 24,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: Typography.sizes.base,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  jobTime: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryCard: {
    width: (width - Spacing.lg * 2 - Spacing.md * 2) / 3,
    alignItems: 'center',
  },
  categoryIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryEmojiLarge: {
    fontSize: 36,
  },
  categoryName: {
    fontFamily: 'Inter-Medium',
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },
  tradesScroll: {
    gap: Spacing.md,
  },
  tradeCard: {
    width: 160,
    padding: Spacing.md,
    alignItems: 'center',
  },
  tradeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: Spacing.sm,
  },
  tradeName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: Typography.sizes.base,
    color: Colors.text,
    marginBottom: 2,
  },
  tradeSpecialty: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  tradeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.xs,
  },
  tradeRatingText: {
    fontFamily: 'Inter-Medium',
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },
  tradeReviews: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  topRatedBadge: {
    backgroundColor: `${Colors.warning}20`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: Spacing.xs,
  },
  topRatedText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: Colors.warning,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distanceText: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  howItWorksCard: {
    padding: Spacing.md,
  },
  stepItem: {
    paddingVertical: Spacing.md,
  },
  stepItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontFamily: 'Inter-Bold',
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },
  stepIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  stepChevron: {
    transform: [{ rotate: '0deg' }],
  },
  stepChevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  stepDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginLeft: 52,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
});
