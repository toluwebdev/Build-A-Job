import mongoose from "mongoose";
const jobSchema = mongoose.Schema({
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
        enum: ["pending", "accepted", "rejected", "completed"],
        default: "pending",
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
    budget:{
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
    
    
})