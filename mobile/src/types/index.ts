// ============================================
// USER TYPES
// ============================================

export type UserType = 'HOMEOWNER' | 'TRADESPERSON' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
export type OnboardingStep = 'WELCOME' | 'PROFILE' | 'LOCATION' | 'PREFERENCES' | 'COMPLETE';

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  type: UserType;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  onboardingComplete: boolean;
  onboardingStep: OnboardingStep;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  /** Defaults to HOMEOWNER if omitted (MVP routing convenience). */
  type?: UserType;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  type: UserType;
  phone?: string;
}

// ============================================
// PROFILE TYPES
// ============================================

export interface HomeownerProfile {
  id: string;
  userId: string;
  address?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
  preferredContactMethod: 'EMAIL' | 'PHONE' | 'APP';
  totalJobsPosted: number;
  totalJobsCompleted: number;
  totalSpent: string;
}

export interface TradespersonProfile {
  id: string;
  userId: string;
  businessName?: string;
  companyNumber?: string;
  vatNumber?: string;
  website?: string;
  verified: boolean;
  verifiedAt?: string;
  insuranceVerified: boolean;
  insuranceExpiry?: string;
  coverageRadius: number;
  coveragePostcodes: string[];
  baseLatitude?: number;
  baseLongitude?: number;
  totalJobsCompleted: number;
  totalEarnings: string;
  responseRate: number;
  averageResponseTime: number;
  rating: number;
  reviewCount: number;
  availableForWork: boolean;
  autoQuoteEnabled: boolean;
}

// ============================================
// TRADE TYPES
// ============================================

export type TradeCategory =
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'CARPENTRY'
  | 'PAINTING_DECORATING'
  | 'ROOFING'
  | 'BRICKLAYING'
  | 'PLASTERING'
  | 'TILING'
  | 'FLOORING'
  | 'KITCHEN_FITTING'
  | 'BATHROOM_FITTING'
  | 'LANDSCAPING'
  | 'FENCING'
  | 'DRIVEWAYS'
  | 'HEATING'
  | 'GLAZING'
  | 'LOCKSMITH'
  | 'PEST_CONTROL'
  | 'CLEANING'
  | 'HANDYMAN'
  | 'BUILDING'
  | 'EXTENSIONS'
  | 'LOFT_CONVERSION'
  | 'GARAGE_CONVERSION';

export interface Trade {
  id: string;
  profileId: string;
  category: TradeCategory;
  subcategory?: string;
  yearsExperience: number;
  isPrimary: boolean;
  hourlyRate?: string;
  dayRate?: string;
}

// ============================================
// JOB TYPES
// ============================================

export type JobStatus = 'DRAFT' | 'PENDING_AI' | 'PUBLISHED' | 'QUOTING' | 'QUOTE_ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
export type Urgency = 'IMMEDIATE' | 'WITHIN_48H' | 'WITHIN_WEEK' | 'WITHIN_WEEKS' | 'FLEXIBLE';
export type BudgetType = 'FIXED' | 'HOURLY' | 'ESTIMATE' | 'NEGOTIABLE';

export interface Job {
  id: string;
  homeownerId: string;
  title: string;
  description: string;
  tradeCategory: TradeCategory;
  subcategory?: string;
  jobType: 'ONE_OFF' | 'ONGOING' | 'EMERGENCY';
  urgency: Urgency;
  address: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  latitude?: number;
  longitude?: number;
  propertyType: 'HOUSE' | 'APARTMENT' | 'BUNGALOW' | 'COMMERCIAL' | 'OTHER';
  isCommercial: boolean;
  budgetMin?: string;
  budgetMax?: string;
  budgetType: BudgetType;
  status: JobStatus;
  preferredStartDate?: string;
  flexibleOnTiming: boolean;
  aiDesignGenerated: boolean;
  aiDesignImages: string[];
  aiEstimateLow?: string;
  aiEstimateHigh?: string;
  aiEstimateConfidence?: number;
  viewCount: number;
  quoteCount: number;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  images?: JobImage[];
  quotes?: Quote[];
  homeowner?: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
}

export interface JobImage {
  id: string;
  jobId: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  order: number;
  createdAt: string;
}

// ============================================
// QUOTE TYPES
// ============================================

export type QuoteStatus = 'PENDING' | 'VIEWED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'WITHDRAWN';

export interface Quote {
  id: string;
  jobId: string;
  job?: Job;
  tradespersonId: string;
  tradesperson?: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    trades: Trade[];
    rating: number;
    reviewCount: number;
  };
  price: string;
  priceType: 'FIXED' | 'HOURLY' | 'ESTIMATE';
  materialsCost?: string;
  labourCost?: string;
  vatAmount?: string;
  estimatedDuration?: string;
  estimatedStartDate?: string;
  description: string;
  includes: string[];
  excludes: string[];
  paymentTerms?: string;
  warrantyPeriod?: string;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// MESSAGE TYPES
// ============================================

export interface Message {
  id: string;
  senderId: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  recipientId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'QUOTE' | 'SYSTEM';
  attachments: string[];
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  jobId?: string;
  job?: {
    id: string;
    title: string;
  };
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType =
  | 'QUOTE_RECEIVED'
  | 'QUOTE_ACCEPTED'
  | 'QUOTE_DECLINED'
  | 'MESSAGE_RECEIVED'
  | 'JOB_PUBLISHED'
  | 'JOB_EXPIRING'
  | 'CONTRACT_STARTED'
  | 'MILESTONE_DUE'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_DUE'
  | 'REVIEW_REQUEST'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  actionUrl?: string;
  relatedJobId?: string;
  relatedQuoteId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasMore?: boolean;
  };
}
