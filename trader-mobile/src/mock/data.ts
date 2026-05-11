import type { Lead, JobBrief, MessageThread, Quote, Review } from '../types';

const now = new Date();
const iso = (d: Date) => d.toISOString();

export const mockJobs: JobBrief[] = [
  {
    id: 'job_1',
    title: 'Replace bathroom tiles + reseal shower',
    category: 'Tiling',
    region: 'London',
    timing: 'Within 2 weeks',
    budgetBand: '£500–£1,200',
    estimateRange: '£650–£950',
    customerName: 'Jamie',
    customerPhotos: [],
    aiConceptImage: undefined,
    description:
      'Customer reports cracked tiles and water ingress. Wants modern matte finish and quick turnaround.',
    status: 'QUOTING',
    createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 6)),
  },
  {
    id: 'job_2',
    title: 'Driveway repair + edging',
    category: 'Driveways',
    region: 'Essex',
    timing: 'Flexible',
    budgetBand: '£1,000–£2,500',
    estimateRange: '£1,400–£2,100',
    customerName: 'Morgan',
    customerPhotos: [],
    aiConceptImage: undefined,
    description:
      'Loose blocks and poor drainage. Wants a refreshed look and better water run-off.',
    status: 'NEW',
    createdAt: iso(new Date(now.getTime() - 1000 * 60 * 30)),
  },
  {
    id: 'job_3',
    title: 'Kitchen tap + under-sink pipe leak',
    category: 'Plumbing',
    region: 'London',
    timing: 'Within 48 hours',
    budgetBand: '£150–£400',
    estimateRange: '£200–£320',
    customerName: 'Sam',
    customerPhotos: [],
    aiConceptImage: undefined,
    description:
      'Tap replacement and pipe leak under sink. Access is good. Needs weekend slot.',
    status: 'CONFIRMED',
    createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 36)),
  },
];

export const mockLeads: Lead[] = [
  { id: 'lead_1', job: mockJobs[1]!, status: 'INCOMING' },
  { id: 'lead_2', job: mockJobs[0]!, status: 'INCOMING' },
];

export const mockQuotes: Quote[] = [
  {
    id: 'quote_1',
    jobId: 'job_1',
    amount: 840,
    startDate: iso(new Date(now.getTime() + 1000 * 60 * 60 * 24 * 5)),
    durationDays: 2,
    paymentTerms: '50% deposit, 50% on completion',
    conceptImage: undefined,
    status: 'SUBMITTED',
    updatedAt: iso(new Date(now.getTime() - 1000 * 60 * 20)),
  },
];

export const mockThreads: MessageThread[] = [
  {
    id: 'thread_1',
    jobId: 'job_1',
    customerName: 'Jamie',
    lastMessage: 'Could you include grout colour options in the quote?',
    updatedAt: iso(new Date(now.getTime() - 1000 * 60 * 8)),
  },
  {
    id: 'thread_2',
    jobId: 'job_3',
    customerName: 'Sam',
    lastMessage: 'Confirmed. Address sent. See you Saturday.',
    updatedAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 3)),
  },
];

export const mockReviews: Review[] = [
  {
    id: 'rev_1',
    jobId: 'job_3',
    rating: 5,
    comment: 'Great communication and tidy work. Would hire again.',
    createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10)),
  },
  {
    id: 'rev_2',
    jobId: 'job_3',
    rating: 4,
    comment: 'Arrived on time and fixed the leak quickly.',
    createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 20)),
  },
];

