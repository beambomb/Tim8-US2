# Modul: Halaman Detail Properti Kos

- **Penanggung Jawab**: Anggota 3
- **Rute URL**: `/kos/[id]`
- **Domain**: Detail Properti & Transaksi Booking

## Rincian Tugas
1. Ambil data detail kos via `GET /api/kos/:id` menggunakan dynamic route param `id`.
2. Tampilkan galeri foto berkualitas tinggi dengan modal preview lightbox.
3. Tampilkan spesifikasi: Harga sewa, periode, sisa kamar tersedia, tipe kos, dan daftar fasilitas berikon.
4. Tampilkan informasi kontak pemilik kos dan tombol aksi "Chat Pemilik" yang mengarahkan ke `/chat/[ownerId]?kosId=[kosId]`.
5. Buat tombol "Ajukan Sewa / Booking" yang membuka dialog modal booking.

## Definition of Done (DoD)
- Halaman berhasil mengambil dan menampilkan detail spesifikasi kos sesuai ID.
- Tombol booking dinonaktifkan jika sisa kamar adalah 0.
- Lolos `npm run build` tanpa error.
