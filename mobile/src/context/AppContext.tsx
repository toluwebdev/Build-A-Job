import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AUTH_TOKEN_KEY } from "../constants/auth";
import {
  clearStoredSession,
  getAuthErrorMessage,
  loginUser,
  registerUser,
} from "../services/auth.services";
import { getApiBaseUrl } from "../services/api";
import type { User, UserType } from "../types";
import { decodeJwtPayload } from "../utils/jwt";

function mapJwtToUser(payload: Record<string, unknown>): User | null {
  const id = payload.id;
  const email = payload.email;
  if (id == null || email == null) return null;

  const role = payload.role;
  const type: UserType =
    role === "trader" ? "TRADESPERSON" : "HOMEOWNER";
  const verified = payload.v === true;
  const now = new Date().toISOString();

  return {
    id: String(id),
    email: String(email),
    firstName: String(payload.fn ?? ""),
    lastName: String(payload.ln ?? ""),
    type,
    status: "ACTIVE",
    emailVerified: verified,
    phoneVerified: false,
    onboardingComplete: verified,
    onboardingStep: verified ? "COMPLETE" : "WELCOME",
    createdAt: now,
    updatedAt: now,
  };
}

async function loadUserFromStorage(): Promise<User | null> {
  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return mapJwtToUser(payload);
}

export type AppContextValue = {
  /** Session loaded from storage */
  isReady: boolean;
  user: User | null;
  isAuthenticated: boolean;
  /** Last auth/API error (also returned from register/login results) */
  authError: string | null;
  clearAuthError: () => void;
  /** Current API origin (from Expo config) */
  apiOrigin: string;
  registerAccount: (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<{ ok: boolean; message?: string }>;
  loginAccount: (input: {
    email: string;
    password: string;
  }) => Promise<{
    ok: boolean;
    message?: string;
    requiresVerification?: boolean;
  }>;
  logoutAccount: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const u = await loadUserFromStorage();
        if (!cancelled) setUser(u);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const registerAccount = useCallback<
    AppContextValue["registerAccount"]
  >(async (input) => {
    setAuthError(null);
    try {
      const res = await registerUser(input);
      const u = await loadUserFromStorage();
      setUser(u);
      return {
        ok: true,
        message: typeof res.message === "string" ? res.message : undefined,
      };
    } catch (e) {
      const msg = getAuthErrorMessage(e);
      setAuthError(msg);
      return { ok: false, message: msg };
    }
  }, []);

  const loginAccount = useCallback<AppContextValue["loginAccount"]>(
    async (input) => {
      setAuthError(null);
      try {
        const res = await loginUser(input);
        const u = await loadUserFromStorage();
        setUser(u);
        return {
          ok: true,
          message: typeof res.message === "string" ? res.message : undefined,
          requiresVerification: res.requiresVerification === true,
        };
      } catch (e) {
        const msg = getAuthErrorMessage(e);
        setAuthError(msg);
        return { ok: false, message: msg };
      }
    },
    [],
  );

  const logoutAccount = useCallback(async () => {
    setAuthError(null);
    await clearStoredSession();
    setUser(null);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      isReady,
      user,
      isAuthenticated: user !== null,
      authError,
      clearAuthError,
      apiOrigin: getApiBaseUrl(),
      registerAccount,
      loginAccount,
      logoutAccount,
    }),
    [
      isReady,
      user,
      authError,
      clearAuthError,
      registerAccount,
      loginAccount,
      logoutAccount,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}
