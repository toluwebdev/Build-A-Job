import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AUTH_TOKEN_KEY } from "../constants/auth";
import { api } from "./api";

export type RegisterResponse = {
  success?: boolean;
  message?: string;
  token?: string;
};

export type LoginResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  requiresVerification?: boolean;
};

/**
 * Homeowner registration — POST /api/auth/register (role: user).
 */
export async function registerUser(body: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>("/auth/register", {
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    email: body.email.trim().toLowerCase(),
    password: body.password,
    role: "user",
  });

  if (data.token) {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
  }

  return data;
}

/** POST /api/auth/login */
export async function loginUser(body: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", {
    email: body.email.trim().toLowerCase(),
    password: body.password,
  });

  if (data.token) {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
  }

  return data;
}

export async function clearStoredSession(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getAuthErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const ax = error;
    if (ax.code === "ECONNABORTED" || /timeout/i.test(ax.message ?? "")) {
      return "Request timed out. Check your connection or try again.";
    }
    if (!ax.response && ax.request) {
      return `Cannot reach API (${ax.message || "network error"}). Check URL or device internet.`;
    }

    const raw = ax.response?.data;
    if (typeof raw === "string" && raw.trim()) return raw;

    if (raw && typeof raw === "object") {
      const msg = (raw as { message?: unknown }).message;
      if (typeof msg === "string") return msg;
      const errStr = (raw as { error?: unknown }).error;
      if (typeof errStr === "string") return errStr;
    }

    if (ax.response?.status === 404) {
      return "API not found — check apiBaseUrl / deploy.";
    }
    if (ax.response?.status === 401 || ax.response?.status === 403) {
      return "Invalid email or password.";
    }
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
