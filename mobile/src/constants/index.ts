import { Platform, type ViewStyle } from 'react-native';

// ============================================
// COLORS - Futuristic Dark Theme
// ============================================

export const Colors = {
  // Primary palette
  background: '#0A0A0F',
  surface: '#12121A',
  surfaceElevated: '#1C1C28',
  surfaceHighlight: '#252535',
  
  // Accents
  primary: '#7B5CF6',
  primaryDark: '#5B3DD6',
  primaryLight: '#9B7CFF',
  success: '#00D4AA',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#A0A0B8',
  textMuted: '#5A5A78',
  
  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderActive: 'rgba(123, 92, 246, 0.4)',
  
  // Gradients
  gradientStart: '#7B5CF6',
  gradientEnd: '#00D4AA',
} as const;

// ============================================
// TRADE CATEGORIES
// ============================================

export const TRADE_CATEGORIES = [
  { value: 'PLUMBING', label: 'Plumbing', icon: 'droplet', color: '#3B82F6' },
  { value: 'ELECTRICAL', label: 'Electrical', icon: 'zap', color: '#F59E0B' },
  { value: 'CARPENTRY', label: 'Carpentry', icon: 'tool', color: '#8B5CF6' },
  { value: 'PAINTING_DECORATING', label: 'Painting & Decorating', icon: 'brush', color: '#EC4899' },
  { value: 'ROOFING', label: 'Roofing', icon: 'home', color: '#6B7280' },
  { value: 'BRICKLAYING', label: 'Bricklaying', icon: 'square', color: '#EF4444' },
  { value: 'PLASTERING', label: 'Plastering', icon: 'layers', color: '#F97316' },
  { value: 'TILING', label: 'Tiling', icon: 'grid', color: '#14B8A6' },
  { value: 'FLOORING', label: 'Flooring', icon: 'maximize', color: '#84CC16' },
  { value: 'KITCHEN_FITTING', label: 'Kitchen Fitting', icon: 'coffee', color: '#06B6D4' },
  { value: 'BATHROOM_FITTING', label: 'Bathroom Fitting', icon: 'droplet', color: '#0EA5E9' },
  { value: 'LANDSCAPING', label: 'Landscaping', icon: 'sun', color: '#22C55E' },
  { value: 'FENCING', label: 'Fencing', icon: 'align-justify', color: '#A16207' },
  { value: 'DRIVEWAYS', label: 'Driveways', icon: 'truck', color: '#525252' },
  { value: 'HEATING', label: 'Heating & Gas', icon: 'flame', color: '#DC2626' },
  { value: 'GLAZING', label: 'Glazing', icon: 'layout', color: '#60A5FA' },
  { value: 'LOCKSMITH', label: 'Locksmith', icon: 'key', color: '#78716C' },
  { value: 'PEST_CONTROL', label: 'Pest Control', icon: 'alert-triangle', color: '#65A30D' },
  { value: 'CLEANING', label: 'Cleaning', icon: 'sparkles', color: '#2DD4BF' },
  { value: 'HANDYMAN', label: 'Handyman', icon: 'wrench', color: '#6366F1' },
  { value: 'BUILDING', label: 'General Building', icon: 'box', color: '#4B5563' },
  { value: 'EXTENSIONS', label: 'House Extensions', icon: 'plus-square', color: '#7C3AED' },
  { value: 'LOFT_CONVERSION', label: 'Loft Conversion', icon: 'arrow-up', color: '#BE185D' },
  { value: 'GARAGE_CONVERSION', label: 'Garage Conversion', icon: 'archive', color: '#0369A1' },
] as const;

// ============================================
// URGENCY OPTIONS
// ============================================

export const URGENCY_OPTIONS = [
  { value: 'IMMEDIATE', label: 'Immediate', description: 'Within 24 hours', color: '#EF4444' },
  { value: 'WITHIN_48H', label: 'Within 48 hours', description: 'Urgent but not emergency', color: '#F97316' },
  { value: 'WITHIN_WEEK', label: 'Within a week', description: 'Flexible timing', color: '#F59E0B' },
  { value: 'WITHIN_WEEKS', label: 'Within a few weeks', description: 'Planning ahead', color: '#3B82F6' },
  { value: 'FLEXIBLE', label: 'Flexible', description: 'No specific timeline', color: '#22C55E' },
] as const;

// ============================================
// JOB STATUS
// ============================================

export const JOB_STATUS = {
  DRAFT: { label: 'Draft', color: '#6B7280', bgColor: '#374151' },
  PENDING_AI: { label: 'AI Processing', color: '#8B5CF6', bgColor: '#5B21B6' },
  PUBLISHED: { label: 'Published', color: '#3B82F6', bgColor: '#1E40AF' },
  QUOTING: { label: 'Receiving Quotes', color: '#F59E0B', bgColor: '#B45309' },
  QUOTE_ACCEPTED: { label: 'Quote Accepted', color: '#10B981', bgColor: '#047857' },
  IN_PROGRESS: { label: 'In Progress', color: '#06B6D4', bgColor: '#0891B2' },
  COMPLETED: { label: 'Completed', color: '#22C55E', bgColor: '#15803D' },
  CANCELLED: { label: 'Cancelled', color: '#EF4444', bgColor: '#B91C1C' },
  EXPIRED: { label: 'Expired', color: '#9CA3AF', bgColor: '#4B5563' },
} as const;

// ============================================
// QUOTE STATUS
// ============================================

export const QUOTE_STATUS = {
  PENDING: { label: 'Pending', color: '#F59E0B', bgColor: '#B45309' },
  VIEWED: { label: 'Viewed', color: '#3B82F6', bgColor: '#1E40AF' },
  ACCEPTED: { label: 'Accepted', color: '#22C55E', bgColor: '#15803D' },
  DECLINED: { label: 'Declined', color: '#EF4444', bgColor: '#B91C1C' },
  EXPIRED: { label: 'Expired', color: '#9CA3AF', bgColor: '#4B5563' },
  WITHDRAWN: { label: 'Withdrawn', color: '#6B7280', bgColor: '#374151' },
} as const;

// ============================================
// SPACING
// ============================================

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

// ============================================
// BORDER RADIUS
// ============================================

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 9999,
} as const;

// ============================================
// SHADOWS (RN iOS + Android)
// ============================================

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

// ============================================
// TYPOGRAPHY
// ============================================

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

// ============================================
// ANIMATION DURATIONS
// ============================================

export const Animation = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// ============================================
// VALIDATION
// ============================================

export const Validation = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  POSTCODE_REGEX: /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i,
} as const;

// ============================================
// FILE UPLOAD
// ============================================

export const FileUpload = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGES_PER_JOB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
} as const;
