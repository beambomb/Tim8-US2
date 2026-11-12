# Modul: Dashboard Statistik Administrator

- **Penanggung Jawab**: Anggota 1
- **Rute URL**: `/admin/dashboard`
- **Domain**: Portal Administrator Sistem

## Rincian Tugas
1. Buat halaman dasbor admin dengan layout sidebar khusus admin.
2. Integrasi ke endpoint `GET /api/admin/stats` dengan Bearer Token.
3. Tampilkan kartu metrik:
   - Total Pengguna (Pencari Kos, Pemilik Kos, Admin)
   - Status Properti Kos (Total Kos, Pending, Approved, Rejected)
4. Sediakan tautan cepat (*quick links*) menuju halaman audit kos pending dan manajemen akun pengguna.

## Definition of Done (DoD)
- Hanya pengguna dengan role `ADMIN` yang diizinkan mengakses halaman ini (proteksi role guard).
- Kartu statistik menampilkan data real-time dari database.
- Lolos `npm run build` tanpa error.
