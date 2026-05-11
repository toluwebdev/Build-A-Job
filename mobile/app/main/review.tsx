import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {
  X,
  Star,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Wrench,
  MessageSquare,
  Camera,
  ChevronRight,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Spacing, BorderRadius, Shadows } from '../../src/constants';

const { width } = Dimensions.get('window');

// Types
interface ReviewCategory {
  id: string;
  label: string;
  icon: typeof ThumbsUp;
  rating: number;
}

// Star rating input component
function StarRatingInput({
  rating,
  onRate,
  size = 40,
}: {
  rating: number;
  onRate: (rating: number) => void;
  size?: number;
}) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  return (
    <View style={styles.starInputContainer}>
      {[1, 2, 3, 4, 5].map((star) => {
        const scale = useSharedValue(1);
        const isFilled = star <= (hoveredStar ?? rating);

        const handlePress = () => {
          scale.value = withSequence(
            withTiming(1.3, { duration: 100 }),
            withTiming(1, { duration: 150 })
          );
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onRate(star);
        };

        const animatedStyle = useAnimatedStyle(() => ({
          transform: [{ scale: scale.value }],
        }));

        return (
          <TouchableOpacity
            key={star}
            activeOpacity={0.7}
            onPress={handlePress}
            onPressIn={() => setHoveredStar(star)}
            onPressOut={() => setHoveredStar(null)}
          >
            <Animated.View style={animatedStyle}>
              <Star
                size={size}
                color={isFilled ? '#F59E0B' : Colors.textMuted}
                fill={isFilled ? '#F59E0B' : 'transparent'}
              />
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Category rating component
function CategoryRating({
  category,
  onRate,
}: {
  category: ReviewCategory;
  onRate: (rating: number) => void;
}) {
  const Icon = category.icon;

  return (
    <View style={styles.categoryRating}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryIcon}>
          <Icon size={18} color={Colors.primary} />
        </View>
        <Text style={styles.categoryLabel}>{category.label}</Text>
      </View>
      <StarRatingInput rating={category.rating} onRate={onRate} size={28} />
    </View>
  );
}

// Photo upload placeholder
function PhotoUpload({
  photos,
  onAddPhoto,
  onRemovePhoto,
}: {
  photos: string[];
  onAddPhoto: () => void;
  onRemovePhoto: (index: number) => void;
}) {
  return (
    <View style={styles.photoSection}>
      <Text style={styles.sectionLabel}>Add Photos (Optional)</Text>
      <Text style={styles.photoSubtitle}>
        Share photos of the completed work
      </Text>

      <View style={styles.photoGrid}>
        {photos.map((_, index) => (
          <View key={index} style={styles.photoItem}>
            <LinearGradient
              colors={['#1A1A2E', '#16213E']}
              style={styles.photoPlaceholder}
            >
              <Text style={styles.photoNumber}>{index + 1}</Text>
            </LinearGradient>
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={() => onRemovePhoto(index)}
            >
              <X size={14} color={Colors.background} />
            </TouchableOpacity>
          </View>
        ))}

        {photos.length < 4 && (
          <TouchableOpacity style={styles.addPhotoButton} onPress={onAddPhoto}>
            <Camera size={24} color={Colors.primary} />
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// Success modal
function SuccessModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 12 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = withTiming(0);
      opacity.value = withTiming(0);
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
        <Text style={styles.successTitle}>Review Submitted!</Text>
        <Text style={styles.successSubtitle}>
          Thank you for sharing your experience. Your review helps others find
          great tradespeople.
        </Text>
        <TouchableOpacity style={styles.successButton} onPress={onClose}>
          <Text style={styles.successButtonText}>Done</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function ReviewScreen() {
  const { jobId, traderId } = useLocalSearchParams<{ jobId: string; traderId: string }>();

  const [overallRating, setOverallRating] = useState(0);
  const [categories, setCategories] = useState<ReviewCategory[]>([
    { id: 'quality', label: 'Quality of Work', icon: Wrench, rating: 0 },
    { id: 'communication', label: 'Communication', icon: MessageSquare, rating: 0 },
    { id: 'punctuality', label: 'Punctuality', icon: Clock, rating: 0 },
    { id: 'value', label: 'Value for Money', icon: ThumbsUp, rating: 0 },
  ]);
  const [review, setReview] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const updateCategoryRating = (categoryId: string, rating: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, rating } : c))
    );
  };

  const handleAddPhoto = () => {
    if (photos.length < 4) {
      setPhotos([...photos, `photo-${Date.now()}`]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (overallRating === 0) {
      Alert.alert('Rating Required', 'Please provide an overall rating');
      return;
    }

    if (review.trim().length < 10) {
      Alert.alert('Review Too Short', 'Please write at least 10 characters');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSuccess(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    router.push('/main/jobs');
  };

  const getRatingLabel = (rating: number): string => {
    switch (rating) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return 'Tap to rate';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() =>
            Alert.alert(
              'Discard Review?',
              'Your review will not be saved.',
              [
                { text: 'Keep Writing', style: 'cancel' },
                { text: 'Discard', style: 'destructive', onPress: () => router.back() },
              ]
            )
          }
        >
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write a Review</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Trader Info */}
        <View style={styles.traderInfo}>
          <LinearGradient
            colors={['#7B5CF6', '#00D4AA']}
            style={styles.traderAvatar}
          >
            <Text style={styles.traderAvatarText}>JS</Text>
          </LinearGradient>
          <Text style={styles.traderName}>John Smith</Text>
          <Text style={styles.traderCompany}>Premier Paving Ltd</Text>
          <Text style={styles.jobReference}>Driveway Resurfacing</Text>
        </View>

        {/* Overall Rating */}
        <View style={styles.overallRatingSection}>
          <Text style={styles.sectionTitle}>How was your experience?</Text>
          <StarRatingInput rating={overallRating} onRate={setOverallRating} />
          <Text style={styles.ratingLabel}>{getRatingLabel(overallRating)}</Text>
        </View>

        {/* Category Ratings */}
        {overallRating > 0 && (
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Rate specific aspects</Text>
            {categories.map((category) => (
              <CategoryRating
                key={category.id}
                category={category}
                onRate={(rating) => updateCategoryRating(category.id, rating)}
              />
            ))}
          </View>
        )}

        {/* Would Recommend */}
        <View style={styles.recommendSection}>
          <Text style={styles.sectionTitle}>Would you recommend them?</Text>
          <View style={styles.recommendButtons}>
            <TouchableOpacity
              style={[
                styles.recommendButton,
                wouldRecommend === true && styles.recommendButtonActive,
              ]}
              onPress={() => {
                setWouldRecommend(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <ThumbsUp
                size={24}
                color={wouldRecommend === true ? Colors.background : Colors.text}
              />
              <Text
                style={[
                  styles.recommendButtonText,
                  wouldRecommend === true && styles.recommendButtonTextActive,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.recommendButton,
                wouldRecommend === false && styles.recommendButtonNegative,
              ]}
              onPress={() => {
                setWouldRecommend(false);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <ThumbsDown
                size={24}
                color={wouldRecommend === false ? Colors.background : Colors.text}
              />
              <Text
                style={[
                  styles.recommendButtonText,
                  wouldRecommend === false && styles.recommendButtonTextActive,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Review Text */}
        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Tell us about your experience</Text>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="What went well? What could have been better?"
              placeholderTextColor={Colors.textMuted}
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={6}
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {review.length}/1000
            </Text>
          </View>
        </View>

        {/* Photos */}
        <PhotoUpload
          photos={photos}
          onAddPhoto={handleAddPhoto}
          onRemovePhoto={handleRemovePhoto}
        />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            overallRating === 0 && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={overallRating === 0}
        >
          <Text style={styles.submitButtonText}>Submit Review</Text>
          <ChevronRight size={20} color={Colors.background} />
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <SuccessModal visible={showSuccess} onClose={handleCloseSuccess} />
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },

  // Scroll Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },

  // Trader Info
  traderInfo: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  traderAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  traderAvatarText: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.background,
  },
  traderName: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  traderCompany: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  jobReference: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
    marginTop: Spacing.xs,
  },

  // Sections
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },

  // Overall Rating
  overallRatingSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  starInputContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  ratingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
    marginTop: Spacing.sm,
  },

  // Categories
  categoriesSection: {
    marginBottom: Spacing.lg,
  },
  categoryRating: {
    marginBottom: Spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },

  // Recommend
  recommendSection: {
    marginBottom: Spacing.lg,
  },
  recommendButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  recommendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recommendButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  recommendButtonNegative: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  recommendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  recommendButtonTextActive: {
    color: Colors.background,
  },

  // Review Text
  reviewSection: {
    marginBottom: Spacing.lg,
  },
  textInputContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  textInput: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
    minHeight: 120,
    lineHeight: 22,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },

  // Photos
  photoSection: {
    marginBottom: Spacing.lg,
  },
  photoSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  photoItem: {
    position: 'relative',
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.textMuted,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addPhotoText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
  },

  // Footer
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    ...Shadows.medium,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.surface,
  },
  submitButtonText: {
    fontSize: 16,
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
