'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { chatService } from '../services/chatService';

export function useChat(targetUserId = null) {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  const [inbox, setInbox] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInbox = useCallback(async () => {
    try {
      const res = await chatService.getInbox();
      setInbox(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat daftar percakapan.');
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!targetUserId) return;
    setIsLoading(true);
    try {
      const res = await chatService.getMessages(targetUserId);
      setMessages(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat riwayat pesan.');
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    if (targetUserId) {
      fetchMessages();
    } else {
      fetchInbox().finally(() => setIsLoading(false));
    }
  }, [targetUserId, fetchMessages, fetchInbox]);

  // Real-time socket listener for incoming messages
  useEffect(() => {
    if (!socket || !targetUserId) return;

    const handleReceiveMessage = (newMessage) => {
      // Check if the message belongs to current active conversation
      const isFromCurrentTarget =
        newMessage.senderId === targetUserId || newMessage.sender?._id === targetUserId;
      const isFromMeToTarget =
        newMessage.receiverId === targetUserId || newMessage.receiver?._id === targetUserId;

      if (isFromCurrentTarget || isFromMeToTarget) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, targetUserId]);

  const sendMessage = async (text) => {
    if (!text?.trim() || !targetUserId) return;

    const payload = {
      receiverId: targetUserId,
      message: text.trim(),
    };

    // Emit via WebSocket if connected, fallback to HTTP endpoint
    if (socket && isConnected) {
      socket.emit('send_message', payload);
    } else {
      await chatService.sendMessageHttp(payload.receiverId, payload.message);
    }

    // Optimistic local update or re-fetch
    const tempMsg = {
      _id: Date.now().toString(),
      senderId: user?._id,
      receiverId: targetUserId,
      message: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
  };

  return {
    inbox,
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage,
    refetch: targetUserId ? fetchMessages : fetchInbox,
  };
}
