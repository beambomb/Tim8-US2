# Modul: Dashboard Ringkasan Pemilik Kos

- **Penanggung Jawab**: Anggota 2
- **Rute URL**: `/owner/dashboard`
- **Domain**: Portal Pemilik Kos

## Rincian Tugas
1. Buat layout dasbor pemilik kos dengan sidebar navigasi internal (`/owner/kos`, `/owner/bookings`).
2. Agregasi metrik dari `GET /api/owner/kos` (total kos dan rasio ketersediaan kamar) dan `GET /api/bookings/owner` (jumlah permohonan booking berstatus PENDING).
3. Buat tombol Call to Action cepat "Tambah Kos Baru" menuju `/owner/kos/tambah`.

## Definition of Done (DoD)
- Halaman hanya dapat diakses oleh user berstatus login dengan role `PEMILIK_KOS`.
- Kartu statistik menampilkan data riil milik pemilik yang sedang aktif.
- Lolos `npm run build` tanpa error.
