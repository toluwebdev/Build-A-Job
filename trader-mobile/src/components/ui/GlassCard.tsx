import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

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
  animated: _animated,
  pressed: _pressed,
  ...props
}: GlassCardProps) {
  return (
    <BlurView intensity={intensity} tint={tint} style={styles.container} {...props}>
      <View style={[styles.border, style]}>{children}</View>
    </BlurView>
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
