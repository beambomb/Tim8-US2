"use client";

/**
 * Global Socket.IO Context & Push Notification Listener
 * Penanggung Jawab: Anggota 4
 */

import { createContext, useContext, useEffect, useState } from "react";
import { getSocket } from "../lib/socket";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      const socketInstance = getSocket();
      socketInstance.connect();

      // Gabung ke room pribadi pengguna
      socketInstance.emit("joinRoom", user._id);
      setSocket(socketInstance);

      // Dengarkan event notifikasi real-time
      socketInstance.on("notification", (notif) => {
        setLatestNotification(notif);
        setUnreadNotifications((prev) => prev + 1);
      });

      return () => {
        socketInstance.off("notification");
        socketInstance.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        unreadNotifications,
        latestNotification,
        clearLatestNotification: () => setLatestNotification(null),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket harus digunakan di dalam SocketProvider");
  }
  return context;
}
