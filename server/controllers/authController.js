import User from "../schema/userSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  sendPasswordResetOtpEmail,
  sendVerificationOtpEmail,
} from "../services/emailService.js";

const OTP_TTL_MS = 10 * 60 * 1000;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function signUserToken(user) {
  return jwt.sign(
    {
      id: String(user._id),
      role: user.role,
      email: user.email,
      fn: user.firstName,
      ln: user.lastName,
      v: user.isVerified === true,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }
    const otp = generateOtp();
    const verifyOtpExpireAt = Date.now() + OTP_TTL_MS;
    const hashedPassword = await bcrypt.hash(password, 10);

    const roleValue = role === "trader" || role === "user" ? role : "user";

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: roleValue,
      verifyOtp: otp,
      verifyOtpExpireAt,
    });
    await sendVerificationOtpEmail({
      to: user.email,
      firstName: user.firstName,
      otp,
    });

    const token = signUserToken(user);

    res.status(201).json({
      success: true,
      message: "An OTP has been sent to your email to verify your account",
      token,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res
        .status(400)
        .json({ success: false, message: "All fields are required" });
      return;
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
      return;
    }

    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
      return;
    }

    const token = signUserToken(user);

    if (!user.isVerified) {
      const otp = generateOtp();
      user.verifyOtp = otp;
      user.verifyOtpExpireAt = Date.now() + OTP_TTL_MS;
      await user.save();
      await sendVerificationOtpEmail({
        to: user.email,
        firstName: user.firstName,
        otp,
      });

      return res.status(200).json({
        success: true,
        message: "An OTP has been sent to your email to verify your account",
        token,
        requiresVerification: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: "User has successfully logged in",
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const logout = async (_req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logged out successfully. Remove the token on the client.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
      return;
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    if (user.isVerified) {
      res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
      return;
    }
    if (!user.verifyOtp || String(user.verifyOtp) !== String(otp)) {
      res.status(400).json({ success: false, message: "Invalid OTP" });
      return;
    }
    if (!user.verifyOtpExpireAt || Date.now() > user.verifyOtpExpireAt) {
      res.status(400).json({
        success: false,
        message: "OTP has expired. Request a new code.",
      });
      return;
    }

    user.isVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    const token = signUserToken(user);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    if (user.isVerified) {
      res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
      return;
    }

    const otp = generateOtp();
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + OTP_TTL_MS;
    await user.save();

    await sendVerificationOtpEmail({
      to: user.email,
      firstName: user.firstName,
      otp,
    });

    res.status(200).json({
      success: true,
      message: "A new verification code has been sent to your email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

async function sendPasswordResetOtp(email, res) {
  const normalized = email?.toLowerCase?.() ?? email;
  if (!normalized) {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }
  const user = await User.findOne({ email: normalized });
  if (!user) {
    res.status(200).json({
      success: true,
      message:
        "If an account exists for that email, a password reset code has been sent.",
    });
    return;
  }

  const otp = generateOtp();
  user.resetOtp = otp;
  user.resetOtpExpireAt = Date.now() + OTP_TTL_MS;
  await user.save();

  await sendPasswordResetOtpEmail({
    to: user.email,
    firstName: user.firstName,
    otp,
  });

  res.status(200).json({
    success: true,
    message:
      "If an account exists for that email, a password reset code has been sent.",
  });
}

export const forgotPassword = async (req, res) => {
  try {
    await sendPasswordResetOtp(req.body.email, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const sendResetPasswordEmail = async (req, res) => {
  try {
    await sendPasswordResetOtp(req.body.email, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
      return;
    }
    if (String(newPassword).length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
      return;
    }
    if (!user.resetOtp || String(user.resetOtp) !== String(otp)) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
      return;
    }
    if (!user.resetOtpExpireAt || Date.now() > user.resetOtpExpireAt) {
      res.status(400).json({
        success: false,
        message: "Reset code has expired. Request a new one.",
      });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password has been reset successfully. You can log in with your new password.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
    console.log(error.message);
  }
};
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Account deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
    console.log(error.message);
  }
};
