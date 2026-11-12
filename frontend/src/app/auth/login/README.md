# Modul: Halaman Masuk (Login)

- **Penanggung Jawab**: Anggota 1
- **Rute URL**: `/auth/login`
- **Domain**: Autentikasi Pengguna & Manajemen Sesi

## Rincian Tugas
1. Buat formulir login dengan input `email` dan `password`.
2. Integrasi ke endpoint backend `POST /api/auth/login`.
3. Simpan token JWT yang diterima ke `localStorage` (key: `token`).
4. Panggil fungsi login dari `AuthContext` untuk memperbarui data user aktif.
5. Arahkan (*redirect*) pengguna berdasarkan rolenya:
   - `ADMIN` -> `/admin/dashboard`
   - `PEMILIK_KOS` -> `/owner/dashboard`
   - `PENCARI_KOS` -> `/kos`
6. Tampilkan pesan kesalahan (*alert error*) jika kredensial salah atau server mengalami masalah.

## Definition of Done (DoD)
- Pengguna dapat masuk dan token JWT tersimpan dengan benar.
- Pengguna dengan kredensial salah menerima pesan error yang jelas.
- Navigasi otomatis berjalan sesuai role pengguna.
- Lolos `npm run build` tanpa error.
