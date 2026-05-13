import mongoose from "mongoose";

const mongooseSchema = mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    role: {
      type: String,
      enum: ["customer", "trader", "admin"],
      default: "customer",
    },
    phone: { type: String },
    postalCode: { type: String },
    profilePicture: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    verifyOtp: { type: String, default: "" },
    verifyOtpExpireAt: { type: Number, default: 0 },
    resetOtp: { type: String, default: "" },
    resetOtpExpireAt: { type: Number, default: 0 },
  },
  { timestamps: true },
);
const User = mongoose.model("User", mongooseSchema);
export default User;
