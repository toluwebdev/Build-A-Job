import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type JobCategory =
  | 'DRIVEWAY'
  | 'GARDEN'
  | 'PATIO'
  | 'INTERIOR'
  | 'EXTENSION'
  | 'KITCHEN'
  | 'BATHROOM'
  | 'ROOFING'
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'LANDSCAPING'
  | 'FENCING'
  | 'OTHER';

export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type QuoteStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface JobLocation {
  address: string;
  city: string;
  postcode: string;
  latitude?: number;
  longitude?: number;
}

export interface JobBudget {
  min: number;
  max: number;
  type: 'FIXED' | 'RANGE' | 'NEGOTIABLE';
}

export interface AIDesign {
  id: string;
  originalPhotoUrl: string;
  generatedDesignUrl: string;
  style: string;
  description: string;
  createdAt: string;
}

export interface Quote {
  id: string;
  traderId: string;
  traderName: string;
  traderAvatar?: string;
  traderRating: number;
  traderReviewCount: number;
  traderVerified: boolean;
  amount: number;
  estimatedDays: number;
  message: string;
  status: QuoteStatus;
  createdAt: string;
  expiresAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: JobCategory;
  photos: string[];
  aiDesigns: AIDesign[];
  location: JobLocation;
  budget: JobBudget;
  status: JobStatus;
  quotes: Quote[];
  preferredStartDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobStateValues {
  currentJob: Partial<Job>;
  photos: string[];
  aiDesigns: AIDesign[];
  selectedAIDesign: AIDesign | null;
  title: string;
  description: string;
  category: JobCategory | null;
  location: Partial<JobLocation>;
  budget: Partial<JobBudget>;
  preferredStartDate: string | null;
  currentStep: number;
  isGeneratingAI: boolean;
  generationProgress: number;
}

export interface CreateJobContextValue extends CreateJobStateValues {
  setPhotos: (photos: string[]) => void;
  addPhoto: (photo: string) => void;
  removePhoto: (index: number) => void;
  setAIDesigns: (designs: AIDesign[]) => void;
  addAIDesign: (design: AIDesign) => void;
  selectAIDesign: (design: AIDesign | null) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setCategory: (category: JobCategory) => void;
  setLocation: (location: Partial<JobLocation>) => void;
  setBudget: (budget: Partial<JobBudget>) => void;
  setPreferredStartDate: (date: string | null) => void;
  setCurrentStep: (step: number) => void;
  setIsGeneratingAI: (isGenerating: boolean) => void;
  setGenerationProgress: (progress: number) => void;
  reset: () => void;
  getJobData: () => Partial<Job>;
}

const STORAGE_KEY = 'create-job-storage';

const initialValues: CreateJobStateValues = {
  currentJob: {},
  photos: [],
  aiDesigns: [],
  selectedAIDesign: null,
  title: '',
  description: '',
  category: null,
  location: {},
  budget: {},
  preferredStartDate: null,
  currentStep: 1,
  isGeneratingAI: false,
  generationProgress: 0,
};

const CreateJobContext = createContext<CreateJobContextValue | null>(null);

export function CreateJobProvider({ children }: { children: React.ReactNode }) {
  const [values, setValues] = useState<CreateJobStateValues>(initialValues);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw) as Partial<CreateJobStateValues>;
          setValues((prev) => ({ ...prev, ...parsed }));
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const partial: Partial<CreateJobStateValues> = {
        photos: values.photos,
        aiDesigns: values.aiDesigns,
        selectedAIDesign: values.selectedAIDesign,
        title: values.title,
        description: values.description,
        category: values.category,
        location: values.location,
        budget: values.budget,
        preferredStartDate: values.preferredStartDate,
        currentStep: values.currentStep,
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(partial)).catch(() => {});
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [hydrated, values]);

  const setPhotos = useCallback((photos: string[]) => {
    setValues((s) => ({ ...s, photos }));
  }, []);

  const addPhoto = useCallback((photo: string) => {
    setValues((s) => ({ ...s, photos: [...s.photos, photo] }));
  }, []);

  const removePhoto = useCallback((index: number) => {
    setValues((s) => ({
      ...s,
      photos: s.photos.filter((_, i) => i !== index),
    }));
  }, []);

  const setAIDesigns = useCallback((aiDesigns: AIDesign[]) => {
    setValues((s) => ({ ...s, aiDesigns }));
  }, []);

  const addAIDesign = useCallback((design: AIDesign) => {
    setValues((s) => ({ ...s, aiDesigns: [...s.aiDesigns, design] }));
  }, []);

  const selectAIDesign = useCallback((design: AIDesign | null) => {
    setValues((s) => ({ ...s, selectedAIDesign: design }));
  }, []);

  const setTitle = useCallback((title: string) => {
    setValues((s) => ({ ...s, title }));
  }, []);

  const setDescription = useCallback((description: string) => {
    setValues((s) => ({ ...s, description }));
  }, []);

  const setCategory = useCallback((category: JobCategory) => {
    setValues((s) => ({ ...s, category }));
  }, []);

  const setLocation = useCallback((location: Partial<JobLocation>) => {
    setValues((s) => ({ ...s, location: { ...s.location, ...location } }));
  }, []);

  const setBudget = useCallback((budget: Partial<JobBudget>) => {
    setValues((s) => ({ ...s, budget: { ...s.budget, ...budget } }));
  }, []);

  const setPreferredStartDate = useCallback((preferredStartDate: string | null) => {
    setValues((s) => ({ ...s, preferredStartDate }));
  }, []);

  const setCurrentStep = useCallback((currentStep: number) => {
    setValues((s) => ({ ...s, currentStep }));
  }, []);

  const setIsGeneratingAI = useCallback((isGeneratingAI: boolean) => {
    setValues((s) => ({ ...s, isGeneratingAI }));
  }, []);

  const setGenerationProgress = useCallback((generationProgress: number) => {
    setValues((s) => ({ ...s, generationProgress }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const getJobData = useCallback((): Partial<Job> => {
    return {
      title: values.title,
      description: values.description,
      category: values.category ?? undefined,
      photos: values.photos,
      aiDesigns: values.aiDesigns,
      location: values.location as JobLocation,
      budget: values.budget as JobBudget,
      preferredStartDate: values.preferredStartDate ?? undefined,
    };
  }, [values]);

  const value = useMemo(
    (): CreateJobContextValue => ({
      ...values,
      setPhotos,
      addPhoto,
      removePhoto,
      setAIDesigns,
      addAIDesign,
      selectAIDesign,
      setTitle,
      setDescription,
      setCategory,
      setLocation,
      setBudget,
      setPreferredStartDate,
      setCurrentStep,
      setIsGeneratingAI,
      setGenerationProgress,
      reset,
      getJobData,
    }),
    [
      values,
      setPhotos,
      addPhoto,
      removePhoto,
      setAIDesigns,
      addAIDesign,
      selectAIDesign,
      setTitle,
      setDescription,
      setCategory,
      setLocation,
      setBudget,
      setPreferredStartDate,
      setCurrentStep,
      setIsGeneratingAI,
      setGenerationProgress,
      reset,
      getJobData,
    ]
  );

  return (
    <CreateJobContext.Provider value={value}>{children}</CreateJobContext.Provider>
  );
}

export function useCreateJobStore(): CreateJobContextValue {
  const ctx = useContext(CreateJobContext);
  if (!ctx) {
    throw new Error('useCreateJobStore must be used within CreateJobProvider');
  }
  return ctx;
}
