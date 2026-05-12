import express from "express";
import {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  sendResetPasswordEmail,
  getUser,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleWare.js";
const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password", resetPassword);
authRoutes.post("/verify-email", verifyEmail);
authRoutes.post("/resend-verification-email", resendVerificationEmail);
authRoutes.post("/send-reset-password-email", sendResetPasswordEmail);
authRoutes.get("/user", authMiddleware, getUser);
authRoutes.delete("/delete-account", authMiddleware, deleteAccount);
export default authRoutes;
