import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import connectDB from "../config/db.js";

// Routes
import ownerRoutes from "./routes/ownerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import kosRoutes from "./routes/kosRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

// Service
import { saveMessageService } from "./services/chatService.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Inisialisasi Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing API
app.use("/api/owner", ownerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/favorite", favoriteRoutes);
app.use("/api/kos", kosRoutes);
app.use("/api/chat", chatRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API CariKos & Chat Real-Time berhasil berjalan!",
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
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Terjadi kesalahan pada server",
  });
});

// Real-Time WebSocket Logic (Socket.IO)
io.on("connection", (socket) => {
  console.log(`[Socket.IO] Client terhubung: ${socket.id}`);

  // User masuk ke room sesuai User ID mereka
  socket.on("joinRoom", (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`[Socket.IO] User ${userId} masuk ke room pribadi`);
    }
  });

  // Menerima event kirim pesan dari client
  socket.on("sendMessage", async (payload, callback) => {
    try {
      const { senderId, receiverId, kosId, pesan } = payload;
      if (!senderId || !receiverId || !pesan) {
        if (callback) callback({ success: false, message: "Field tidak lengkap" });
        return;
      }

      // Simpan pesan ke MongoDB
      const savedMessage = await saveMessageService(senderId, receiverId, kosId, pesan);

      // Pancarkan langsung ke penerima di room miliknya
      io.to(receiverId.toString()).emit("receiveMessage", savedMessage);

      // Berikan respons balik ke pengirim
      socket.emit("messageSent", savedMessage);

      if (callback) callback({ success: true, data: savedMessage });
    } catch (err) {
      console.error("[Socket.IO] Error pengiriman pesan:", err);
      if (callback) callback({ success: false, message: err.message });
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Client terputus: ${socket.id}`);
  });
});

// Hubungkan database terlebih dahulu, baru jalankan server
await connectDB();

server.listen(PORT, () => {
  console.log(`Server CariKos & Socket.IO running di: http://localhost:${PORT}`);
});
