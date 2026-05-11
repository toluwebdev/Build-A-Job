import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

import { Colors, BorderRadius, Typography } from '../../constants';

interface PillBadgeProps {
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function PillBadge({
  label,
  variant = 'default',
  size = 'md',
  style,
}: PillBadgeProps) {
  const variantStyles = {
    default: { backgroundColor: Colors.surfaceHighlight, color: Colors.textSecondary },
    primary: { backgroundColor: `${Colors.primary}20`, color: Colors.primary },
    success: { backgroundColor: `${Colors.success}20`, color: Colors.success },
    warning: { backgroundColor: `${Colors.warning}20`, color: Colors.warning },
    error: { backgroundColor: `${Colors.error}20`, color: Colors.error },
    info: { backgroundColor: `${Colors.info}20`, color: Colors.info },
  };

  const sizeStyles = {
    sm: { paddingHorizontal: 8, paddingVertical: 2, fontSize: Typography.sizes.xs },
    md: { paddingHorizontal: 12, paddingVertical: 4, fontSize: Typography.sizes.sm },
  };

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: variantStyle.backgroundColor },
        { paddingHorizontal: sizeStyle.paddingHorizontal, paddingVertical: sizeStyle.paddingVertical },
        style,
      ]}
    >
      <Text style={[styles.text, { color: variantStyle.color, fontSize: sizeStyle.fontSize }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
});
