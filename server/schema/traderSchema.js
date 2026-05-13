import mongoose from "mongoose";

const traderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyName: { type: String, required: true },
    bio: { type: String, required: true },
    services: { type: [String], required: true },
    coverageAreas: { type: [String], required: true },
    dayRate: { type: Number, required: true },
    certifications: { type: [String], required: true },
    portfolioImages: { type: [String], required: true },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    leadCredits: { type: Number, required: true },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);
const Trader = mongoose.model("Trader", traderSchema);
export default Trader;
