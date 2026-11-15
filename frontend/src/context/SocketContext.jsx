"use client";

/**
 * Global Socket.IO Context & Push Notification Listener
 * Penanggung Jawab: Anggota 4
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getSocket } from "../lib/socket";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const currentUserId = user?._id || user?.id;

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated || !currentUserId) {
      queueMicrotask(() => {
        if (cancelled) return;
        setSocket(null);
        setIsConnected(false);
        setUnreadNotifications(0);
        setLatestNotification(null);
      });
      return () => {
        cancelled = true;
      };
    }

    const socketInstance = getSocket();
    if (!socketInstance) {
      return () => {
        cancelled = true;
      };
    }

    const handleConnect = () => {
      setIsConnected(true);
      socketInstance.emit("joinRoom", String(currentUserId));
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleNotification = (notif) => {
      setLatestNotification(notif);
      setUnreadNotifications((prev) => prev + 1);
    };

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);
    socketInstance.on("notification", handleNotification);

    queueMicrotask(() => {
      if (cancelled) return;
      setSocket(socketInstance);
      if (socketInstance.connected) {
        setIsConnected(true);
      }
    });

    if (socketInstance.connected) {
      socketInstance.emit("joinRoom", String(currentUserId));
    } else {
      socketInstance.connect();
    }

    return () => {
      cancelled = true;
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      socketInstance.off("notification", handleNotification);
      socketInstance.disconnect();
    };
  }, [isAuthenticated, currentUserId]);

  const clearLatestNotification = useCallback(() => {
    setLatestNotification(null);
  }, []);

  const resetUnreadNotifications = useCallback(() => {
    setUnreadNotifications(0);
  }, []);

  const decrementUnreadNotifications = useCallback((amount = 1) => {
    const step = Number.isFinite(Number(amount)) ? Math.max(0, Number(amount)) : 1;
    setUnreadNotifications((prev) => Math.max(0, prev - step));
  }, []);

  const contextValue = useMemo(
    () => ({
      socket,
      isConnected,
      unreadNotifications,
      latestNotification,
      clearLatestNotification,
      resetUnreadNotifications,
      decrementUnreadNotifications,
    }),
    [
      socket,
      isConnected,
      unreadNotifications,
      latestNotification,
      clearLatestNotification,
      resetUnreadNotifications,
      decrementUnreadNotifications,
    ]
  );

  return (
    <SocketContext.Provider value={contextValue}>
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
