import PlaceholderPage from "../../../components/ui/PlaceholderPage";

export const metadata = {
  title: "Ruang Obrolan - CariKos Chat",
};

export default function ChatConversationPage() {
  return (
    <PlaceholderPage
      title="Ruang Obrolan Real-Time (Chat Window)"
      route="/chat/[userId]"
      assignedTo="Anggota 4"
      domain="Chatting Real-Time & Notifikasi Socket.IO"
      endpoints={[
        "GET /api/chat/:userId",
        "POST /api/chat/send",
        "Socket: sendMessage, receiveMessage, messageSent",
      ]}
      description="Jendela percakapan langsung antara mahasiswa dan pemilik kos. Mengambil riwayat pesan lampau dan otomatis menandai pesan sebagai sudah dibaca, menampilkan header profil lawan bicara + preview kos terkait, input pesan responsif, pengiriman pesan instan via Socket.IO, dan auto-scroll ke bawah saat pesan baru tiba."
    />
  );
}
