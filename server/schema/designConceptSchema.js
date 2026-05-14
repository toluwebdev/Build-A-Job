import mongoose from "mongoose";

const designConceptSchema = mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    label: {
      type: String,
    },
    beforeImage: {
      type: String,
      required: true,
    },
    afterImage: {
      type: String,
      default: "",
    },
    description: {
      type: String,
    },
    /** Raw or stringified structured output from AI design analysis */
    analysis: {
      type: String,
    },
  },
  { timestamps: true },
);

const DesignConcept = mongoose.model("DesignConcept", designConceptSchema);
export default DesignConcept;
