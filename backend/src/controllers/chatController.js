import * as chatService from '../services/chatService.js';

export const getConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId: targetUserId } = req.params;

    if (currentUserId === targetUserId) {
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

export const sendMessageHttp = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, kosId, pesan } = req.body;

    if (!receiverId || !pesan) {
      return res.status(400).json({ success: false, message: 'receiverId dan pesan wajib diisi' });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ success: false, message: 'Tidak dapat mengirim pesan ke diri sendiri' });
    }

    const savedMessage = await chatService.saveMessageService(senderId, receiverId, kosId, pesan);

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
