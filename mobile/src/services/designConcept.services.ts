import * as FileSystem from "expo-file-system";

import { api } from "./api";

export type ConceptStylePayload = { name: string; material?: string };

export type AnalyzeConceptsResponse = {
  success: boolean;
  message?: string;
  model?: string;
  imageModel?: string;
  analysis?: Record<string, unknown>;
  concepts?: Array<{
    styleName: string;
    materialHint?: string;
    afterImageUrl: string | null;
    error?: string;
  }>;
  disclaimer?: string;
};

function guessMimeFromUri(uri: string): "image/jpeg" | "image/png" {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  return "image/jpeg";
}

/** Read a local file:// or app cache image URI into a data URL for the analyze API. */
export async function readLocalImageAsDataUrl(uri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: "base64",
  });
  const mime = guessMimeFromUri(uri);
  return `data:${mime};base64,${base64}`;
}

export async function analyzeDesignConceptsFromPhoto(params: {
  localPhotoUri: string;
  context?: string;
  conceptStyles: ConceptStylePayload[];
  includeAfterImages?: boolean;
}): Promise<AnalyzeConceptsResponse> {
  const { localPhotoUri, context, conceptStyles, includeAfterImages = true } = params;
  const imageBase64 = await readLocalImageAsDataUrl(localPhotoUri);
  const { data } = await api.post<AnalyzeConceptsResponse>(
    "/design-concepts/analyze",
    {
      imageBase64,
      context,
      conceptStyles,
      includeAfterImages,
    },
    { timeout: 240_000 },
  );
  return data;
}
