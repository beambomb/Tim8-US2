# Modul: Manajemen Inventaris Kos Pemilik

- **Penanggung Jawab**: Anggota 2
- **Rute URL**: `/owner/kos`
- **Domain**: Portal Pemilik Kos

## Rincian Tugas
1. Ambil daftar kos milik owner aktif via `GET /api/owner/kos`.
2. Tampilkan tabel/grid properti dengan foto, nama, harga bulanan, dan status verifikasi (*Pending*, *Approved*, atau *Rejected*).
3. Jika berstatus *Rejected*, tampilkan accordion alasan penolakan (`alasanPenolakan`).
4. Buat tombol quick update ketersediaan kamar (`+` / `-`) via `PATCH /api/owner/kos/:id/availability`.
5. Buat tombol hapus properti via `DELETE /api/owner/kos/:id` dengan modal konfirmasi.

## Definition of Done (DoD)
- Pemilik kos dapat melihat seluruh kos miliknya beserta status verifikasinya.
- Quick update ketersediaan kamar berhasil memperbarui data tanpa perlu re-verifikasi.
- Lolos `npm run build` tanpa error.
