# Modul: Riwayat & Status Booking Mahasiswa

- **Penanggung Jawab**: Anggota 3
- **Rute URL**: `/bookings`
- **Domain**: Detail Properti & Transaksi Booking

## Rincian Tugas
1. Ambil seluruh riwayat booking user via `GET /api/bookings/my`.
2. Sediakan tab filter status: `Semua`, `PENDING`, `DISETUJUI`, `DITOLAK`, `DIBATALKAN`.
3. Tampilkan kartu booking: Foto kos, nama kos, tanggal mulai sewa, durasi sewa, total harga, dan badge status berwarna.
4. Buat tombol aksi "Batalkan Pengajuan" yang hanya aktif pada status `PENDING` via `PATCH /api/bookings/:id/cancel`.

## Definition of Done (DoD)
- Mahasiswa dapat melacak seluruh permohonan sewa miliknya.
- Pembatalan booking PENDING berhasil mengubah status menjadi `DIBATALKAN`.
- Lolos `npm run build` tanpa error.
