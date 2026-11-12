import PlaceholderPage from "../../components/ui/PlaceholderPage";

export const metadata = {
  title: "Pesan Masuk (Chat) - CariKos",
};

export default function ChatInboxPage() {
  return (
    <PlaceholderPage
      title="Pusat Pesan & Inbox Chat Percakapan"
      route="/chat"
      assignedTo="Anggota 4"
      domain="Chatting Real-Time & Notifikasi Socket.IO"
      endpoints={["GET /api/chat/inbox"]}
      description="Halaman daftar percakapan aktif yang dimiliki pengguna (baik mahasiswa maupun pemilik kos). Mengelompokkan mitra bicara, menampilkan avatar, nama, role lawan bicara, cuplikan pesan terakhir (last message), waktu kirim, dan badge tebal jika ada pesan baru yang belum dibaca."
    />
  );
}
