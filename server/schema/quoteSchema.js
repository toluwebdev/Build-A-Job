import mongoose from "mongoose"
const quoteSchema = mongoose.Schema({
    jobId:{type: mongoose.Schema.Types.ObjectId, ref:"Job", required: true},
    traderId:{type: mongoose.Schema.Types.ObjectId, ref:"Trader", required: true},
    amount :{type: Number, required: true},
    vat_included :{type: Boolean, default: false},
    startDats:{type: Date, required: true},
    durationDays:{type: Number, required: true},
    paymentTerms:{type: String, required: true},
    notes:{type: String, required: true},
    designConceptId:{type: mongoose.Schema.Types.ObjectId, ref:"DesignConcept", required: true},
    status:{type:String, enum:["submitted", "accepted", "rejected", "withdrawn"]}

},{timestamps: true})
const Quote = mongoose.model("Quote", quoteSchema)
export default Quote