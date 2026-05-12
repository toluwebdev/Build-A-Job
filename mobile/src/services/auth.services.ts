import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AUTH_TOKEN_KEY } from "../constants/auth";
import type { ServerUserJson } from "../utils/mapServerUser";
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

/** GET /api/auth/user — requires Authorization: Bearer (axios interceptor). */
export async function fetchCurrentUser(): Promise<ServerUserJson> {
  const { data } = await api.get<{
    success?: boolean;
    user?: ServerUserJson;
  }>("/auth/user");

  if (!data?.user) {
    throw new Error("Invalid profile response");
  }

  return data.user;
}

export type VerifyEmailResponse = {
  success?: boolean;
  message?: string;
  token?: string;
};

/** POST /api/auth/verify-email */
export async function verifyEmailWithOtp(body: {
  email: string;
  otp: string;
}): Promise<VerifyEmailResponse> {
  const { data } = await api.post<VerifyEmailResponse>("/auth/verify-email", {
    email: body.email.trim().toLowerCase(),
    otp: String(body.otp).trim(),
  });

  if (data.token) {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
  }

  return data;
}

/** POST /api/auth/resend-verification-email */
export async function resendVerificationEmailRequest(email: string): Promise<{
  success?: boolean;
  message?: string;
}> {
  const { data } = await api.post<{
    success?: boolean;
    message?: string;
  }>("/auth/resend-verification-email", {
    email: email.trim().toLowerCase(),
  });
  return data;
}

/** POST /api/auth/forgot-password — sends 6-digit reset code by email */
export async function requestPasswordReset(email: string): Promise<{
  success?: boolean;
  message?: string;
}> {
  const { data } = await api.post<{
    success?: boolean;
    message?: string;
  }>("/auth/forgot-password", {
    email: email.trim().toLowerCase(),
  });
  return data;
}

/** POST /api/auth/reset-password — completes reset with OTP */
export async function resetPasswordWithOtp(body: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<{ success?: boolean; message?: string }> {
  const { data } = await api.post<{
    success?: boolean;
    message?: string;
  }>("/auth/reset-password", {
    email: body.email.trim().toLowerCase(),
    otp: String(body.otp).trim(),
    newPassword: body.newPassword,
  });
  return data;
}

/** DELETE /api/auth/delete-account — requires Bearer token */
export async function deleteAccountRequest(): Promise<{
  success?: boolean;
  message?: string;
}> {
  const { data } = await api.delete<{
    success?: boolean;
    message?: string;
  }>("/auth/delete-account");
  return data;
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
