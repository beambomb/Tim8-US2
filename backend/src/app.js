import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import { getCorsOptions } from "./config/env.js";

// Routes
import ownerRoutes from "./routes/ownerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import kosRoutes from "./routes/kosRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

/**
 * Membangun instance Express application tanpa langsung mengikat port atau DB.
 */
export function createApp() {
  const app = express();

  // Middlewares
  app.use(helmet());
  app.use(cors(getCorsOptions()));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routing API
  app.use("/api/owner", ownerRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/favorites", favoriteRoutes);
  app.use("/api/favorite", favoriteRoutes);
  app.use("/api/kos", kosRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/notifications", notificationRoutes);

  // Health Check
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "API CariKos & Chat Real-Time berhasil berjalan!",
    });
  });

  app.get("/api/health", (req, res) => {
    const dbReady = mongoose.connection.readyState === 1;
    res.status(200).json({
      success: true,
      status: "ok",
      uptime: Math.round(process.uptime()),
      database: dbReady ? "connected" : "disconnected",
    });
  });

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Endpoint ${req.originalUrl} tidak ditemukan`,
    });
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
      return res.status(400).json({
        success: false,
        message: "Format JSON request tidak valid",
      });
    }
    res.status(err.status || err.statusCode || 500).json({
      success: false,
      message: err.message || "Terjadi kesalahan pada server",
    });
  });

  return app;
}

export default createApp;
