import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
  withSequence,
} from 'react-native-reanimated';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  MapPin,
  PoundSterling,
  Calendar,
  Home,
  FileText,
  Info,
  Clock,
  AlertCircle,
  Save,
  Image as ImageIcon,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Spacing, BorderRadius, Shadows } from '../../src/constants';
import { useCreateJobStore, JobCategory } from '../../src/context/CreateJobContext';
import { formatDesignAnalysisForJobDescription } from '../../src/utils/designAnalysisFormat';

const { width } = Dimensions.get('window');

// Timing preferences
const timingOptions = [
  { id: 'ASAP', label: 'ASAP', icon: Clock },
  { id: 'FLEXIBLE', label: '1–3 months', icon: Calendar },
  { id: 'PLANNING', label: 'Flexible', icon: Calendar },
];

// Budget ranges
const budgetRanges = [
  { id: 'under2k', label: '< £2k', min: 0, max: 2000 },
  { id: '2to5k', label: '£2–5k', min: 2000, max: 5000 },
  { id: '5to10k', label: '£5–10k', min: 5000, max: 10000 },
  { id: '10to20k', label: '£10–20k', min: 10000, max: 20000 },
  { id: 'over20k', label: '£20k+', min: 20000, max: 100000 },
];

// Category options
const categories: { id: JobCategory; name: string; icon: typeof Home }[] = [
  { id: 'DRIVEWAY', name: 'Driveway', icon: Home },
  { id: 'GARDEN', name: 'Garden', icon: Home },
  { id: 'PATIO', name: 'Patio', icon: Home },
  { id: 'INTERIOR', name: 'Interior', icon: Home },
  { id: 'EXTENSION', name: 'Extension', icon: Home },
  { id: 'KITCHEN', name: 'Kitchen', icon: Home },
  { id: 'BATHROOM', name: 'Bathroom', icon: Home },
  { id: 'ROOFING', name: 'Roofing', icon: Home },
  { id: 'PLUMBING', name: 'Plumbing', icon: Home },
  { id: 'ELECTRICAL', name: 'Electrical', icon: Home },
  { id: 'LANDSCAPING', name: 'Landscaping', icon: Home },
  { id: 'FENCING', name: 'Fencing', icon: Home },
  { id: 'OTHER', name: 'Other', icon: Info },
];

// Progress bar component
function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: `${progress}%` },
          ]}
        />
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressText}>
          Step {currentStep} of {totalSteps}
        </Text>
        {currentStep < totalSteps && (
          <Text style={styles.autoSaveText}>
            <Save size={12} color={Colors.textMuted} /> Auto-saves
          </Text>
        )}
      </View>
    </View>
  );
}

// Category button
function CategoryButton({
  category,
  isSelected,
  onSelect,
}: {
  category: (typeof categories)[0];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);
  const Icon = category.icon;

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withTiming(1, { duration: 100 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <Animated.View
        style={[
          styles.categoryButton,
          animatedStyle,
          isSelected && styles.categoryButtonSelected,
        ]}
      >
        <View
          style={[
            styles.categoryIcon,
            isSelected && styles.categoryIconSelected,
          ]}
        >
          <Icon size={20} color={isSelected ? Colors.background : Colors.text} />
        </View>
        <Text
          style={[
            styles.categoryText,
            isSelected && styles.categoryTextSelected,
          ]}
        >
          {category.name}
        </Text>
        {isSelected && (
          <View style={styles.checkIcon}>
            <Check size={14} color={Colors.background} />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// Timing preference button
function TimingButton({
  option,
  isSelected,
  onSelect,
}: {
  option: (typeof timingOptions)[0];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);
  const Icon = option.icon;

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withTiming(1, { duration: 100 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <Animated.View
        style={[
          styles.timingButton,
          animatedStyle,
          isSelected && styles.timingButtonSelected,
        ]}
      >
        <Icon
          size={18}
          color={isSelected ? Colors.background : Colors.text}
        />
        <Text
          style={[
            styles.timingText,
            isSelected && styles.timingTextSelected,
          ]}
        >
          {option.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// Budget range button
function BudgetButton({
  range,
  isSelected,
  onSelect,
}: {
  range: (typeof budgetRanges)[0];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withTiming(1, { duration: 100 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <Animated.View
        style={[
          styles.budgetButton,
          animatedStyle,
          isSelected && styles.budgetButtonSelected,
        ]}
      >
        <Text
          style={[
            styles.budgetText,
            isSelected && styles.budgetTextSelected,
          ]}
        >
          {range.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// Quote stepper
function QuoteStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.stepperContainer}>
      <TouchableOpacity
        style={[styles.stepperButton, value <= 1 && styles.stepperButtonDisabled]}
        onPress={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
      >
        <Text style={styles.stepperButtonText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.stepperValue}>{value}</Text>
      <TouchableOpacity
        style={[styles.stepperButton, value >= 5 && styles.stepperButtonDisabled]}
        onPress={() => onChange(Math.min(5, value + 1))}
        disabled={value >= 5}
      >
        <Text style={styles.stepperButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// Form input component
function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  numberOfLines = 1,
  icon: Icon,
  keyboardType = 'default',
  maxLength,
  error,
  helper,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  icon?: typeof FileText;
  keyboardType?: 'default' | 'number-pad' | 'email-address';
  maxLength?: number;
  error?: string;
  helper?: string;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
          multiline && styles.inputWrapperMultiline,
        ]}
      >
        {Icon && (
          <View style={styles.inputIcon}>
            <Icon size={20} color={isFocused ? Colors.primary : Colors.textMuted} />
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            Icon && styles.inputWithIcon,
          ]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {maxLength && (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      )}
      {helper && !error && <Text style={styles.helperText}>{helper}</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// Success overlay
function SuccessOverlay({ visible }: { visible: boolean }) {
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
    <View style={styles.overlayContainer}>
      <Animated.View style={[styles.successCard, animatedStyle]}>
        <LinearGradient
          colors={['#00D4AA', '#10B981']}
          style={styles.successIcon}
        >
          <Check size={48} color={Colors.background} />
        </LinearGradient>
        <Text style={styles.successTitle}>Job Posted!</Text>
        <Text style={styles.successSubtitle}>
          Tradespeople will start sending quotes soon
        </Text>
      </Animated.View>
    </View>
  );
}

export default function JobFormScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    title,
    setTitle,
    description,
    setDescription,
    category,
    setCategory,
    location,
    setLocation,
    budget,
    setBudget,
    preferredStartDate,
    setPreferredStartDate,
    photos,
    selectedAIDesign,
    designAnalysis,
    reset,
  } = useCreateJobStore();

  const descriptionPrefilledRef = useRef(false);

  useEffect(() => {
    if (descriptionPrefilledRef.current) return;
    if (description.trim().length >= 20) {
      descriptionPrefilledRef.current = true;
      return;
    }
    if (!designAnalysis) return;
    const draft = formatDesignAnalysisForJobDescription(designAnalysis);
    if (draft.length >= 20) {
      setDescription(draft);
      descriptionPrefilledRef.current = true;
    }
  }, [designAnalysis, description, setDescription]);

  // Additional form state
  const [timingPreference, setTimingPreference] = useState<string>('FLEXIBLE');
  const [specialNotes, setSpecialNotes] = useState('');
  const [quoteCount, setQuoteCount] = useState(3);
  const [selectedBudgetRange, setSelectedBudgetRange] = useState<string>('');

  const totalSteps = 3;
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save draft every 10 seconds
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      saveDraft();
    }, 10000);

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [title, description, category, location, budget, timingPreference, specialNotes]);

  const saveDraft = async () => {
    if (!title && !description) return;
    
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLastSaved(new Date());
    setIsSaving(false);
  };

  // Validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!title.trim()) {
          newErrors.title = 'Please enter a job title';
        } else if (title.length < 5) {
          newErrors.title = 'Title must be at least 5 characters';
        }
        if (!description.trim()) {
          newErrors.description = 'Please describe your job';
        } else if (description.length < 20) {
          newErrors.description = 'Description must be at least 20 characters';
        } else if (description.length > 500) {
          newErrors.description = 'Description must be less than 500 characters';
        }
        break;
      case 2:
        if (!category) {
          newErrors.category = 'Please select a category';
        }
        if (!location.postcode?.trim()) {
          newErrors.postcode = 'Please enter your postcode';
        } else if (!/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(location.postcode)) {
          newErrors.postcode = 'Please enter a valid UK postcode';
        }
        if (!selectedBudgetRange) {
          newErrors.budget = 'Please select a budget range';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSuccess(true);
    
    setTimeout(() => {
      reset();
      router.push('/main/jobs');
    }, 2000);
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setPreferredStartDate(selectedDate.toISOString());
    }
  };

  const handleClose = () => {
    Alert.alert(
      'Discard Changes?',
      'Your progress will be lost if you go back now.',
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            router.back();
          },
        },
      ]
    );
  };

  const handleBudgetSelect = (rangeId: string) => {
    setSelectedBudgetRange(rangeId);
    const range = budgetRanges.find((r) => r.id === rangeId);
    if (range) {
      setBudget({ type: 'RANGE', min: range.min, max: range.max });
    }
  };

  // Render step content
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Tell us about your project</Text>
            <Text style={styles.stepSubtitle}>
              Provide details to help tradespeople understand your needs
            </Text>

            <FormInput
              label="Project Title"
              placeholder="e.g., Resurface driveway with block paving"
              value={title}
              onChangeText={setTitle}
              icon={FileText}
              maxLength={100}
              error={errors.title}
            />

            <FormInput
              label="Description"
              placeholder="Describe what you need done, including dimensions, materials preferences, access details..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              maxLength={500}
              error={errors.description}
              helper="Min 20 characters, max 500"
            />

            <FormInput
              label="Special Notes (Optional)"
              placeholder="Any specific requirements, parking restrictions, preferred times..."
              value={specialNotes}
              onChangeText={setSpecialNotes}
              multiline
              numberOfLines={3}
              maxLength={300}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Project details</Text>
            <Text style={styles.stepSubtitle}>
              Help us match you with the right tradespeople
            </Text>

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Category</Text>
              <View style={styles.categoriesGrid}>
                {categories.map((cat) => (
                  <CategoryButton
                    key={cat.id}
                    category={cat}
                    isSelected={category === cat.id}
                    onSelect={() => setCategory(cat.id)}
                  />
                ))}
              </View>
              {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
            </View>

            {/* Timing */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>When do you need this done?</Text>
              <View style={styles.timingRow}>
                {timingOptions.map((option) => (
                  <TimingButton
                    key={option.id}
                    option={option}
                    isSelected={timingPreference === option.id}
                    onSelect={() => setTimingPreference(option.id)}
                  />
                ))}
              </View>
            </View>

            {/* Budget */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>What's your budget?</Text>
              <View style={styles.budgetRow}>
                {budgetRanges.map((range) => (
                  <BudgetButton
                    key={range.id}
                    range={range}
                    isSelected={selectedBudgetRange === range.id}
                    onSelect={() => handleBudgetSelect(range.id)}
                  />
                ))}
              </View>
              {errors.budget && <Text style={styles.errorText}>{errors.budget}</Text>}
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Where is the job?</Text>
              <FormInput
                label="Postcode"
                placeholder="e.g., SW1A 1AA"
                value={location.postcode || ''}
                onChangeText={(text) => setLocation({ ...location, postcode: text.toUpperCase() })}
                icon={MapPin}
                maxLength={8}
                error={errors.postcode}
                helper="We'll show this to trades in your area"
              />
            </View>

            {/* Quote Count */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>How many quotes would you like?</Text>
              <View style={styles.quoteCountRow}>
                <QuoteStepper value={quoteCount} onChange={setQuoteCount} />
                <Text style={styles.quoteCountLabel}>quotes (max 5)</Text>
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review your job</Text>
            <Text style={styles.stepSubtitle}>
              Double-check everything before posting
            </Text>

            {/* Summary Card */}
            <View style={styles.summaryCard}>
              {/* Design thumbnail if available */}
              {selectedAIDesign && (
                <View style={styles.summaryDesign}>
                  <LinearGradient
                    colors={['#1A1A2E', '#16213E']}
                    style={styles.summaryDesignPlaceholder}
                  >
                    <ImageIcon size={24} color={Colors.textMuted} />
                  </LinearGradient>
                  <View style={styles.summaryDesignInfo}>
                    <Text style={styles.summaryDesignLabel}>Design Concept</Text>
                    <Text style={styles.summaryDesignName}>{selectedAIDesign.style}</Text>
                  </View>
                </View>
              )}

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Title</Text>
                <Text style={styles.summaryValue}>{title}</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Category</Text>
                <Text style={styles.summaryValue}>
                  {categories.find((c) => c.id === category)?.name}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Budget</Text>
                <Text style={styles.summaryValue}>
                  {budgetRanges.find((r) => r.id === selectedBudgetRange)?.label}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Location</Text>
                <Text style={styles.summaryValue}>{location.postcode}</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Timing</Text>
                <Text style={styles.summaryValue}>
                  {timingOptions.find((t) => t.id === timingPreference)?.label}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Quotes Requested</Text>
                <Text style={styles.summaryValue}>{quoteCount}</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Photos</Text>
                <Text style={styles.summaryValue}>{photos.length} attached</Text>
              </View>
            </View>

            <Text style={styles.termsText}>
              By posting this job, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Job</Text>
          <View style={styles.headerButton} />
        </View>

        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.navButton, styles.backButton]}
              onPress={handleBack}
            >
              <ChevronLeft size={20} color={Colors.text} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.nextButton,
              currentStep === 1 && styles.nextButtonFull,
            ]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === totalSteps ? 'Post Job' : 'Continue'}
            </Text>
            <ChevronRight size={20} color={Colors.background} />
          </TouchableOpacity>
        </View>

        {/* Success Overlay */}
        <SuccessOverlay visible={showSuccess} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
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

  // Progress
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    marginBottom: Spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  autoSaveText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
  },

  // Scroll Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },

  // Step Content
  stepContent: {
    gap: Spacing.lg,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },

  // Section
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },

  // Form Input
  inputContainer: {
    gap: Spacing.xs,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
  },
  inputWrapperMultiline: {
    alignItems: 'flex-start',
    paddingTop: Spacing.sm,
  },
  inputIcon: {
    paddingLeft: Spacing.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
  },
  inputWithIcon: {
    paddingLeft: Spacing.sm,
  },
  inputMultiline: {
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
    textAlign: 'right',
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
  },

  // Categories
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },
  categoryTextSelected: {
    color: Colors.background,
  },
  checkIcon: {
    marginLeft: Spacing.xs,
  },

  // Timing
  timingRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  timingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timingButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },
  timingTextSelected: {
    color: Colors.background,
  },

  // Budget
  budgetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  budgetButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  budgetButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  budgetText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },
  budgetTextSelected: {
    color: Colors.background,
  },

  // Quote Stepper
  quoteCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonDisabled: {
    backgroundColor: Colors.surface,
    opacity: 0.5,
  },
  stepperButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.background,
  },
  stepperValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  quoteCountLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  summaryDesign: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryDesignPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryDesignInfo: {
    flex: 1,
  },
  summaryDesignLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textMuted,
  },
  summaryDesignName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
  },
  termsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
  },

  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  backButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  nextButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    ...Shadows.medium,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.background,
  },

  // Success Overlay
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: width * 0.8,
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
  },
});
