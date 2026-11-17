'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { chatService } from '../services/chatService';

const extractEntityId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value._id || value.id || null;
};

export function useChat(targetUserId = null, kosId = null) {
  const { socket, isConnected, refreshUnreadMessages } = useSocket();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const currentUserId = user?._id || user?.id;

  const [inbox, setInbox] = useState([]);
  const [messages, setMessages] = useState([]);
  const [kosContext, setKosContext] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const fetchInbox = useCallback(async () => {
    if (!isAuthenticated || !currentUserId) return;
    setError(null);
    try {
      const res = await chatService.getInbox();
      setInbox(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat daftar percakapan.');
    }
  }, [isAuthenticated, currentUserId]);

  const fetchMessages = useCallback(async () => {
    if (!targetUserId || !isAuthenticated || !currentUserId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [msgRes, kosRes] = await Promise.all([
        chatService.getMessages(targetUserId),
        kosId ? chatService.getKosContext(kosId).catch(() => null) : Promise.resolve(null),
      ]);
      setMessages(Array.isArray(msgRes?.data) ? msgRes.data : []);
      setKosContext(kosRes?.data || kosRes || null);
      refreshUnreadMessages?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat riwayat pesan.');
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId, kosId, isAuthenticated, currentUserId, refreshUnreadMessages]);

  useEffect(() => {
    let ignore = false;

    async function execute() {
      if (authLoading) return;

      if (!isAuthenticated || !currentUserId) {
        await Promise.resolve();
        if (!ignore) {
          setInbox([]);
          setMessages([]);
          setKosContext(null);
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
        if (targetUserId) {
          const [msgRes, kosRes] = await Promise.all([
            chatService.getMessages(targetUserId),
            kosId ? chatService.getKosContext(kosId).catch(() => null) : Promise.resolve(null),
          ]);
          if (!ignore) {
            setMessages(Array.isArray(msgRes?.data) ? msgRes.data : []);
            setKosContext(kosRes?.data || kosRes || null);
            refreshUnreadMessages?.();
          }
        } else {
          const res = await chatService.getInbox();
          if (!ignore) {
            setInbox(Array.isArray(res?.data) ? res.data : []);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
              (targetUserId ? 'Gagal memuat riwayat pesan.' : 'Gagal memuat daftar percakapan.')
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    execute();

    return () => {
      ignore = true;
    };
  }, [authLoading, isAuthenticated, currentUserId, targetUserId, kosId, refreshUnreadMessages]);

  const reconcileMessage = useCallback(
    (incomingMessage) => {
      if (!incomingMessage) return;

      const incomingId = incomingMessage._id || incomingMessage.id;
      const incomingSenderId =
        extractEntityId(incomingMessage.senderId) || extractEntityId(incomingMessage.sender);
      const incomingReceiverId =
        extractEntityId(incomingMessage.receiverId) || extractEntityId(incomingMessage.receiver);
      const incomingText = incomingMessage.pesan || incomingMessage.message || '';

      setMessages((prev) => {
        if (incomingId && prev.some((m) => String(m._id || m.id) === String(incomingId))) {
          return prev;
        }

        if (
          currentUserId &&
          incomingSenderId &&
          String(incomingSenderId) === String(currentUserId)
        ) {
          const tempIdx = prev.findIndex((m) => {
            if (!m.isOptimistic) return false;
            const mReceiverId = extractEntityId(m.receiverId) || extractEntityId(m.receiver);
            const mText = m.pesan || m.message || '';
            return (
              String(mReceiverId) === String(incomingReceiverId) &&
              mText.trim() === incomingText.trim()
            );
          });

          if (tempIdx !== -1) {
            const updated = [...prev];
            updated[tempIdx] = incomingMessage;
            return updated;
          }
        }

        return [...prev, incomingMessage];
      });
    },
    [currentUserId]
  );

  // Real-time socket listener for incoming & sent messages
  useEffect(() => {
    if (!socket || !currentUserId) return;

    const belongsToActiveConversation = (msg) => {
      if (!targetUserId) return false;
      const senderId = extractEntityId(msg?.senderId) || extractEntityId(msg?.sender);
      const receiverId = extractEntityId(msg?.receiverId) || extractEntityId(msg?.receiver);
      if (!senderId || !receiverId) return false;

      const isPartnerToMe =
        String(senderId) === String(targetUserId) &&
        String(receiverId) === String(currentUserId);
      const isMeToPartner =
        String(senderId) === String(currentUserId) &&
        String(receiverId) === String(targetUserId);

      return isPartnerToMe || isMeToPartner;
    };

    const handleReceiveMessage = (newMessage) => {
      if (!targetUserId) {
        fetchInbox();
        return;
      }
      if (belongsToActiveConversation(newMessage)) {
        reconcileMessage(newMessage);
      }
    };

    const handleMessageSent = (sentMessage) => {
      if (targetUserId && belongsToActiveConversation(sentMessage)) {
        reconcileMessage(sentMessage);
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('messageSent', handleMessageSent);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('messageSent', handleMessageSent);
    };
  }, [socket, targetUserId, currentUserId, reconcileMessage, fetchInbox]);

  const sendMessage = useCallback(
    async (text, overrideKosId = null) => {
      const trimmed = text?.trim();
      if (!trimmed || !targetUserId || !currentUserId) {
        return { success: false, error: 'Pesan tidak dapat dikirim.' };
      }

      const activeKosId = overrideKosId ?? kosId ?? null;
      const clientTempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const optimisticMsg = {
        _id: clientTempId,
        clientTempId,
        senderId: {
          _id: currentUserId,
          nama: user?.nama || 'Saya',
          email: user?.email,
          role: user?.role,
        },
        receiverId: targetUserId,
        kosId: kosContext || (activeKosId ? { _id: activeKosId } : null),
        pesan: trimmed,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setIsSending(true);
      setError(null);

      const removeOptimistic = () => {
        setMessages((prev) => prev.filter((m) => m._id !== clientTempId));
      };

      try {
        if (socket && isConnected) {
          const payload = {
            senderId: String(currentUserId),
            receiverId: String(targetUserId),
            kosId: activeKosId ? String(activeKosId) : null,
            pesan: trimmed,
          };

          const ackResult = await new Promise((resolve) => {
            let settled = false;
            const timeout = setTimeout(() => {
              if (!settled) {
                settled = true;
                resolve({ success: true, timeout: true });
              }
            }, 6000);

            socket.emit('sendMessage', payload, (ack) => {
              if (!settled) {
                settled = true;
                clearTimeout(timeout);
                resolve(ack || { success: true });
              }
            });
          });

          if (ackResult && ackResult.success === false) {
            throw new Error(ackResult.message || 'Gagal mengirim pesan melalui WebSocket.');
          }

          if (ackResult?.data) {
            reconcileMessage(ackResult.data);
          }
          return { success: true, data: ackResult?.data || null };
        }

        const res = await chatService.sendMessage(targetUserId, trimmed, activeKosId);
        if (res?.data) {
          reconcileMessage(res.data);
        }
        return { success: true, data: res?.data || null };
      } catch (err) {
        removeOptimistic();
        const errMsg =
          err.response?.data?.message || err.message || 'Gagal mengirim pesan.';
        setError(errMsg);
        return { success: false, error: errMsg };
      } finally {
        setIsSending(false);
      }
    },
    [
      targetUserId,
      currentUserId,
      kosId,
      kosContext,
      user?.nama,
      user?.email,
      user?.role,
      socket,
      isConnected,
      reconcileMessage,
    ]
  );

  const refetch = useCallback(async () => {
    if (targetUserId) {
      await fetchMessages();
    } else {
      setIsLoading(true);
      try {
        await fetchInbox();
      } finally {
        setIsLoading(false);
      }
    }
  }, [targetUserId, fetchMessages, fetchInbox]);

  return {
    inbox,
    messages,
    kosContext,
    isLoading,
    isSending,
    error,
    isConnected,
    sendMessage,
    refetch,
  };
}
