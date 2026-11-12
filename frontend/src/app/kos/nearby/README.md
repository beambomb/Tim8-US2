# Modul: Kos Terdekat Kampus (Geospasial Haversine)

- **Penanggung Jawab**: Anggota 2
- **Rute URL**: `/kos/nearby`
- **Domain**: Eksplorasi Kos & Pencarian Publik

## Rincian Tugas
1. Buat tombol "Gunakan Lokasi Saya" via `navigator.geolocation.getCurrentPosition`.
2. Sediakan tombol preset lokasi kampus terdekat (UGM, UNY, UPN, UII) untuk kemudahan mahasiswa.
3. Slider radius jarak (rentang 1 km hingga 10 km).
4. Panggil endpoint `GET /api/kos/nearby?latitude=...&longitude=...&maxDistance=...`.
5. Tampilkan daftar kartu kos dengan badge jarak nyata dalam meter atau kilometer.

## Definition of Done (DoD)
- Mahasiswa dapat menemukan kos terdekat secara instan berdasarkan koordinat GPS atau preset kampus.
- Label jarak nyata terhitung akurat sesuai formula Haversine backend.
- Lolos `npm run build` tanpa error.
