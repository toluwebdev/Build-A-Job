import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { Colors, BorderRadius } from '../../constants';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  animated?: boolean;
  pressed?: boolean;
}

export function GlassCard({
  children,
  style,
  intensity = 20,
  tint = 'dark',
  animated = false,
  pressed = false,
  ...props
}: GlassCardProps) {
  const animatedStyle = useAnimatedStyle(() => {
    if (!animated) return {};
    
    return {
      transform: [
        { scale: withSpring(pressed ? 0.98 : 1, { damping: 20, stiffness: 300 }) },
      ],
    };
  }, [pressed]);

  return (
    <Animated.View style={[animated && animatedStyle]}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[styles.container, style]}
        {...props}
      >
        <View style={styles.border}>
          {children}
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(28, 28, 40, 0.6)',
  },
  border: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
});
