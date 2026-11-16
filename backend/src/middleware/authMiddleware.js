import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/env.js";

export const verifyToken = (req, res, next) => {
  let token;

  // Memeriksa apakah request memiliki header 'Authorization' dengan format 'Bearer <token>'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    const jwtSecret = getJwtSecret();
    try {
      // Memisahkan kata 'Bearer' dan mengambil tokennya saja
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, jwtSecret);

      req.user = decoded;

      next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Tidak mendapat otorisasi, token gagal divalidasi" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Tidak mendapat otorisasi, tidak ada token" });
  }
};

// Middleware otorisasi berdasarkan persona/role (Role-Based Access Control)
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: role '${req.user?.role || "Guest"}' tidak memiliki akses ke endpoint ini`
      });
    }
    next();
  };
};
