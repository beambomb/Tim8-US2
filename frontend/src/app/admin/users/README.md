# Modul: Master Data & Manajemen Pengguna

- **Penanggung Jawab**: Anggota 1
- **Rute URL**: `/admin/users`
- **Domain**: Portal Administrator Sistem

## Rincian Tugas
1. Ambil seluruh data pengguna via `GET /api/admin/users`.
2. Tampilkan tabel pengguna lengkap dengan filter pencarian nama/email.
3. Buat dropdown interaktif untuk mengganti role pengguna (`PENCARI_KOS`, `PEMILIK_KOS`, `ADMIN`).
4. Panggil endpoint `PATCH /api/admin/users/:id/role` saat admin mengonfirmasi penggantian role.

## Definition of Done (DoD)
- Admin dapat meninjau seluruh pengguna platform.
- Penggantian role tersimpan di database dan mengembalikan notifikasi feedback sukses.
- Lolos `npm run build` tanpa error.
