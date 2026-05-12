import React from 'react';
import { View, ViewProps, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { Colors, BorderRadius } from '../../constants';

const PADDING_KEYS = [
  'padding',
  'paddingHorizontal',
  'paddingVertical',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
] as const;

/** BlurView often ignores padding; apply it on the inner bordered wrapper instead. */
function splitPaddingFromStyle(style: ViewProps['style']): {
  paddingStyle: ViewStyle;
  restStyle: ViewProps['style'];
} {
  const flat = StyleSheet.flatten(style) as Record<string, unknown> | undefined;
  if (!flat) return { paddingStyle: {}, restStyle: style };
  const paddingStyle: ViewStyle = {};
  const rest: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    if ((PADDING_KEYS as readonly string[]).includes(key)) {
      (paddingStyle as Record<string, unknown>)[key] = value;
    } else {
      rest[key] = value;
    }
  }
  return { paddingStyle, restStyle: rest as ViewStyle };
}

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
  const { paddingStyle, restStyle } = splitPaddingFromStyle(style);

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
        style={[styles.container, restStyle]}
        {...props}
      >
        <View style={[styles.border, paddingStyle]}>
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
