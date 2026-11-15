import express from "express";
import {
  register,
  login,
  getMe,
  addSavedCampus,
  removeSavedCampus,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Route
router.post("/register", register);
router.post("/login", login);

// Private Route
router.get("/me", verifyToken, getMe);
router.post("/campuses", verifyToken, addSavedCampus);
router.delete("/campuses/:campusId", verifyToken, removeSavedCampus);

export default router;
