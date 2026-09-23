import Message from '../models/Message.js';
import User from '../models/User.js';

export const saveMessageService = async (senderId, receiverId, kosId, pesan) => {
  const newMessage = new Message({
    senderId,
    receiverId,
    kosId: kosId || null,
    pesan,
  });
  const saved = await newMessage.save();
  return await Message.findById(saved._id)
    .populate('senderId', 'nama email role')
    .populate('receiverId', 'nama email role')
    .populate('kosId', 'nama harga lokasi');
};

export const getConversationService = async (currentUserId, targetUserId) => {
  await Message.updateMany(
    { senderId: targetUserId, receiverId: currentUserId, dibaca: false },
    { $set: { dibaca: true } }
  );

  return await Message.find({
    $or: [
      { senderId: currentUserId, receiverId: targetUserId },
      { senderId: targetUserId, receiverId: currentUserId },
    ],
  })
    .sort({ createdAt: 1 })
    .populate('senderId', 'nama email role')
    .populate('receiverId', 'nama email role')
    .populate('kosId', 'nama harga lokasi fotoUrls');
};

export const getInboxListService = async (userId) => {
  const messages = await Message.find({
    $or: [{ senderId: userId }, { receiverId: userId }],
  })
    .sort({ createdAt: -1 })
    .populate('senderId', 'nama email role')
    .populate('receiverId', 'nama email role')
    .populate('kosId', 'nama harga');

  const conversationMap = new Map();
  for (const msg of messages) {
    if (!msg.senderId || !msg.receiverId) continue;
    const isSender = msg.senderId._id.toString() === userId.toString();
    const partner = isSender ? msg.receiverId : msg.senderId;
    const partnerId = partner._id.toString();

    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, {
        partner: {
          id: partner._id,
          nama: partner.nama,
          email: partner.email,
          role: partner.role,
        },
        lastMessage: {
          id: msg._id,
          pesan: msg.pesan,
          kos: msg.kosId,
          createdAt: msg.createdAt,
          isSender,
          dibaca: msg.dibaca,
        },
      });
    }
  }

  return Array.from(conversationMap.values());
};
