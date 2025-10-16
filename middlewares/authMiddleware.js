import jwt from "jsonwebtoken"
import userService from "../services/userService.js";

const authMiddleware = (requiredRole) => {
  return async (req, res, next) => {
    try {

      //ดึงtoken จากcookie
      const token = req.cookies?.authToken; 
  

     if(!token){
      return res.status(401).json({message: "Unauthorized"});
     }

      const jwt_secret = process.env.JWT_SECRET;
      if (!jwt_secret) {
        console.error("JWT_SECRET is missing");
        return res.status(500).json({ message: "Server misconfiguration" });
      }
      const decoded = jwt.verify(token, jwt_secret);

      const user = await userService.getUserById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({ message: "Forbidden" });
      }
        
      req.user = { id: decoded.userId, role: user.role, name: user.name };

      return next();
      } 
      catch (err) {
      return res.status(401).json({  message: "Unauthorized"})
    }
  }
}

export default authMiddleware
