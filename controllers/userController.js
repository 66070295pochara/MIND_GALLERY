import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import userService from "../services/userService.js"
import mongoose from "mongoose";
import User from "../models/User.js";

const userController = {
  getMe: async (req, res) => {
    try{
        if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const userId = req.user.id  
      const user = await User.findById(userId)
      .select("_id name email createdAt aboutMe")

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
        res.status(200).json(user)  
    } catch(err) {
      res.status(500).json(err)
    }
  },

  updateAboutMe : async (req, res) => {
    try{
        const { aboutme } = req.body;
        const text = aboutme.trim()
        const user = await User.findByIdAndUpdate(
        req.user.id,  { $set: { aboutMe: text } },{ aboutMe: text },{ new: true }
        ).select("_id name email aboutMe");
        if (!user) return res.status(404).json({ message: "User not found" });
        

      
        res.status(200).json(user) 
    }catch(err){
      res.status(500).json(err)
    }
  },



  register: async (req, res) => {
    try{
     
      const { name, password, email } = req.body
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await userService.create(name, email, hashedPassword)
      res.status(201).json(user)
    } catch(err){
      res.status(500).json(err)
    }
  },


  login: async (req, res) => {
    const { name,  password } = req.body
    const user = await userService.getByUsername(name);
    if(!user){
       return res.status(401).json({ message: "Username or Password incorrect" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
       return res.status(401).json({ message: "Username or Password incorrect" });
    }
    
    const jwt_secret = process.env.JWT_SECRET;
    const payload = { name: user.name, userId: user.id, role: user.role}
    // สร้าง token
    const token = jwt.sign(payload, jwt_secret, { expiresIn: "1d" });
     res.cookie("authToken", token, {
            httpOnly: true,
            maxAge: 24*60*60*1000,
            sameSite: "strict"
      })
    
    return res.json({
      message: "success"
    })
    // res.status(200).json({
    //   token: token,
    //   message: "login success"
    // })
    
  },

  logout: async (req, res) =>{
     res.clearCookie("authToken", {
      httpOnly: true,
      sameSite: "strict"
  })
  return res.json({
      message: "clear cookie success"
    })
  },
  
  deleteMe : async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json("Account deleted successfully")
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete account" });
  }
  },


  getMyLikedImages: async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: "likedImages",
        select: "_id userId originalName authorName storedName description isPublic createdAt",
        populate: { path: "userId", select: "_id name" }
      })
      .select("likedImages");

    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

      const images = user.likedImages.map(img => {
      const userId = img.userId?._id ? String(img.userId._id) : String(img.userId || "unknown");

      return {
        _id: img._id,
        userId,
        authorName: img.authorName,
        originalName: img.originalName,
        storedName: img.storedName,
        description: img.description || "",
        isPublic: !!img.isPublic,
        createdAt: img.createdAt,
        url: `/uploads/${userId}/${img.storedName}`
      };
    });

    res.status(200).json({ ok: true, count: images.length, images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Fail to get liked images" });
  }
  }
}

export default userController