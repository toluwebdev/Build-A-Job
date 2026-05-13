import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

import { AUTH_TOKEN_KEY } from "../constants/auth";

/**
 * Read base URL at request time so Expo injects `extra` after the native bridge is up.
 */
export function getApiBaseUrl(): string {
  const fromExtra =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Constants.expoConfig as any)?.extra?.apiBaseUrl ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Constants.manifest as any)?.extra?.apiBaseUrl;

  if (typeof fromExtra === "string" && fromExtra.trim().length > 0) {
    return fromExtra.replace(/\/$/, "");
  }

  return "https://build-a-job-server.vercel.app";
}

const REQUEST_TIMEOUT_MS = 120_000;

/** baseURL is set per-request so it always matches current Expo config */
export const api = axios.create({
  timeout: REQUEST_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const base = getApiBaseUrl().replace(/\/$/, "");
  config.baseURL = `${base}/api`;

  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (__DEV__) {
    const path = `${config.baseURL}${config.url ?? ""}`;
    console.log(`[API] ${config.method?.toUpperCase() ?? "GET"} ${path}`);
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (__DEV__) {
      const status = error.response?.status;
      const data = error.response?.data;
      console.warn("[API] error", status, error.message, data ?? error.code);
    }
    return Promise.reject(error);
  },
);
