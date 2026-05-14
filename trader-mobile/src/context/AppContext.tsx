import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import { AUTH_TOKEN_KEY } from "../constants/auth";
import {
  clearStoredSession,
  deleteAccountRequest,
  fetchCurrentUser,
  getAuthErrorMessage,
  loginUser,
  registerTrader,
} from "../services/auth.services";
import { getApiBaseUrl } from "../services/api";
import type { User, UserType } from "../types/auth";
import { mapServerUserToAppUser } from "../utils/mapServerUser";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = globalThis.atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function mapJwtToUser(payload: Record<string, unknown>): User | null {
  const id = payload.id;
  const email = payload.email;
  if (id == null || email == null) return null;

  const role = payload.role;
  const type: UserType = role === "trader" ? "TRADESPERSON" : "HOMEOWNER";
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

async function loadUserFromApiOrJwt(): Promise<User | null> {
  try {
    const serverUser = await fetchCurrentUser();
    return mapServerUserToAppUser(serverUser);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      await clearStoredSession();
      return null;
    }
    return loadUserFromStorage();
  }
}

export type AppContextValue = {
  isReady: boolean;
  user: User | null;
  isAuthenticated: boolean;
  authError: string | null;
  clearAuthError: () => void;
  apiOrigin: string;
  refreshUser: () => Promise<void>;
  syncSessionFromStoredToken: () => Promise<void>;
  registerAccount: (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<{
    ok: boolean;
    message?: string;
    needsEmailVerification?: boolean;
    email?: string;
  }>;
  loginAccount: (input: {
    email: string;
    password: string;
  }) => Promise<{
    ok: boolean;
    message?: string;
    requiresVerification?: boolean;
    needsEmailVerification?: boolean;
    email?: string;
  }>;
  logoutAccount: () => Promise<void>;
  deleteAccount: () => Promise<{ ok: boolean; message?: string }>;
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
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        if (!cancelled) {
          setUser(null);
          setIsReady(true);
        }
        return;
      }
      try {
        const u = await loadUserFromApiOrJwt();
        if (!cancelled) setUser(u);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const syncSessionFromStoredToken = useCallback(async () => {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setUser(null);
      return;
    }
    const payload = decodeJwtPayload(token);
    if (!payload) return;
    const u = mapJwtToUser(payload);
    if (u) setUser(u);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const serverUser = await fetchCurrentUser();
      setUser(mapServerUserToAppUser(serverUser));
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        await clearStoredSession();
        setUser(null);
        return;
      }
      const fromJwt = await loadUserFromStorage();
      if (fromJwt) setUser(fromJwt);
    }
  }, []);

  const registerAccount = useCallback<
    AppContextValue["registerAccount"]
  >(async (input) => {
    setAuthError(null);
    try {
      const res = await registerTrader(input);
      const u = await loadUserFromApiOrJwt();
      setUser(u);
      const emailNorm = input.email.trim().toLowerCase();
      return {
        ok: true,
        message: typeof res.message === "string" ? res.message : undefined,
        needsEmailVerification: u !== null && !u.emailVerified,
        email: u?.email ?? emailNorm,
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
        const u = await loadUserFromApiOrJwt();
        setUser(u);
        const emailNorm = input.email.trim().toLowerCase();
        const needsVerify =
          (u !== null && !u.emailVerified) ||
          res.requiresVerification === true;
        return {
          ok: true,
          message: typeof res.message === "string" ? res.message : undefined,
          requiresVerification: res.requiresVerification === true,
          needsEmailVerification: needsVerify,
          email: u?.email ?? emailNorm,
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

  const deleteAccount = useCallback(async () => {
    setAuthError(null);
    try {
      await deleteAccountRequest();
      await clearStoredSession();
      setUser(null);
      return { ok: true as const };
    } catch (e) {
      const msg = getAuthErrorMessage(e);
      setAuthError(msg);
      return { ok: false as const, message: msg };
    }
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      isReady,
      user,
      isAuthenticated: user !== null,
      authError,
      clearAuthError,
      apiOrigin: getApiBaseUrl(),
      refreshUser,
      syncSessionFromStoredToken,
      registerAccount,
      loginAccount,
      logoutAccount,
      deleteAccount,
    }),
    [
      isReady,
      user,
      authError,
      clearAuthError,
      refreshUser,
      syncSessionFromStoredToken,
      registerAccount,
      loginAccount,
      logoutAccount,
      deleteAccount,
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
