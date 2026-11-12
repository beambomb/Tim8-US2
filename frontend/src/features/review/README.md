# Modul: Sistem Ulasan & Rating Bintang

- **Penanggung Jawab**: Anggota 4
- **Lokasi Komponen**: `src/features/review/` (disematkan di halaman detail kos `/kos/[id]`)
- **Domain**: Ulasan & Reputasi Properti

## Rincian Tugas
1. Ambil daftar testimoni dan rating kos via `GET /api/kos/:id/reviews`.
2. Tampilkan daftar kartu review dengan:
   - Nama pengulas
   - Bintang rating (1 hingga 5 bintang)
   - Tanggal ulasan
   - Teks komentar mahasiswa
3. Buat formulir penulisan ulasan:
   - Input bintang interaktif
   - Textarea komentar
   - Tombol "Kirim Ulasan" via `POST /api/kos/:id/reviews`
4. Batasi form ulasan: Hanya tampil jika user login sebagai `PENCARI_KOS` dan belum pernah menulis ulasan pada kos tersebut.

## Definition of Done (DoD)
- Ulasan dan rating baru berhasil tersimpan ke database.
- Rata-rata rating pada kartu kos ter-update secara akurat.
- Lolos `npm run build` tanpa error.
