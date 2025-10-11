import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  imageId: { type: mongoose.Schema.Types.ObjectId, ref: "Image", required: true },
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true },
  text:    { type: String, required: true, trim: true, maxlength: 100 }
},{timestamps: true});



export default mongoose.model("Comment", commentSchema);