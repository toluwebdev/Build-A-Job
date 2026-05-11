import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  PoundSterling,
  MessageSquare,
  CheckCircle2,
  Star,
  Shield,
  Award,
  Clock,
  MoreVertical,
  Share2,
  Flag,
  X,
  TrendingDown,
  TrendingUp,
  Zap,
  ChevronDown,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Spacing, BorderRadius, Shadows } from '../../../src/constants';

const { width, height } = Dimensions.get('window');

// Types
interface Trader {
  id: string;
  name: string;
  companyName: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  premium: boolean;
  yearsInBusiness: number;
  specialties: string[];
}

interface Quote {
  id: string;
  trader: Trader;
  amount: number;
  estimatedDays: number;
  message: string;
  includesMaterials: boolean;
  warrantyMonths: number;
  createdAt: string;
  expiresAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
}

interface Job {
  id: string;
  title: string;
  description: string;
  status: 'ACTIVE' | 'QUOTES' | 'IN_PROGRESS' | 'COMPLETED';
  category: string;
  location: {
    address: string;
    city: string;
    postcode: string;
  };
  budget: {
    min: number;
    max: number;
    type: string;
  };
  preferredStartDate?: string;
  photos: string[];
  createdAt: string;
  quotes: Quote[];
}

type SortOption = 'price' | 'rating' | 'speed';

// Mock data
const mockJob: Job = {
  id: '1',
  title: 'Driveway Resurfacing with Block Paving',
  description:
    'I need my driveway resurfaced with high-quality block paving. The current surface is concrete and approximately 80 square meters. I would like a herringbone pattern in charcoal grey blocks with a contrasting border. The job includes removing the existing surface, preparing the base, and installing the new block paving with proper drainage.',
  status: 'QUOTES',
  category: 'Driveway',
  location: {
    address: '123 Main Street',
    city: 'London',
    postcode: 'SW1A 1AA',
  },
  budget: {
    min: 3000,
    max: 5000,
    type: 'RANGE',
  },
  preferredStartDate: '2024-06-01',
  photos: ['photo1', 'photo2'],
  createdAt: '2024-05-15T10:00:00Z',
  quotes: [
    {
      id: 'q1',
      trader: {
        id: 't1',
        name: 'John Smith',
        companyName: 'Premier Paving Ltd',
        rating: 4.9,
        reviewCount: 127,
        verified: true,
        premium: true,
        yearsInBusiness: 15,
        specialties: ['Driveways', 'Patios', 'Landscaping'],
      },
      amount: 4200,
      estimatedDays: 5,
      message:
        'Thank you for the detailed brief. I can complete this job to the highest standard using Marshalls Drivesett blocks. My quote includes all materials, labor, and waste removal. I offer a 10-year guarantee on all driveway installations.',
      includesMaterials: true,
      warrantyMonths: 120,
      createdAt: '2024-05-15T14:30:00Z',
      expiresAt: '2024-05-22T14:30:00Z',
      status: 'PENDING',
    },
    {
      id: 'q2',
      trader: {
        id: 't2',
        name: 'Sarah Johnson',
        companyName: 'SJ Groundworks',
        rating: 4.7,
        reviewCount: 89,
        verified: true,
        premium: false,
        yearsInBusiness: 8,
        specialties: ['Driveways', 'Foundations', 'Drainage'],
      },
      amount: 3850,
      estimatedDays: 4,
      message:
        'Hi, I can offer a competitive quote for your driveway project. I use quality materials and have extensive experience with block paving installations. Happy to discuss the details further.',
      includesMaterials: true,
      warrantyMonths: 60,
      createdAt: '2024-05-16T09:15:00Z',
      expiresAt: '2024-05-23T09:15:00Z',
      status: 'PENDING',
    },
    {
      id: 'q3',
      trader: {
        id: 't3',
        name: 'Mike Williams',
        companyName: 'MW Construction',
        rating: 4.5,
        reviewCount: 56,
        verified: false,
        premium: false,
        yearsInBusiness: 5,
        specialties: ['Driveways', 'Patios'],
      },
      amount: 3500,
      estimatedDays: 6,
      message:
        'I can do this job for £3,500 all inclusive. I have availability starting next week.',
      includesMaterials: true,
      warrantyMonths: 24,
      createdAt: '2024-05-16T16:45:00Z',
      expiresAt: '2024-05-23T16:45:00Z',
      status: 'PENDING',
    },
  ],
};

// Confetti piece component
function ConfettiPiece({
  color,
  index,
}: {
  color: string;
  index: number;
}) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  useEffect(() => {
    const randomX = (Math.random() - 0.5) * width * 0.8;
    const randomRotate = Math.random() * 720 - 360;
    const delay = index * 50;

    translateY.value = withDelay(
      delay,
      withSpring(height * 0.6, { damping: 15 })
    );
    translateX.value = withDelay(delay, withSpring(randomX));
    rotate.value = withDelay(delay, withSpring(randomRotate));
    scale.value = withDelay(delay, withSpring(1));
    opacity.value = withDelay(
      delay + 1000,
      withTiming(0, { duration: 1000 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }) as any);

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        animatedStyle,
        {
          backgroundColor: color,
          left: width / 2,
          top: height * 0.2,
        },
      ]}
    />
  );
}

// Confetti celebration
function ConfettiCelebration({ visible }: { visible: boolean }) {
  const colors = ['#7B5CF6', '#00D4AA', '#F59E0B', '#EC4899', '#3B82F6', '#10B981'];

  if (!visible) return null;

  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {[...Array(30)].map((_, i) => (
        <ConfettiPiece key={i} color={colors[i % colors.length]} index={i} />
      ))}
    </View>
  );
}

// Success modal
function SuccessModal({
  visible,
  traderName,
  amount,
  onClose,
}: {
  visible: boolean;
  traderName: string;
  amount: number;
  onClose: () => void;
}) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 12 });
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <Animated.View style={[styles.successModal, animatedStyle]}>
        <LinearGradient
          colors={['#00D4AA', '#10B981']}
          style={styles.successIcon}
        >
          <CheckCircle2 size={48} color={Colors.background} />
        </LinearGradient>
        <Text style={styles.successTitle}>Quote Accepted!</Text>
        <Text style={styles.successSubtitle}>
          You're hiring {traderName} for £{amount.toLocaleString()}
        </Text>
        <Text style={styles.successText}>
          Both parties will be notified. You can now message your tradesperson to arrange details.
        </Text>
        <TouchableOpacity style={styles.successButton} onPress={onClose}>
          <Text style={styles.successButtonText}>View My Jobs</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// Star rating component
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          color={star <= Math.round(rating) ? '#F59E0B' : Colors.textMuted}
          fill={star <= Math.round(rating) ? '#F59E0B' : 'transparent'}
        />
      ))}
    </View>
  );
}

// Sort button
function SortButton({
  label,
  icon: Icon,
  isActive,
  onPress,
}: {
  label: string;
  icon: typeof TrendingDown;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.sortButton, isActive && styles.sortButtonActive]}
      onPress={onPress}
    >
      <Icon size={16} color={isActive ? Colors.background : Colors.text} />
      <Text
        style={[
          styles.sortButtonText,
          isActive && styles.sortButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// Quote card component
function QuoteCard({
  quote,
  rank,
  onAccept,
  onMessage,
  onViewProfile,
}: {
  quote: Quote;
  rank: number;
  onAccept: () => void;
  onMessage: () => void;
  onViewProfile: () => void;
}) {
  const scale = useSharedValue(1);
  const [expanded, setExpanded] = useState(false);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.98, { duration: 50 }),
      withTiming(1, { duration: 100 })
    );
    setExpanded(!expanded);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getRankStyle = () => {
    switch (rank) {
      case 1:
        return styles.rankGold;
      case 2:
        return styles.rankSilver;
      case 3:
        return styles.rankBronze;
      default:
        return null;
    }
  };

  const getRankLabel = () => {
    switch (rank) {
      case 1:
        return 'Best Value';
      case 2:
        return 'Great Option';
      case 3:
        return 'Good Alternative';
      default:
        return null;
    }
  };

  return (
    <Animated.View style={[styles.quoteCard, animatedStyle]}>
      {/* Rank Badge */}
      {getRankStyle() && (
        <View style={[styles.rankBadge, getRankStyle()]}>
          <Text style={styles.rankText}>#{rank}</Text>
          <Text style={styles.rankLabel}>{getRankLabel()}</Text>
        </View>
      )}

      {/* Trader Header */}
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <View style={styles.traderHeader}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#7B5CF6', '#00D4AA']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {quote.trader.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </Text>
            </LinearGradient>
            {quote.trader.verified && (
              <View style={styles.verifiedBadge}>
                <Shield size={10} color={Colors.background} fill="#00D4AA" />
              </View>
            )}
          </View>

          <View style={styles.traderInfo}>
            <View style={styles.traderNameRow}>
              <Text style={styles.traderName}>{quote.trader.name}</Text>
              {quote.trader.premium && (
                <View style={styles.premiumBadge}>
                  <Award size={12} color={Colors.background} />
                  <Text style={styles.premiumText}>Pro</Text>
                </View>
              )}
            </View>
            <Text style={styles.companyName}>{quote.trader.companyName}</Text>
            <View style={styles.ratingRow}>
              <StarRating rating={quote.trader.rating} />
              <Text style={styles.ratingText}>
                {quote.trader.rating} ({quote.trader.reviewCount} reviews)
              </Text>
            </View>
          </View>

          <View style={styles.quoteAmount}>
            <Text style={styles.amountLabel}>Quote</Text>
            <Text style={styles.amountValue}>
              £{quote.amount.toLocaleString()}
            </Text>
            <Text style={styles.vatText}>inc. VAT</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Clock size={14} color={Colors.textMuted} />
            <Text style={styles.statText}>{quote.estimatedDays} days</Text>
          </View>
          <View style={styles.statItem}>
            <CheckCircle2 size={14} color={Colors.textMuted} />
            <Text style={styles.statText}>
              {quote.includesMaterials ? 'Materials incl.' : 'Labor only'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Shield size={14} color={Colors.textMuted} />
            <Text style={styles.statText}>
              {quote.warrantyMonths / 12}yr warranty
            </Text>
          </View>
        </View>

        {/* Expanded Content */}
        {expanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />

            {/* Message */}
            <Text style={styles.sectionLabel}>Message</Text>
            <Text style={styles.quoteMessage}>{quote.message}</Text>

            {/* Specialties */}
            <Text style={styles.sectionLabel}>Specialties</Text>
            <View style={styles.specialtiesContainer}>
              {quote.trader.specialties.map((specialty, index) => (
                <View key={index} style={styles.specialtyTag}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
            </View>

            {/* Expiry */}
            <View style={styles.expiryContainer}>
              <Clock size={14} color={Colors.textMuted} />
              <Text style={styles.expiryText}>
                Quote expires in{' '}
                {Math.ceil(
                  (new Date(quote.expiresAt).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )}{' '}
                days
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.quoteActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.messageButton]}
          onPress={onMessage}
        >
          <MessageSquare size={18} color={Colors.primary} />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.profileButton]}
          onPress={onViewProfile}
        >
          <Text style={styles.profileButtonText}>View Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={onAccept}
        >
          <CheckCircle2 size={18} color={Colors.background} />
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// Photo gallery component
function PhotoGallery({ photos }: { photos: string[] }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.photoGallery}
    >
      {photos.map((_, index) => (
        <View key={index} style={styles.photoThumbnail}>
          <LinearGradient
            colors={['#1A1A2E', '#16213E']}
            style={styles.photoPlaceholder}
          >
            <Text style={styles.photoIndex}>{index + 1}</Text>
          </LinearGradient>
        </View>
      ))}
    </ScrollView>
  );
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job] = useState<Job>(mockJob);
  const [showMenu, setShowMenu] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('price');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [acceptedQuote, setAcceptedQuote] = useState<Quote | null>(null);

  // Sort quotes
  const sortedQuotes = [...job.quotes].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.amount - b.amount;
      case 'rating':
        return b.trader.rating - a.trader.rating;
      case 'speed':
        return a.estimatedDays - b.estimatedDays;
      default:
        return 0;
    }
  });

  const handleAcceptQuote = (quote: Quote) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAcceptedQuote(quote);
    setShowConfetti(true);
    
    setTimeout(() => {
      setShowSuccess(true);
    }, 1500);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setShowConfetti(false);
    router.push('/main/jobs');
  };

  const handleMessage = (traderId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/main/messages');
  };

  const handleViewProfile = (traderId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to trader profile
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleReport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Confetti */}
      <ConfettiCelebration visible={showConfetti} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowMenu(!showMenu)}
        >
          <MoreVertical size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      {showMenu && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
            <Share2 size={18} color={Colors.text} />
            <Text style={styles.menuItemText}>Share Job</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
            <Flag size={18} color="#EF4444" />
            <Text style={[styles.menuItemText, { color: '#EF4444' }]}>
              Report Issue
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Job Header */}
        <View style={styles.jobHeader}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${'#F59E0B'}20` },
            ]}
          >
            <Text style={[styles.statusText, { color: '#F59E0B' }]}>
              Reviewing Quotes
            </Text>
          </View>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <View style={styles.jobMeta}>
            <View style={styles.metaItem}>
              <MapPin size={14} color={Colors.textMuted} />
              <Text style={styles.metaText}>{job.location.postcode}</Text>
            </View>
            <View style={styles.metaItem}>
              <Calendar size={14} color={Colors.textMuted} />
              <Text style={styles.metaText}>
                Posted {new Date(job.createdAt).toLocaleDateString('en-GB')}
              </Text>
            </View>
          </View>
        </View>

        {/* Photos */}
        {job.photos.length > 0 && <PhotoGallery photos={job.photos} />}

        {/* Job Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{job.description}</Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{job.category}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Budget</Text>
              <Text style={styles.detailValue}>
                £{job.budget.min.toLocaleString()} - £
                {job.budget.max.toLocaleString()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Start Date</Text>
              <Text style={styles.detailValue}>
                {job.preferredStartDate
                  ? new Date(job.preferredStartDate).toLocaleDateString('en-GB')
                  : 'Flexible'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Quotes Received</Text>
              <Text style={styles.detailValue}>{job.quotes.length}</Text>
            </View>
          </View>
        </View>

        {/* Quotes Section */}
        <View style={styles.quotesSection}>
          <View style={styles.quotesHeader}>
            <Text style={styles.sectionTitle}>Quotes</Text>
            <Text style={styles.quotesSubtitle}>
              Compare and choose the best tradesperson
            </Text>
          </View>

          {/* Sort Bar */}
          <View style={styles.sortBar}>
            <Text style={styles.sortLabel}>Sort by:</Text>
            <SortButton
              label="Lowest Price"
              icon={TrendingDown}
              isActive={sortBy === 'price'}
              onPress={() => setSortBy('price')}
            />
            <SortButton
              label="Highest Rated"
              icon={Star}
              isActive={sortBy === 'rating'}
              onPress={() => setSortBy('rating')}
            />
            <SortButton
              label="Fastest Start"
              icon={Zap}
              isActive={sortBy === 'speed'}
              onPress={() => setSortBy('speed')}
            />
          </View>

          {sortedQuotes.map((quote, index) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              rank={index + 1}
              onAccept={() => handleAcceptQuote(quote)}
              onMessage={() => handleMessage(quote.trader.id)}
              onViewProfile={() => handleViewProfile(quote.trader.id)}
            />
          ))}

          {/* Find More Trades CTA */}
          {job.quotes.length < 3 && (
            <TouchableOpacity style={styles.findMoreButton}>
              <Text style={styles.findMoreText}>Find More Trades</Text>
              <ChevronDown size={18} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Success Modal */}
      {acceptedQuote && (
        <SuccessModal
          visible={showSuccess}
          traderName={acceptedQuote.trader.name}
          amount={acceptedQuote.amount}
          onClose={handleCloseSuccess}
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

  // Confetti
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },

  // Dropdown Menu
  dropdownMenu: {
    position: 'absolute',
    top: 70,
    right: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.large,
    zIndex: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minWidth: 150,
  },
  menuItemText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },

  // Scroll Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl * 2,
  },

  // Job Header
  jobHeader: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  jobTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
  },
  jobMeta: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },

  // Photo Gallery
  photoGallery: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIndex: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.textMuted,
  },

  // Details Section
  detailsSection: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  descriptionText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },

  // Quotes Section
  quotesSection: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  quotesHeader: {
    marginBottom: Spacing.md,
  },
  quotesSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },

  // Sort Bar
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  sortLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },
  sortButtonTextActive: {
    color: Colors.background,
  },

  // Find More
  findMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    backgroundColor: `${Colors.primary}20`,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  findMoreText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },

  // Quote Card
  quoteCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rankBadge: {
    position: 'absolute',
    top: -10,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    ...Shadows.small,
  },
  rankGold: {
    backgroundColor: '#FFD700',
  },
  rankSilver: {
    backgroundColor: '#C0C0C0',
  },
  rankBronze: {
    backgroundColor: '#CD7F32',
  },
  rankText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: Colors.background,
  },
  rankLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: Colors.background,
  },

  // Trader Header
  traderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
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
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00D4AA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  traderInfo: {
    flex: 1,
  },
  traderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  traderName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  premiumText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: Colors.background,
  },
  companyName: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  quoteAmount: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: Colors.textMuted,
  },
  amountValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.primary,
  },
  vatText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },

  // Expanded Content
  expandedContent: {
    marginTop: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quoteMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  specialtyTag: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  specialtyText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  expiryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textMuted,
  },

  // Quote Actions
  quoteActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  messageButton: {
    backgroundColor: `${Colors.primary}20`,
  },
  messageButtonText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
  profileButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileButtonText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  acceptButton: {
    backgroundColor: '#10B981',
    ...Shadows.small,
  },
  acceptButtonText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: Colors.background,
  },

  // Success Modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successModal: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: width * 0.85,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  successText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  successButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    minWidth: 150,
    alignItems: 'center',
  },
  successButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.background,
  },
});
