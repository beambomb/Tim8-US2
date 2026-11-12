# Modul: Pusat Pesan & Inbox Chat

- **Penanggung Jawab**: Anggota 4
- **Rute URL**: `/chat`
- **Domain**: Chatting Real-Time & Notifikasi Socket.IO

## Rincian Tugas
1. Ambil daftar percakapan aktif user via `GET /api/chat/inbox`.
2. Tampilkan daftar kontak mitra bicara dengan informasi:
   - Nama mitra bicara & role (`PEMILIK_KOS` / `PENCARI_KOS`)
   - Cuplikan pesan terakhir (*last message*)
   - Tanggal & waktu kirim
   - Indikator badge pesan baru jika `dibaca: false`
3. Berikan navigasi saat salah satu percakapan diklik menuju `/chat/[userId]`.

## Definition of Done (DoD)
- Daftar kontak chat tampil teratur sesuai waktu pesan terakhir.
- Pesan belum dibaca memiliki penanda visual yang jelas.
- Lolos `npm run build` tanpa error.
