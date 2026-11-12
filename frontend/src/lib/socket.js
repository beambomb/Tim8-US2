/**
 * Singleton Socket.IO Client Instance
 * Penanggung Jawab: Anggota 4
 */

import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket && typeof window !== "undefined") {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export default getSocket;
