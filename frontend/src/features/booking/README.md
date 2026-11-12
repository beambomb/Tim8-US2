# Modul: Transaksi Sewa & Booking Kamar Kos

- **Penanggung Jawab**: Anggota 3
- **Lokasi Komponen**: `src/features/booking/` (disematkan di halaman detail kos `/kos/[id]`)
- **Domain**: Transaksi Sewa & Pemesanan

## Rincian Tugas
1. Buat komponen dialog modal `BookingModal.jsx` yang dipanggil saat tombol "Ajukan Sewa" di `/kos/[id]` ditekan.
2. Field formulir:
   - Tanggal mulai kos (`tanggalMulai`, minimal hari ini)
   - Durasi sewa (`durasiBulan`: 1, 3, 6, atau 12 bulan)
   - Catatan pesan untuk pemilik kos (`catatan`)
   - Kalkulasi otomatis total biaya sewa (`harga * durasiBulan`)
3. Kirim permohonan ke backend via `POST /api/bookings`.
4. Berikan pesan feedback sukses dan arahkan pengguna ke `/bookings` untuk melacak status.

## Definition of Done (DoD)
- Permohonan sewa berhasil tersimpan di database dengan status `PENDING`.
- Tombol dinonaktifkan jika stok kamar kos 0 atau user belum terautentikasi.
- Lolos `npm run build` tanpa error.
