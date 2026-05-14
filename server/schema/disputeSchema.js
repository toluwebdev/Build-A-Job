import mongoose from "mongoose";
const disputeSchema = mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
    },
    raisedById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    evidenceUrls:{
        type: [String],
        required: true,
    },
    status:{
        type: String,
        enum: ["open",  "resolved"],
        default: "open",

    },
    outComeNotes:{
        type: String,
    },
    adminId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    resolvedAt:{
        type: Number,
    },
}, {timestamps: true})
const Dispute = mongoose.model("Dispute", disputeSchema)
export default Dispute