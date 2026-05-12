import { escapeHtml } from "./escape.js";

const BRAND =
  typeof process.env.EMAIL_BRAND_NAME === "string" &&
  process.env.EMAIL_BRAND_NAME.trim()
    ? process.env.EMAIL_BRAND_NAME.trim()
    : "Build-A-Job";

const SUPPORT_EMAIL =
  typeof process.env.SUPPORT_EMAIL === "string" &&
  process.env.SUPPORT_EMAIL.trim()
    ? process.env.SUPPORT_EMAIL.trim()
    : "";

/**
 * Outer layout: works in Gmail, Outlook-ish clients (tables + inline CSS).
 */
function layout({ preheader, title, innerHtml }) {
  const safePre = escapeHtml(preheader);
  const safeTitle = escapeHtml(title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${safeTitle}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0f0f14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">${safePre}</span>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#0f0f14;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background-color:#16161d;border-radius:16px;overflow:hidden;border:1px solid #27272f;">
          <tr>
            <td style="background:linear-gradient(135deg,#7b5cf6 0%,#00d4aa 100%);padding:28px 24px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">${escapeHtml(
                BRAND,
              )}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 24px;color:#e4e4e7;font-size:16px;line-height:1.6;">
              ${innerHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;color:#71717a;font-size:13px;line-height:1.5;border-top:1px solid #27272f;">
              <p style="margin:20px 0 8px;">If you didn’t request this email, you can safely ignore it.</p>
              ${
                SUPPORT_EMAIL
                  ? `<p style="margin:0;">Questions? <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}" style="color:#a78bfa;text-decoration:none;">${escapeHtml(SUPPORT_EMAIL)}</a></p>`
                  : ""
              }
              <p style="margin:16px 0 0;font-size:12px;color:#52525b;">© ${new Date().getFullYear()} ${escapeHtml(BRAND)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function plainTextVerification({ otp, expiresMinutes }) {
  const mins = expiresMinutes ?? 10;
  return `Your ${BRAND} verification code is ${otp}. It expires in ${mins} minutes. Do not share this code with anyone.`;
}

export function htmlVerification({ firstName, otp, expiresMinutes }) {
  const name = firstName?.trim() ? escapeHtml(firstName.trim()) : "there";
  const safeOtp = escapeHtml(otp);
  const mins = expiresMinutes ?? 10;

  const inner = `
    <p style="margin:0 0 16px;color:#e4e4e7;">Hi ${name},</p>
    <p style="margin:0 0 24px;color:#a1a1aa;">Use this code to verify your email address:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding:20px 16px;background-color:#1e1e26;border-radius:12px;border:1px dashed #3f3f46;">
          <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:0.35em;color:#ffffff;font-family:'Courier New',Consolas,monospace;">${safeOtp}</p>
        </td>
      </tr>
    </table>
    <p style="margin:24px 0 0;color:#71717a;font-size:14px;">This code expires in <strong style="color:#e4e4e7;">${escapeHtml(
      String(mins),
    )} minutes</strong>. Never share this code with anyone.</p>
  `;

  return layout({
    preheader: `Your verification code is ${otp}. Expires in ${mins} minutes.`,
    title: `Verify your ${BRAND} account`,
    innerHtml: inner,
  });
}

export function plainTextPasswordReset({ otp, expiresMinutes }) {
  const mins = expiresMinutes ?? 10;
  return `Your ${BRAND} password reset code is ${otp}. It expires in ${mins} minutes. If you didn’t request a reset, ignore this email.`;
}

export function htmlPasswordReset({ firstName, otp, expiresMinutes }) {
  const name = firstName?.trim() ? escapeHtml(firstName.trim()) : "there";
  const safeOtp = escapeHtml(otp);
  const mins = expiresMinutes ?? 10;

  const inner = `
    <p style="margin:0 0 16px;color:#e4e4e7;">Hi ${name},</p>
    <p style="margin:0 0 24px;color:#a1a1aa;">We received a request to reset your password. Use this code:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding:20px 16px;background-color:#1e1e26;border-radius:12px;border:1px dashed #3f3f46;">
          <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:0.35em;color:#ffffff;font-family:'Courier New',Consolas,monospace;">${safeOtp}</p>
        </td>
      </tr>
    </table>
    <p style="margin:24px 0 0;color:#71717a;font-size:14px;">This code expires in <strong style="color:#e4e4e7;">${escapeHtml(
      String(mins),
    )} minutes</strong>. If you didn’t ask for a reset, you can ignore this message — your password won’t change.</p>
  `;

  return layout({
    preheader: `Password reset code: ${otp}. Expires in ${mins} minutes.`,
    title: `Reset your ${BRAND} password`,
    innerHtml: inner,
  });
}
