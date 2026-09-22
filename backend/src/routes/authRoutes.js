import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public Route
router.post("/register", register);
router.post("/login", login);

// Private Route
router.get("/me", verifyToken, getMe);

export default router;
