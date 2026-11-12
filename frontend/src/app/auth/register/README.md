# Modul: Halaman Registrasi Akun (Register)

- **Penanggung Jawab**: Anggota 1
- **Rute URL**: `/auth/register`
- **Domain**: Autentikasi Pengguna & Manajemen Sesi

## Rincian Tugas
1. Buat form pendaftaran dengan field:
   - Nama Lengkap (`nama`)
   - Alamat Email (`email`)
   - Kata Sandi (`password`, minimal 6 karakter)
   - Nomor Handphone (`noHp`)
   - Pilihan Peran (`role`: `PENCARI_KOS` atau `PEMILIK_KOS`)
2. Integrasi ke endpoint backend `POST /api/auth/register`.
3. Tampilkan pesan feedback sukses pendaftaran.
4. Otomatis arahkan pengguna ke `/auth/login`.

## Definition of Done (DoD)
- Data akun baru tersimpan di database MongoDB dengan password ter-hash bcrypt.
- Input tidak valid memunculkan pesan validasi form yang jelas.
- Lolos `npm run build` tanpa error.
