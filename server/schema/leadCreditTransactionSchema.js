import mongoose from "mongoose"
const leadCreditTransactionSchema = mongoose.Schema({
    tradeId:{type: mongoose.Schema.Types.ObjectId, ref:"Trader", required: true},
    type:{type: String, enum:["purchase", "deduction", "refund"], required: true},
    amount:{type: Number, required: true},
    balanceAfter:{type: Number, required: true},
    jobId:{type: mongoose.Schema.Types.ObjectId, ref:"Job"},
    stripePaymentIntentId:{type: String},
    

},{timestamps: true})
const LeadCreditTransaction = mongoose.model("LeadCreditTransaction", leadCreditTransactionSchema)
export default LeadCreditTransaction;