# Modul: Ruang Obrolan Real-Time (Chat Window)

- **Penanggung Jawab**: Anggota 4
- **Rute URL**: `/chat/[userId]`
- **Domain**: Chatting Real-Time & Notifikasi Socket.IO

## Rincian Tugas
1. Ambil riwayat percakapan via `GET /api/chat/:userId` (backend otomatis mengubah `dibaca: true`).
2. Header chat menampilkan nama lawan bicara dan kartu preview kos terkait jika percakapan diawali dari halaman detail kos.
3. Form input pesan teks dengan tombol kirim responsif (bisa kirim via Enter atau tombol).
4. Pancarkan pesan instan via Socket event `sendMessage`:
   ```javascript
   socket.emit('sendMessage', {
     senderId: user._id,
     receiverId: targetUserId,
     kosId: selectedKosId,
     pesan: text,
   });
   ```
5. Dengarkan pesan masuk dari lawan bicara via Socket listener `receiveMessage` dan update state pesan lokal seketika tanpa refresh.
6. Buat fungsi auto-scroll ke bawah setiap ada pesan baru.

## Definition of Done (DoD)
- Pesan terkirim dan diterima secara real-time antar dua akun peramban berbeda.
- Pesan tersimpan secara permanen di database MongoDB.
- Lolos `npm run build` tanpa error.
