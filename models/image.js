//เก็บdata รูปภาพที่อัพโหลด
import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  originalName: String,
  storedName: String,
  mime: String,
  size: Number,
  path: String,
}, { timestamps: true });

export default mongoose.model('Image', ImageSchema);
