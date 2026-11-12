# Feature Module: Pemilik Kos & Kelola Properti

Penanggung Jawab: Anggota 3

## Struktur Pemisahan Logic dan UI
- `services/ownerService.js`: Seluruh panggilan API ke `/api/owner/*`, `/api/bookings/owner`, dan `/api/upload`.
- `hooks/useOwnerKos.js`: Logika daftar kos milik sendiri, penghapusan, dan pengajuan verifikasi ke Admin.
- `hooks/useOwnerBookings.js`: Logika memproses booking masuk dari pencari kos (Approve / Reject).
- Halaman UI pemanggil:
  - `src/app/owner/dashboard/page.jsx`
  - `src/app/owner/kos/page.jsx`
  - `src/app/owner/kos/tambah/page.jsx`
  - `src/app/owner/kos/[id]/edit/page.jsx`
  - `src/app/owner/bookings/page.jsx`
