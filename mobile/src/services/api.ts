import axios from "axios";
import Constants from "expo-constants";

function getApiBaseUrl() {
  const fromExtra =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Constants.expoConfig as any)?.extra?.apiBaseUrl ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Constants.manifest as any)?.extra?.apiBaseUrl;

  if (typeof fromExtra === "string" && fromExtra.length) return fromExtra;

  // Android emulator localhost
  return "http://10.0.2.2:4000";
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 20000,
});

