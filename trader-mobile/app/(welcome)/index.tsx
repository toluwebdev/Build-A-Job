import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BellRing, Sparkles, Star, ChevronRight } from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius } from '../../src/constants';
import { useApp } from '../../src/context/AppContext';

const { width } = Dimensions.get('window');

interface WelcomeSlide {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: [string, string];
}

const slides: WelcomeSlide[] = [
  {
    id: '1',
    title: 'Get matched with leads',
    description:
      'Receive job requests that match your trade, region, and availability.',
    icon: <BellRing size={80} color={Colors.text} />,
    gradient: ['#7B5CF6', '#5B3DD6'],
  },
  {
    id: '2',
    title: 'Win work with AI concepts',
    description:
      'Attach concept visuals to your quote to stand out and close faster.',
    icon: <Sparkles size={80} color={Colors.text} />,
    gradient: ['#00D4AA', '#00B894'],
  },
  {
    id: '3',
    title: 'Build your reputation',
    description:
      'Collect reviews, earn “Top Rated” badges, and grow visibility over time.',
    icon: <Star size={80} color={Colors.text} />,
    gradient: ['#F59E0B', '#D97706'],
  },
];

function SlideItem({
  item,
  index,
  scrollX,
}: {
  item: WelcomeSlide;
  index: number;
  scrollX: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8]);
    const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5]);
    const translateX = interpolate(scrollX.value, inputRange, [width * 0.3, 0, -width * 0.3]);

    return {
      transform: [{ scale }, { translateX }],
      opacity,
    } as any;
  });

  const iconScale = useSharedValue(0);

  useEffect(() => {
    iconScale.value = withSequence(
      withDelay(index * 200, withSpring(1, { damping: 12, stiffness: 100 }))
    );
  }, [index, iconScale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <View style={styles.slide}>
      <LinearGradient colors={item.gradient} style={styles.gradientBackground}>
        <Animated.View style={[styles.iconContainer, iconStyle]}>
          {item.icon}
        </Animated.View>
      </LinearGradient>

      <Animated.View style={[styles.contentContainer, animatedStyle]}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
}

export default function WelcomeCarouselScreen() {
  const router = useRouter();
  const { user } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) {
        setCurrentIndex(viewableItems[0].index || 0);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    []
  );

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  const finish = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    if (user?.emailVerified) {
      router.replace('/(app)/(tabs)/leads');
      return;
    }
    if (user && !user.emailVerified) {
      router.replace({
        pathname: '/(auth)/verify-email',
        params: { email: user.email },
      });
      return;
    }
    router.replace('/(auth)/login');
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      finish();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    finish();
  };

  const renderItem = ({ item, index }: { item: WelcomeSlide; index: number }) => (
    <SlideItem item={item} index={index} scrollX={scrollX} />
  );

  const onScroll = useCallback((event: any) => {
    scrollX.value = event.nativeEvent.contentOffset.x;
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      <View style={styles.bottomContainer}>
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.8}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <ChevronRight size={20} color={Colors.text} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: Spacing.lg,
    zIndex: 10,
    padding: Spacing.sm,
  },
  skipText: {
    fontFamily: 'Inter-Medium',
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBackground: {
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  iconContainer: { justifyContent: 'center', alignItems: 'center' },
  contentContainer: { alignItems: 'center', paddingHorizontal: Spacing.xl },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
  },
  bottomContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceHighlight,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: Typography.sizes.lg,
    color: Colors.text,
  },
});

