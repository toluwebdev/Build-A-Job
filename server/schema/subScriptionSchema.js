import mongoose from "mongoose";
const subScriptionSchema = mongoose.Schema({
    traderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trader",
        required: true,
    },
    tier:{
        type: String,
        enum: ["free", "pro", "premium"],
        default: "free",
        required: true,
    },
    stripeSubscriptionId:{
        type: String,
    },
    currentPeriodStart:{
        type: Number,
    },
    currentPeriodEnd:{
        type: Number,
    },
    status:{
        type: String,
        enum: ["active", "inactive", "cancelled"],
        default: "active",
    }
}, {timestamps: true})
const Subscription = mongoose.model("Subscription", subScriptionSchema)
export default Subscription