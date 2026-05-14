import mongoose from "mongoose"
const messageSchema= mongoose.Schema({
    jobId:{type: mongoose.Schema.Types.ObjectId, ref:"Job", required: true},
    senderId:{type: mongoose.Schema.Types.ObjectId, ref:"User", required: true},
    recipientId:{type: mongoose.Schema.Types.ObjectId, ref:"User", required: true},
    body:{type: String, required: true},
    attachments:{type: [String], default: []},
}, {timestamps: true})
const Message = mongoose.model("Message", messageSchema)
export default Message;