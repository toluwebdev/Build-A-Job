/** Escape text for HTML email bodies (OTP codes are still escaped for safety). */
export function escapeHtml(value) {
  if (value == null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
