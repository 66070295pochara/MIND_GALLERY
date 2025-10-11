
import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
  },
  email:{
    type: String,
    require: true,
    trim: true,
    lowercase: true,
    unique: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
 
  role:{
    type: String,
    default: "user",

  },
  aboutMe: { type: String, default: "", trim: true, maxlength: 200 } 
}, {timestamps: true})

const User = mongoose.model("User", UserSchema);

export default User