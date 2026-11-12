# Modul: Formulir Edit Data Properti Kos

- **Penanggung Jawab**: Anggota 2
- **Rute URL**: `/owner/kos/[id]/edit`
- **Domain**: Portal Pemilik Kos

## Rincian Tugas
1. Ambil data kos eksisting via `GET /api/kos/:id`.
2. Masukkan data ke dalam form (*pre-filled form*).
3. Izinkan penambahan foto baru atau penghapusan foto lama.
4. Simpan perubahan ke backend via `PUT /api/owner/kos/:id`.
5. Redirect kembali ke `/owner/kos`.

## Definition of Done (DoD)
- Perubahan data kos berhasil tersimpan dan ter-update di database.
- Lolos `npm run build` tanpa error.
