import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type JobCategory =
  | "DRIVEWAY"
  | "GARDEN"
  | "PATIO"
  | "INTERIOR"
  | "EXTENSION"
  | "KITCHEN"
  | "BATHROOM"
  | "ROOFING"
  | "PLUMBING"
  | "ELECTRICAL"
  | "LANDSCAPING"
  | "FENCING"
  | "OTHER";

export type JobLocation = {
  postcode?: string;
};

export type JobBudget = {
  type: "RANGE";
  min: number;
  max: number;
};

export type AIDesignSelection = {
  id: string;
  originalPhotoUrl: string;
  generatedDesignUrl: string;
  style: string;
  description: string;
  createdAt: string;
};

type CreateJobContextValue = {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  category: JobCategory | null;
  setCategory: (v: JobCategory | null) => void;
  location: JobLocation;
  setLocation: Dispatch<SetStateAction<JobLocation>>;
  budget: JobBudget | null;
  setBudget: (v: JobBudget | null) => void;
  preferredStartDate: string | null;
  setPreferredStartDate: (v: string | null) => void;
  photos: string[];
  setPhotos: (v: string[] | ((prev: string[]) => string[])) => void;
  selectedAIDesign: AIDesignSelection | null;
  addAIDesign: (design: AIDesignSelection) => void;
  selectAIDesign: (design: AIDesignSelection) => void;
  reset: () => void;
};

const CreateJobContext = createContext<CreateJobContextValue | null>(null);

export function CreateJobProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<JobCategory | null>(null);
  const [location, setLocation] = useState<JobLocation>({});
  const [budget, setBudget] = useState<JobBudget | null>(null);
  const [preferredStartDate, setPreferredStartDate] = useState<string | null>(
    null,
  );
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedAIDesign, setSelectedAIDesign] =
    useState<AIDesignSelection | null>(null);

  const addAIDesign = useCallback((design: AIDesignSelection) => {
    setSelectedAIDesign(design);
  }, []);

  const selectAIDesign = useCallback((design: AIDesignSelection) => {
    setSelectedAIDesign(design);
  }, []);

  const reset = useCallback(() => {
    setTitle("");
    setDescription("");
    setCategory(null);
    setLocation({});
    setBudget(null);
    setPreferredStartDate(null);
    setPhotos([]);
    setSelectedAIDesign(null);
  }, []);

  const value = useMemo<CreateJobContextValue>(
    () => ({
      title,
      setTitle,
      description,
      setDescription,
      category,
      setCategory,
      location,
      setLocation,
      budget,
      setBudget,
      preferredStartDate,
      setPreferredStartDate,
      photos,
      setPhotos,
      selectedAIDesign,
      addAIDesign,
      selectAIDesign,
      reset,
    }),
    [
      title,
      description,
      category,
      location,
      budget,
      preferredStartDate,
      photos,
      selectedAIDesign,
      addAIDesign,
      selectAIDesign,
      reset,
    ],
  );

  return (
    <CreateJobContext.Provider value={value}>
      {children}
    </CreateJobContext.Provider>
  );
}

export function useCreateJobStore(): CreateJobContextValue {
  const ctx = useContext(CreateJobContext);
  if (!ctx) {
    throw new Error("useCreateJobStore must be used within CreateJobProvider");
  }
  return ctx;
}
