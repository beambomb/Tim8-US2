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
import { chatService } from "../features/chat/services/chatService";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const currentUserId = user?._id || user?.id;

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [latestChatAlert, setLatestChatAlert] = useState(null);

  const refreshUnreadMessages = useCallback(async () => {
    if (!isAuthenticated || !currentUserId) {
      setUnreadMessages(0);
      return;
    }
    try {
      const res = await chatService.getInbox();
      const list = Array.isArray(res?.data) ? res.data : [];
      const totalUnread = list.reduce(
        (sum, conv) => sum + (Number(conv?.unreadCount) || 0),
        0
      );
      setUnreadMessages(totalUnread);
    } catch {
      // Ignore silent background unread fetch errors
    }
  }, [isAuthenticated, currentUserId]);

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated || !currentUserId) {
      queueMicrotask(() => {
        if (cancelled) return;
        setSocket(null);
        setIsConnected(false);
        setUnreadNotifications(0);
        setLatestNotification(null);
        setUnreadMessages(0);
        setLatestChatAlert(null);
      });
      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(() => {
      if (!cancelled) refreshUnreadMessages();
    });

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

    const handleReceiveMessage = (msg) => {
      const rawSender = msg?.senderId;
      const senderId =
        typeof rawSender === "string"
          ? rawSender
          : rawSender?._id || rawSender?.id || "";

      if (!senderId || String(senderId) === String(currentUserId)) return;

      const currentPath =
        typeof window !== "undefined" ? window.location?.pathname || "" : "";
      const isViewingThisChat = currentPath.endsWith(`/chat/${senderId}`);

      if (!isViewingThisChat) {
        setUnreadMessages((prev) => prev + 1);
        setLatestChatAlert({
          id: msg?._id || `${senderId}-${Date.now()}`,
          senderId: String(senderId),
          senderName:
            (typeof rawSender === "object" && rawSender?.nama) || "Pesan Baru",
          pesan: msg?.pesan || "",
        });
      }
    };

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);
    socketInstance.on("notification", handleNotification);
    socketInstance.on("receiveMessage", handleReceiveMessage);

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
      socketInstance.off("receiveMessage", handleReceiveMessage);
      socketInstance.disconnect();
    };
  }, [isAuthenticated, currentUserId, refreshUnreadMessages]);

  const clearLatestNotification = useCallback(() => {
    setLatestNotification(null);
  }, []);

  const clearLatestChatAlert = useCallback(() => {
    setLatestChatAlert(null);
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
      unreadMessages,
      latestChatAlert,
      clearLatestNotification,
      clearLatestChatAlert,
      refreshUnreadMessages,
      resetUnreadNotifications,
      decrementUnreadNotifications,
    }),
    [
      socket,
      isConnected,
      unreadNotifications,
      latestNotification,
      unreadMessages,
      latestChatAlert,
      clearLatestNotification,
      clearLatestChatAlert,
      refreshUnreadMessages,
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

export function useOptionalSocket() {
  return useContext(SocketContext);
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket harus digunakan di dalam SocketProvider");
  }
  return context;
}
