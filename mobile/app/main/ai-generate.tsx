import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  ImageBackground,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
  withSequence,
  runOnJS,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Canvas, Rect, SweepGradient, vec, Circle } from '@shopify/react-native-skia';
import {
  X,
  Sparkles,
  Wand2,
  RefreshCw,
  Check,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Palette,
  Home,
  TreePine,
  Waves,
  Sun,
  Moon,
  Plus,
  Minus,
  PoundSterling,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';

import { Colors, Spacing, BorderRadius, Shadows } from '../../src/constants';
import {
  useCreateJobStore,
  type DesignAnalysisPayload,
} from '../../src/context/CreateJobContext';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { analyzeDesignConceptsFromPhoto } from '../../src/services/designConcept.services';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.55;

// Design style options (first four are used in the AI studio carousel)
const designStyles = [
  { id: 'modern', name: 'Modern Block Paving', icon: Home, color: '#7B5CF6', material: 'Porcelain · Grey · Premium' },
  { id: 'traditional', name: 'Natural Resin', icon: Palette, color: '#F59E0B', material: 'Resin · Amber · Standard' },
  { id: 'minimalist', name: 'Natural Stone', icon: Sun, color: '#00D4AA', material: 'Sandstone · Beige · Luxury' },
  { id: 'luxury', name: 'Cobblestone Classic', icon: Moon, color: '#EC4899', material: 'Granite · Charcoal · Premium' },
  { id: 'natural', name: 'Gravel Garden', icon: TreePine, color: '#10B981', material: 'Gravel · Mixed · Budget' },
  { id: 'coastal', name: 'Slate Modern', icon: Waves, color: '#3B82F6', material: 'Slate · Blue-grey · Premium' },
];

type DesignStyleRow = (typeof designStyles)[number];
type StudioDesign = DesignStyleRow & { afterImageUrl: string | null };

function parseDesignAnalysis(raw: unknown): DesignAnalysisPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  return raw as DesignAnalysisPayload;
}

// Scope adjusters
const scopeAdjusters = [
  { id: 'lighting', label: 'Lighting', cost: 800 },
  { id: 'planting', label: 'Planting', cost: 600 },
  { id: 'drainage', label: 'Drainage', cost: 1200 },
  { id: 'edging', label: 'Edging', cost: 450 },
];

// Cycling analysis messages
const analysisMessages = [
  'Analysing your space...',
  'Detecting surface area...',
  'Identifying materials...',
  'Generating design options...',
  'Finalising concepts...',
];

// Animated scanning line component using Skia
function ScanningLine({ isActive }: { isActive: boolean }) {
  const translateY = useSharedValue(-100);

  useEffect(() => {
    if (isActive) {
      translateY.value = withRepeat(
        withTiming(height + 100, { duration: 2000 }),
        -1,
        false
      );
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.scanningLineContainer, animatedStyle]}>
      <Canvas style={styles.scanningCanvas}>
        <Rect x={0} y={0} width={width} height={4}>
          <SweepGradient
            c={vec(width / 2, 2)}
            colors={['transparent', Colors.primary, '#00D4AA', 'transparent']}
          />
        </Rect>
      </Canvas>
      <View style={styles.scanningGlow} />
    </Animated.View>
  );
}

// Circular progress ring
function CircularProgress({ progress }: { progress: number }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.progressRingContainer}>
      <View style={styles.progressRingBackground} />
      <Animated.View
        style={[
          styles.progressRing,
          {
            transform: [{ rotate: '-90deg' }],
          },
        ]}
      >
        <View
          style={[
            styles.progressRingFill,
            {
              borderDasharray: `${circumference}`,
              borderDashoffset: strokeDashoffset,
            } as any,
          ]}
        />
      </Animated.View>
      <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
    </View>
  );
}

// Floating particle
function FloatingParticle({ index, isActive }: { index: number; isActive: boolean }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.6);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-30 - index * 10, { duration: 1500 + index * 200 }),
          withTiming(0, { duration: 1500 + index * 200 })
        ),
        -1,
        true
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 })
        ),
        -1,
        true
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 1000 }),
          withTiming(0.8, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [isActive, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }) as any);

  const colors = [Colors.primary, '#00D4AA', '#F59E0B', '#EC4899'];

  return (
    <Animated.View
      style={[
        styles.floatingParticle,
        animatedStyle,
        {
          backgroundColor: colors[index % colors.length],
          left: `${15 + index * 18}%`,
          bottom: `${10 + (index % 3) * 15}%`,
        },
      ]}
    />
  );
}

// AI Generating Overlay
function AIGeneratingOverlay({
  progress,
  backgroundUri,
}: {
  progress: number;
  backgroundUri: string | null;
}) {
  const [messageIndex, setMessageIndex] = useState(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % analysisMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={styles.generatingOverlay}>
      {backgroundUri ? (
        <ImageBackground
          source={{ uri: backgroundUri }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        >
          <View style={styles.generatingBackdropDim} />
        </ImageBackground>
      ) : (
        <View style={styles.blurredBackground} />
      )}
      
      {/* Scanning lines */}
      <ScanningLine isActive />
      
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <FloatingParticle key={i} index={i} isActive />
      ))}

      {/* Center content */}
      <View style={styles.generatingContent}>
        <Animated.View style={[styles.orbContainer, pulseStyle]}>
          <LinearGradient
            colors={[Colors.primary, '#00D4AA', '#7B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.orb}
          >
            <Sparkles size={40} color={Colors.background} />
          </LinearGradient>
        </Animated.View>

        <CircularProgress progress={progress} />

        <Text style={styles.analysisMessage}>{analysisMessages[messageIndex]}</Text>
        <Text style={styles.analysisSubtext}>This may take up to 30 seconds</Text>
      </View>
    </View>
  );
}

// Design concept card with morph transition
function DesignConceptCard({
  design,
  isActive,
  beforePhotoUri,
  onSwipeUp,
  onSwipeDown,
}: {
  design: StudioDesign;
  isActive: boolean;
  beforePhotoUri: string | null;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
}) {
  const [isMorphed, setIsMorphed] = useState(false);
  const translateY = useSharedValue(0);
  const morphProgress = useSharedValue(0);

  const gesture = Gesture.Pan()
    // Let the horizontal design carousel scroll: fail if user drags sideways first.
    .failOffsetX([-24, 24])
    // Only take over the gesture once vertical movement is intentional (morph swipe).
    .activeOffsetY([-14, 14])
    .onUpdate((event) => {
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationY < -50) {
        // Swipe up - morph
        translateY.value = withSpring(0);
        morphProgress.value = withTiming(1, { duration: 500 });
        runOnJS(setIsMorphed)(true);
        runOnJS(onSwipeUp)();
      } else if (event.translationY > 50) {
        // Swipe down - revert
        translateY.value = withSpring(0);
        morphProgress.value = withTiming(0, { duration: 500 });
        runOnJS(setIsMorphed)(false);
        runOnJS(onSwipeDown)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const beforeStyle = useAnimatedStyle(() => ({
    opacity: 1 - morphProgress.value,
  }));

  const afterStyle = useAnimatedStyle(() => ({
    opacity: morphProgress.value,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.conceptCard, cardStyle]}>
        {/* Before/After images */}
        <View style={styles.imageContainer}>
          {/* Before image */}
          <Animated.View style={[StyleSheet.absoluteFill, beforeStyle]}>
            {beforePhotoUri ? (
              <View style={styles.conceptImage}>
                <Image
                  source={{ uri: beforePhotoUri }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.25)']}
                  locations={[0, 0.45, 1]}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.beforeLabel}>Before</Text>
              </View>
            ) : (
              <LinearGradient
                colors={['#2A2A3E', '#1E1E32']}
                style={styles.conceptImage}
              >
                <ImageIcon size={48} color={Colors.textMuted} />
                <Text style={styles.beforeLabel}>Before</Text>
              </LinearGradient>
            )}
          </Animated.View>

          {/* After image (AI generated) */}
          <Animated.View style={[StyleSheet.absoluteFill, afterStyle]}>
            {design.afterImageUrl ? (
              <View style={styles.conceptImage}>
                <Image
                  source={{ uri: design.afterImageUrl }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.35)']}
                  locations={[0.55, 1]}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={[styles.afterLabel, { color: design.color }]}>After</Text>
              </View>
            ) : (
              <LinearGradient
                colors={[design.color + '40', design.color + '20']}
                style={styles.conceptImage}
              >
                <Wand2 size={48} color={design.color} />
                <Text style={[styles.afterLabel, { color: design.color }]}>After</Text>
              </LinearGradient>
            )}
          </Animated.View>

          {/* Swipe hint */}
          <View style={styles.swipeHint}>
            <ChevronUp size={20} color={Colors.text} />
            <Text style={styles.swipeHintText}>
              {isMorphed ? 'Swipe down to revert' : 'Swipe up to morph'}
            </Text>
          </View>
        </View>

        {/* Design info */}
        <View style={styles.conceptInfo}>
          <Text style={styles.conceptName}>{design.name}</Text>
          <View style={styles.materialTag}>
            <Text style={styles.materialText}>{design.material}</Text>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

// Bottom sheet with estimate
function EstimateBottomSheet({
  baseEstimate,
  selectedAdjusters,
  onToggleAdjuster,
  onSaveDesign,
}: {
  baseEstimate: { min: number; max: number };
  selectedAdjusters: string[];
  onToggleAdjuster: (id: string) => void;
  onSaveDesign: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sheetHeight = useSharedValue(200);

  const additionalCost = selectedAdjusters.reduce((sum, id) => {
    const adjuster = scopeAdjusters.find((a) => a.id === id);
    return sum + (adjuster?.cost || 0);
  }, 0);

  const totalMin = baseEstimate.min + additionalCost;
  const totalMax = baseEstimate.max + additionalCost;

  useEffect(() => {
    sheetHeight.value = withSpring(isExpanded ? 400 : 200);
  }, [isExpanded]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: sheetHeight.value,
  }));

  return (
    <Animated.View style={[styles.bottomSheet, animatedStyle]}>
      {/* Handle */}
      <TouchableOpacity
        style={styles.sheetHandle}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.handleBar} />
        {isExpanded ? (
          <ChevronDown size={20} color={Colors.textMuted} />
        ) : (
          <ChevronUp size={20} color={Colors.textMuted} />
        )}
      </TouchableOpacity>

      {/* Estimate range */}
      <View style={styles.estimateContainer}>
        <Text style={styles.estimateLabel}>Estimated Range</Text>
        <View style={styles.estimateBar}>
          <View style={styles.estimateFill} />
        </View>
        <Text style={styles.estimateValue}>
          £{totalMin.toLocaleString()} — £{totalMax.toLocaleString()}
        </Text>
      </View>

      {/* Scope adjusters */}
      {isExpanded && (
        <View style={styles.adjustersContainer}>
          <Text style={styles.adjustersLabel}>Add extras</Text>
          <View style={styles.adjustersList}>
            {scopeAdjusters.map((adjuster) => {
              const isSelected = selectedAdjusters.includes(adjuster.id);
              return (
                <TouchableOpacity
                  key={adjuster.id}
                  style={[
                    styles.adjusterChip,
                    isSelected && styles.adjusterChipSelected,
                  ]}
                  onPress={() => onToggleAdjuster(adjuster.id)}
                >
                  {isSelected ? (
                    <Minus size={14} color={isSelected ? Colors.background : Colors.text} />
                  ) : (
                    <Plus size={14} color={isSelected ? Colors.background : Colors.text} />
                  )}
                  <Text
                    style={[
                      styles.adjusterText,
                      isSelected && styles.adjusterTextSelected,
                    ]}
                  >
                    {adjuster.label} +£{adjuster.cost.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.sheetActions}>
        <TouchableOpacity style={styles.saveButton} onPress={onSaveDesign}>
          <Check size={18} color={Colors.background} />
          <Text style={styles.saveButtonText}>Save This Design</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// Dot indicator
function DotIndicator({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.dotContainer}>
      {[...Array(total)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );
}

export default function AIGenerateScreen() {
  const [isGenerating, setIsGenerating] = useState(true);
  const [progress, setProgress] = useState(0);
  const [generatedDesigns, setGeneratedDesigns] = useState<StudioDesign[]>(() =>
    designStyles.slice(0, 4).map((d) => ({ ...d, afterImageUrl: null })),
  );
  const [currentDesignIndex, setCurrentDesignIndex] = useState(0);
  const [selectedAdjusters, setSelectedAdjusters] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [apiDisclaimer, setApiDisclaimer] = useState<string | null>(null);
  const loadingProgressRef = useRef(true);

  const { photos, addAIDesign, selectAIDesign, setDesignAnalysis, designAnalysis } =
    useCreateJobStore();
  const beforePhotoUri = photos.length > 0 ? photos[photos.length - 1] : null;

  useEffect(() => {
    let cancelled = false;
    loadingProgressRef.current = true;
    setDesignAnalysis(null);
    setApiDisclaimer(null);
    setIsGenerating(true);
    setProgress(5);

    const tick = setInterval(() => {
      setProgress((p) =>
        loadingProgressRef.current && p < 88 ? Math.min(p + 2 + Math.random() * 4, 88) : p,
      );
    }, 450);

    (async () => {
      let completedOk = false;
      try {
        if (!beforePhotoUri) {
          Alert.alert(
            'No photo',
            'Take a photo of your space first, then open AI Design Studio again.',
          );
          if (!cancelled) router.back();
          return;
        }

        const stylesPayload = designStyles.slice(0, 4).map((d) => ({
          name: d.name,
          material: d.material,
        }));

        const data = await analyzeDesignConceptsFromPhoto({
          localPhotoUri: beforePhotoUri,
          conceptStyles: stylesPayload,
          includeAfterImages: true,
        });

        if (cancelled) return;

        if (!data.success) {
          throw new Error(typeof data.message === 'string' ? data.message : 'Analysis failed');
        }

        const merged: StudioDesign[] = designStyles.slice(0, 4).map((row, i) => {
          const byIndex = data.concepts?.[i];
          const byName = data.concepts?.find((x) => x.styleName === row.name);
          const pick =
            byIndex?.afterImageUrl != null
              ? byIndex
              : byName?.afterImageUrl != null
                ? byName
                : byIndex ?? byName;
          return { ...row, afterImageUrl: pick?.afterImageUrl ?? null };
        });

        setGeneratedDesigns(merged);
        setDesignAnalysis(parseDesignAnalysis(data.analysis));
        setApiDisclaimer(typeof data.disclaimer === 'string' ? data.disclaimer : null);
        completedOk = true;
      } catch (e: unknown) {
        if (cancelled) return;
        setDesignAnalysis(null);
        setApiDisclaimer(null);
        const status = (e as { response?: { status?: number } })?.response?.status;
        const message =
          status === 401
            ? 'Sign in to run AI design analysis on your photo.'
            : e instanceof Error
              ? e.message
              : 'Could not load AI concepts.';
        Alert.alert('AI design', message);
        setGeneratedDesigns(
          designStyles.slice(0, 4).map((d) => ({ ...d, afterImageUrl: null })),
        );
      } finally {
        if (!cancelled) {
          loadingProgressRef.current = false;
          clearInterval(tick);
          setIsGenerating(false);
          if (beforePhotoUri) {
            setProgress(100);
            if (completedOk) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } else {
            setProgress(0);
          }
        }
      }
    })();

    return () => {
      cancelled = true;
      loadingProgressRef.current = false;
      clearInterval(tick);
    };
  }, [beforePhotoUri, refreshKey, setDesignAnalysis]);

  const handleToggleAdjuster = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAdjusters((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSaveDesign = () => {
    const design = generatedDesigns[currentDesignIndex];
    const originalUri = beforePhotoUri || '';
    if (design) {
      const id = `design-${Date.now()}`;
      addAIDesign({
        id,
        originalPhotoUrl: originalUri,
        generatedDesignUrl: design.afterImageUrl || '',
        style: design.name,
        description: `${design.name} with ${design.material}`,
        createdAt: new Date().toISOString(),
      });
      selectAIDesign({
        id,
        originalPhotoUrl: originalUri,
        generatedDesignUrl: design.afterImageUrl || '',
        style: design.name,
        description: `${design.name} with ${design.material}`,
        createdAt: new Date().toISOString(),
      });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/main/job-form');
  };

  const handleSkip = () => {
    router.push('/main/job-form');
  };

  const handleClose = () => {
    router.back();
  };

  const handleRegenerate = () => {
    setGeneratedDesigns(
      designStyles.slice(0, 4).map((d) => ({ ...d, afterImageUrl: null })),
    );
    setCurrentDesignIndex(0);
    setProgress(0);
    setRefreshKey((k) => k + 1);
  };

  if (isGenerating) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" />
        <AIGeneratingOverlay progress={progress} backgroundUri={beforePhotoUri} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Design Studio</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{generatedDesigns.length} design concepts</Text>
          <TouchableOpacity
            style={styles.regenerateButton}
            onPress={handleRegenerate}
          >
            <RefreshCw size={16} color={Colors.primary} />
            <Text style={styles.regenerateText}>Regenerate</Text>
          </TouchableOpacity>
        </View>

        {designAnalysis?.summary ? (
          <GlassCard style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Sparkles size={18} color={Colors.primary} />
              <Text style={styles.insightTitle}>AI insight</Text>
            </View>
            <Text style={styles.insightSummary}>{designAnalysis.summary}</Text>
            {designAnalysis.spaceType ? (
              <Text style={styles.insightMeta}>Space: {designAnalysis.spaceType}</Text>
            ) : null}
            {Array.isArray(designAnalysis.materialsDetected) &&
            designAnalysis.materialsDetected.length > 0 ? (
              <Text style={styles.insightMeta} numberOfLines={2}>
                Materials: {designAnalysis.materialsDetected.slice(0, 6).join(', ')}
              </Text>
            ) : null}
            {apiDisclaimer ? (
              <Text style={styles.insightDisclaimer}>{apiDisclaimer}</Text>
            ) : null}
          </GlassCard>
        ) : null}

        {/* Design Cards */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator
          bounces={false}
          nestedScrollEnabled
          directionalLockEnabled
          decelerationRate="fast"
          onScroll={(e) => {
            const len = generatedDesigns.length;
            if (len === 0) return;
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentDesignIndex(Math.min(Math.max(index, 0), len - 1));
          }}
          scrollEventThrottle={16}
        >
          {generatedDesigns.map((design, index) => (
            <View key={design.id} style={styles.cardContainer}>
              <DesignConceptCard
                design={design}
                isActive={index === currentDesignIndex}
                beforePhotoUri={beforePhotoUri}
                onSwipeUp={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                onSwipeDown={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              />
            </View>
          ))}
        </ScrollView>

        {/* Dot Indicator */}
        <DotIndicator total={generatedDesigns.length} current={currentDesignIndex} />
      </View>

      {/* Bottom Sheet */}
      <EstimateBottomSheet
        baseEstimate={{ min: 7000, max: 10500 }}
        selectedAdjusters={selectedAdjusters}
        onToggleAdjuster={handleToggleAdjuster}
        onSaveDesign={handleSaveDesign}
      />
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
  skipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },

  // Generating Overlay
  generatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurredBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0A14',
    opacity: 0.95,
  },
  generatingBackdropDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0A14',
    opacity: 0.88,
  },
  scanningLineContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 20,
  },
  scanningCanvas: {
    width: '100%',
    height: 4,
  },
  scanningGlow: {
    position: 'absolute',
    top: -8,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: Colors.primary,
    opacity: 0.3,
  },
  floatingParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  generatingContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  orbContainer: {
    marginBottom: Spacing.xl,
  },
  orb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.large,
  },
  progressRingContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  progressRingBackground: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: Colors.surface,
  },
  progressRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingFill: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  progressPercent: {
    position: 'absolute',
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
  },
  analysisMessage: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  analysisSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },

  // Content
  content: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: `${Colors.primary}20`,
    borderRadius: BorderRadius.full,
  },
  regenerateText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
  },
  insightCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  insightTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  insightSummary: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  insightMeta: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  insightDisclaimer: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
    marginTop: Spacing.md,
    lineHeight: 16,
    fontStyle: 'italic',
  },

  // Card
  cardContainer: {
    width,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  conceptCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  conceptImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  beforeLabel: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textMuted,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  afterLabel: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  swipeHint: {
    position: 'absolute',
    bottom: Spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  swipeHintText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },
  conceptInfo: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  conceptName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  materialTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  materialText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },

  // Dot Indicator
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surface,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },

  // Bottom Sheet
  bottomSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  sheetHandle: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: Spacing.xs,
  },
  estimateContainer: {
    marginBottom: Spacing.md,
  },
  estimateLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  estimateBar: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  estimateFill: {
    height: '100%',
    width: '70%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  estimateValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
  },
  adjustersContainer: {
    marginBottom: Spacing.md,
  },
  adjustersLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  adjustersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  adjusterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  adjusterChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  adjusterText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },
  adjusterTextSelected: {
    color: Colors.background,
  },
  sheetActions: {
    marginTop: 'auto',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    ...Shadows.medium,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.background,
  },
});
