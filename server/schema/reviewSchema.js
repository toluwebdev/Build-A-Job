import mongoose from "mongoose"
const reviewSchema = mongoose.Schema({
    jobId:{type: mongoose.Schema.Types.ObjectId, ref:"Job", required: true},
    reviewerId:{type: mongoose.Schema.Types.ObjectId, ref:"User", required: true},
    reviewee_id:{type: mongoose.Schema.Types.ObjectId, ref:"User", required: true},
    rating:{type: Number, required: true, min: 1, max: 5},
    body:{type: String, required: true},
    afterPhotos:{type: [String], default: []},
    traderesponse:{type: String},
    status:{type: String, enum:["pending", "approved", "rejected"], default: "pending"},
}, {timestamps: true})
const Review = mongoose.model("Review", reviewSchema)
export default Review;