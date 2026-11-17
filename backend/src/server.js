import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import { createApp } from "./app.js";
import { getCorsOptions, validateRuntimeEnv } from "./config/env.js";

// Service
import { saveMessageService } from "./services/chatService.js";

dotenv.config();

const app = createApp();
const server = http.createServer(app);

// Inisialisasi Socket.IO
const io = new Server(server, {
  cors: getCorsOptions(),
});

app.set("io", io);

const PORT = process.env.PORT || 5000;

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
      const { senderId, receiverId, kosId, pesan } = payload || {};
      const trimmedMessage = String(pesan || "").trim();
      if (!senderId || !receiverId || !trimmedMessage) {
        if (callback) callback({ success: false, message: "Field tidak lengkap" });
        return;
      }

      if (String(senderId) === String(receiverId)) {
        if (callback) callback({ success: false, message: "Tidak dapat mengirim pesan ke diri sendiri" });
        return;
      }

      // Simpan pesan ke MongoDB
      const savedMessage = await saveMessageService(senderId, receiverId, kosId, trimmedMessage);

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

// Validasi environment & hubungkan database terlebih dahulu, baru jalankan server
validateRuntimeEnv();
await connectDB();

server.listen(PORT, () => {
  console.log(`Server CariKos & Socket.IO running di: http://localhost:${PORT}`);
});
