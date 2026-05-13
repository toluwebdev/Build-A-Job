import mongoose from "mongoose";

const designConceptSchema = mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
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
        required: true,
    },
    description: {
        type: String,
    },
    
})