import React, { createContext, useContext, useMemo, useState } from 'react';

import type { TraderTier } from '../types';

type TraderProfile = {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
};

type PrototypeContextValue = {
  plan: TraderTier;
  setPlan: (tier: TraderTier) => void;
  profile: TraderProfile;
  setProfile: (next: Partial<TraderProfile>) => void;
};

const PrototypeContext = createContext<PrototypeContextValue | null>(null);

export function PrototypeProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<TraderTier>('FREE');
  const [profile, setProfileState] = useState<TraderProfile>({
    companyName: 'Premier Trades Ltd',
    firstName: 'Alex',
    lastName: 'Taylor',
    email: 'trader@example.com',
  });

  const setProfile = (next: Partial<TraderProfile>) => {
    setProfileState((p) => ({ ...p, ...next }));
  };

  const value = useMemo(
    () => ({
      plan,
      setPlan,
      profile,
      setProfile,
    }),
    [plan, profile]
  );

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>;
}

export function usePrototype(): PrototypeContextValue {
  const ctx = useContext(PrototypeContext);
  if (!ctx) throw new Error('usePrototype must be used within PrototypeProvider');
  return ctx;
}

