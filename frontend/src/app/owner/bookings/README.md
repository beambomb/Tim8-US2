# Modul: Manajemen Permohonan Booking Masuk (Pemilik Kos)

- **Penanggung Jawab**: Anggota 3
- **Rute URL**: `/owner/bookings`
- **Domain**: Detail Properti & Transaksi Booking

## Rincian Tugas
1. Ambil antrean booking mahasiswa via `GET /api/bookings/owner`.
2. Tampilkan daftar tabel permohonan sewa: Nama mahasiswa, nomor HP, kos yang dituju, tanggal mulai, durasi sewa, catatan khusus.
3. Buat tombol aksi hijau "Setujui (*Approve*)" yang memanggil `PATCH /api/bookings/:id/approve` (otomatis mengurangi jumlah kamar tersedia sebesar 1 di backend).
4. Buat tombol aksi merah "Tolak (*Reject*)" yang memanggil `PATCH /api/bookings/:id/reject`.
5. Tampilkan dialog konfirmasi sebelum eksekusi aksi.

## Definition of Done (DoD)
- Pemilik kos dapat melihat seluruh permohonan booking yang masuk.
- Persetujuan booking berhasil mengubah status menjadi `DISETUJUI` dan mengurangi ketersediaan kamar secara atomik.
- Lolos `npm run build` tanpa error.
