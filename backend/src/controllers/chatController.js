import mongoose from 'mongoose';
import * as chatService from '../services/chatService.js';

export const getConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId: targetUserId } = req.params;

    if (!mongoose.isValidObjectId(targetUserId)) {
      return res.status(400).json({ success: false, message: 'ID pengguna tidak valid' });
    }

    if (String(currentUserId) === String(targetUserId)) {
      return res.status(400).json({ success: false, message: 'Tidak dapat membuka percakapan dengan diri sendiri' });
    }

    const messages = await chatService.getConversationService(currentUserId, targetUserId);
    res.status(200).json({
      success: true,
      total: messages.length,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInboxList = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const inbox = await chatService.getInboxListService(currentUserId);
    res.status(200).json({
      success: true,
      total: inbox.length,
      data: inbox,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSupportContact = async (_req, res) => {
  try {
    const supportAdmin = await chatService.getSupportAdminService();
    res.status(200).json({
      success: true,
      data: supportAdmin,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Gagal mengambil kontak admin layanan bantuan',
    });
  }
};

export const sendMessageHttp = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, kosId, pesan } = req.body;
    const trimmedMessage = String(pesan || '').trim();

    if (!receiverId || !trimmedMessage) {
      return res.status(400).json({ success: false, message: 'receiverId dan pesan wajib diisi' });
    }

    if (!mongoose.isValidObjectId(receiverId)) {
      return res.status(400).json({ success: false, message: 'ID penerima tidak valid' });
    }

    if (String(senderId) === String(receiverId)) {
      return res.status(400).json({ success: false, message: 'Tidak dapat mengirim pesan ke diri sendiri' });
    }

    const savedMessage = await chatService.saveMessageService(senderId, receiverId, kosId, trimmedMessage);

    const io = req.app.get('io');
    if (io) {
      io.to(receiverId.toString()).emit('receiveMessage', savedMessage);
    }

    res.status(201).json({
      success: true,
      message: 'Pesan berhasil dikirim',
      data: savedMessage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
