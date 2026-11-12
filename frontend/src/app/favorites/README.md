# Modul: Kos Favorit / Wishlist

- **Penanggung Jawab**: Anggota 3
- **Rute URL**: `/favorites`
- **Domain**: Detail Properti & Transaksi Booking

## Rincian Tugas
1. Ambil daftar kos yang difavoritkan mahasiswa via `GET /api/favorites`.
2. Tampilkan grid kartu kos favorit dengan informasi harga, lokasi, dan sisa kamar.
3. Buat tombol hapus dari favorit via `DELETE /api/favorites/:id` menggunakan *optimistic UI update*.
4. Pastikan toggle love button di setiap kartu kos pada katalog (`/kos`) dan detail (`/kos/[id]`) tersinkronisasi via `POST /api/favorites`.

## Definition of Done (DoD)
- Mahasiswa dapat menyimpan dan menghapus kos dari daftar favorit mereka.
- Daftar favorit tersimpan di database MongoDB berdasarkan `userId`.
- Lolos `npm run build` tanpa error.
