/**
 * Singleton Socket.IO Client Instance
 * Penanggung Jawab: Anggota 4
 */

import { io } from "socket.io-client";

let socket = null;

const resolveSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "");
  }
  return "http://localhost:5000";
};

export const getSocket = () => {
  if (!socket && typeof window !== "undefined") {
    socket = io(resolveSocketUrl(), {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export default getSocket;
