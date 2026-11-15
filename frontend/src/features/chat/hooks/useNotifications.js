'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { chatService } from '../services/chatService';

const getNotificationId = (item) => item?._id || item?.id || null;

const isNotificationRead = (item) => Boolean(item?.isRead || item?.dibaca);

export function useNotifications() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    unreadNotifications,
    latestNotification,
    clearLatestNotification,
    resetUnreadNotifications,
    decrementUnreadNotifications,
  } = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await chatService.getNotifications();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setNotifications(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat notifikasi.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (authLoading) return;

      if (!isAuthenticated) {
        await Promise.resolve();
        if (!ignore) {
          setNotifications([]);
          setError(null);
          setIsLoading(false);
        }
        return;
      }

      await Promise.resolve();
      if (ignore) return;
      setIsLoading(true);
      setError(null);

      try {
        const res = await chatService.getNotifications();
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (!ignore) {
          setNotifications(list);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || 'Gagal memuat notifikasi.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (!latestNotification) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setNotifications((prev) => {
        const incomingId = getNotificationId(latestNotification);
        if (incomingId && prev.some((n) => String(getNotificationId(n)) === String(incomingId))) {
          return prev;
        }
        return [latestNotification, ...prev];
      });
    });

    const timer = setTimeout(() => {
      clearLatestNotification?.();
    }, 5000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [latestNotification, clearLatestNotification]);

  const markAsRead = useCallback(
    async (id) => {
      if (!id) return;
      try {
        await chatService.markNotificationRead(id);
        setNotifications((prev) =>
          prev.map((item) =>
            String(getNotificationId(item)) === String(id)
              ? { ...item, isRead: true, dibaca: true }
              : item
          )
        );
        decrementUnreadNotifications?.(1);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal menandai notifikasi dibaca.');
      }
    },
    [decrementUnreadNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await chatService.markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true, dibaca: true }))
      );
      resetUnreadNotifications?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menandai semua notifikasi dibaca.');
    }
  }, [resetUnreadNotifications]);

  const localUnreadCount = useMemo(
    () => notifications.filter((item) => !isNotificationRead(item)).length,
    [notifications]
  );

  const unreadCount = useMemo(
    () => Math.max(localUnreadCount, unreadNotifications || 0),
    [localUnreadCount, unreadNotifications]
  );

  return {
    notifications,
    unreadCount,
    unreadNotifications,
    latestNotification,
    clearLatestNotification,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refetchNotifications: fetchNotifications,
  };
}
