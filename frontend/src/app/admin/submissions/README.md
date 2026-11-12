# Modul: Verifikasi & Audit Pengajuan Kos Masuk

- **Penanggung Jawab**: Anggota 1
- **Rute URL**: `/admin/submissions`
- **Domain**: Portal Administrator Sistem

## Rincian Tugas
1. Ambil daftar pengajuan kos pending via `GET /api/admin/submissions`.
2. Tampilkan tabel antrean: nama kos, nama pemilik, lokasi, tanggal pengajuan, tombol periksa.
3. Buat modal detail peninjauan via `GET /api/admin/submissions/:id` (menampilkan foto kamar, legalitas alamat, koordinat, dan fasilitas).
4. Implementasi aksi persetujuan via `PATCH /api/admin/submissions/:id/approve`.
5. Implementasi aksi penolakan via `PATCH /api/admin/submissions/:id/reject` dengan modal input wajib `alasanPenolakan`.

## Definition of Done (DoD)
- Admin dapat melihat seluruh kos yang menunggu moderasi.
- Mengklik "Setujui" berhasil mengubah status kos menjadi `Approved` dan otomatis memunculkannya di katalog publik.
- Mengklik "Tolak" berhasil menyimpan alasan penolakan dan mengubah status menjadi `Rejected`.
- Lolos `npm run build` tanpa error.
