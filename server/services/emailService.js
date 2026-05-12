import transporter from "../config/nodemailer.js";
import {
  htmlPasswordReset,
  htmlVerification,
  plainTextPasswordReset,
  plainTextVerification,
} from "../emails/templates.js";

const OTP_EXPIRES_MINUTES = 10;

function brandName() {
  return process.env.EMAIL_BRAND_NAME?.trim() || "Build-A-Job";
}

function getFromAddress() {
  const from = process.env.SENDER_EMAIL;
  if (!from) {
    throw new Error("SENDER_EMAIL is not set");
  }
  return from;
}

/**
 * @param {{ to: string; firstName?: string; otp: string; expiresMinutes?: number }} opts
 */
export async function sendVerificationOtpEmail(opts) {
  const { to, firstName, otp, expiresMinutes = OTP_EXPIRES_MINUTES } = opts;
  const html = htmlVerification({ firstName, otp, expiresMinutes });
  const text = plainTextVerification({ otp, expiresMinutes });

  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject: `Verify your ${brandName()} account`,
    text,
    html,
  });
}

/**
 * @param {{ to: string; firstName?: string; otp: string; expiresMinutes?: number }} opts
 */
export async function sendPasswordResetOtpEmail(opts) {
  const { to, firstName, otp, expiresMinutes = OTP_EXPIRES_MINUTES } = opts;
  const html = htmlPasswordReset({ firstName, otp, expiresMinutes });
  const text = plainTextPasswordReset({ otp, expiresMinutes });

  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject: `Reset your ${brandName()} password`,
    text,
    html,
  });
}
