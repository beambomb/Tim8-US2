# Modul: Katalog & Pencarian Kos Lengkap

- **Penanggung Jawab**: Anggota 2
- **Rute URL**: `/kos`
- **Domain**: Eksplorasi Kos & Pencarian Publik

## Rincian Tugas
1. Buat layout 2 kolom: Sidebar filter di sisi kiri dan grid kartu kos di sisi kanan.
2. Integrasi ke `GET /api/kos` dengan query filter: `hargaMin`, `hargaMax`, `lokasi`, `tipe`, `fasilitas`, `tersedia`.
3. Gunakan custom hook `useDebounce` pada input pencarian teks.
4. Tampilkan kartu kos yang memuat: Foto Cloudinary, nama, lokasi, harga, sisa kamar, dan rating.
5. Sediakan shimmer skeleton loading saat data sedang diambil dan tampilan *Empty State* jika hasil kosong.

## Definition of Done (DoD)
- Pencarian dan filter multikriteria menghasilkan data yang akurat dari backend.
- Filter tersinkronisasi ke parameter query URL browser.
- Lolos `npm run build` tanpa error.
