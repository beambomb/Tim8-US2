# Feature Module: Eksplorasi Kos & Favorit

Penanggung Jawab: Anggota 2

## Struktur Pemisahan Logic dan UI
- `services/kosService.js`: Seluruh panggilan API terkait `/api/kos/*`, `/api/favorites/*`, dan `/api/kos/:id/reviews`.
- `hooks/useKosList.js`: Logika filter pencarian, query params, fetch list, dan pagination.
- `hooks/useKosDetail.js`: Logika fetch detail kos tunggal, galeri foto, review, dan submit ulasan.
- Halaman UI pemanggil:
  - `src/app/kos/page.jsx`
  - `src/app/kos/[id]/page.jsx`
  - `src/app/kos/nearby/page.jsx`
  - `src/app/favorites/page.jsx`
