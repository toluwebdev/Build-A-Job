export type TraderTier = 'FREE' | 'PRO' | 'PREMIUM';

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type JobStatus =
  | 'NEW'
  | 'QUOTING'
  | 'NEGOTIATING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type LeadStatus = 'INCOMING' | 'ACCEPTED' | 'DECLINED';

export type QuoteStatus = 'SUBMITTED' | 'REVISED' | 'ACCEPTED' | 'DECLINED';

export type TraderUser = {
  id: string;
  email: string;
  companyName: string;
  firstName: string;
  lastName: string;
  tier: TraderTier;
  onboardingComplete: boolean;
  verificationStatus: VerificationStatus;
  servicesOffered: string[];
  coverageAreas: string[];
  dayRate?: number;
  certifications: string[];
  portfolioImageUris: string[];
  portfolioConceptUris: string[];
  reputationScore: number;
  ratingAvg: number;
  ratingCount: number;
};

export type JobBrief = {
  id: string;
  title: string;
  category: string;
  region: string;
  timing: string;
  budgetBand: string;
  estimateRange: string;
  customerName: string;
  customerPhotos: string[];
  aiConceptImage?: string;
  description: string;
  status: JobStatus;
  createdAt: string;
};

export type Lead = {
  id: string;
  job: JobBrief;
  status: LeadStatus;
};

export type Quote = {
  id: string;
  jobId: string;
  amount: number;
  startDate: string;
  durationDays: number;
  paymentTerms: string;
  conceptImage?: string;
  status: QuoteStatus;
  updatedAt: string;
};

export type MessageThread = {
  id: string;
  jobId: string;
  customerName: string;
  lastMessage: string;
  updatedAt: string;
};

export type Review = {
  id: string;
  jobId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

