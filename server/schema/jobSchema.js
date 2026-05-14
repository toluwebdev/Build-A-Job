import mongoose from "mongoose";
const jobSchema = mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active","quotes", "inProgress", "completed"],
      default: "active",
    },
    description: {
      type: String,
      required: true,
    },
    timingPreference: {
      type: String,
      enum: ["ASAP", "FLEXIBLE", "PLANNING"],
      default: "FLEXIBLE",
    },
    budget: {
      type: Number,
      required: true,
    },
    budgetType: {
      type: String,
      enum: ["FIXED", "RANGE"],
      default: "FIXED",
    },
    budgetMin: {
      type: Number,
      required: true,
    },
    budgetMax: {
      type: Number,
      required: true,
    },
    postCode: {
      type: String,
      required: true,
    },
    designConcept: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DesignConcept",
      required: true,
    },
    photos: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true },
);
const Job = mongoose.model("Job", jobSchema);
export default Job;
