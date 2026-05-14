import type { DesignAnalysisPayload } from "../context/CreateJobContext";

/** Builds job description text from AI analysis (kept short for form validation). */
export function formatDesignAnalysisForJobDescription(
  a: DesignAnalysisPayload,
  maxLen = 500,
): string {
  const parts: string[] = [];
  if (typeof a.summary === "string" && a.summary.trim()) {
    parts.push(a.summary.trim());
  }
  if (typeof a.spaceType === "string" && a.spaceType.trim()) {
    parts.push(`Space: ${a.spaceType.trim()}.`);
  }
  if (Array.isArray(a.materialsDetected) && a.materialsDetected.length > 0) {
    parts.push(
      `Materials noted: ${a.materialsDetected
        .filter((m) => typeof m === "string")
        .slice(0, 6)
        .join(", ")}.`,
    );
  }
  if (Array.isArray(a.nextStepsForHomeowner) && a.nextStepsForHomeowner.length > 0) {
    const ideas = a.nextStepsForHomeowner
      .filter((s) => typeof s === "string")
      .slice(0, 2)
      .join(" ");
    if (ideas) parts.push(`Next steps: ${ideas}`);
  }
  let out = parts.join(" ").replace(/\s+/g, " ").trim();
  if (out.length > maxLen) {
    out = `${out.slice(0, maxLen - 1)}…`;
  }
  return out;
}
