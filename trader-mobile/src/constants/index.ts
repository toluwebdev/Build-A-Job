import { Platform, type ViewStyle } from 'react-native';

export const Colors = {
  background: '#0A0A0F',
  surface: '#12121A',
  surfaceElevated: '#1C1C28',
  surfaceHighlight: '#252535',

  primary: '#7B5CF6',
  primaryDark: '#5B3DD6',
  primaryLight: '#9B7CFF',
  success: '#00D4AA',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  text: '#FFFFFF',
  textSecondary: '#A0A0B8',
  textMuted: '#5A5A78',

  border: 'rgba(255, 255, 255, 0.08)',
  borderActive: 'rgba(123, 92, 246, 0.4)',

  gradientStart: '#7B5CF6',
  gradientEnd: '#00D4AA',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 9999,
} as const;

function shadowStyle(
  elevation: number,
  radius: number,
  opacity: number
): Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
> {
  return Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: Math.max(1, elevation / 2) },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation },
    default: { elevation },
  }) as Pick<
    ViewStyle,
    'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
  >;
}

export const Shadows = {
  small: shadowStyle(2, 4, 0.12),
  medium: shadowStyle(4, 8, 0.18),
  large: shadowStyle(8, 16, 0.24),
} as const;

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const Validation = {
  PASSWORD_MIN_LENGTH: 8,
} as const;

