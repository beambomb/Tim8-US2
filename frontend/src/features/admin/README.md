# Feature Module: Administrasi Platform & Verifikasi

Penanggung Jawab: Anggota 1

## Struktur Pemisahan Logic dan UI
- `services/adminService.js`: Seluruh panggilan API ke `/api/admin/*`.
- `hooks/useAdminSubmissions.js`: Pengelolaan antrean kos Pending, aksi persetujuan (Approve), dan aksi penolakan (Reject) dengan alasan.
- Halaman UI pemanggil:
  - `src/app/admin/dashboard/page.jsx`
  - `src/app/admin/submissions/page.jsx`
  - `src/app/admin/users/page.jsx`
