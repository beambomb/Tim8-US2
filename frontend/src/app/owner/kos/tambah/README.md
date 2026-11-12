# Modul: Formulir Tambah Properti Kos Baru

- **Penanggung Jawab**: Anggota 2
- **Rute URL**: `/owner/kos/tambah`
- **Domain**: Portal Pemilik Kos

## Rincian Tugas
1. Buat form terstruktur: nama kos, harga sewa per bulan, alamat tekstual, koordinat latitude & longitude, tipe kos (`Putra`, `Putri`, `Campur`), checklist fasilitas, dan total kamar.
2. Buat dropzone drag-and-drop unggah foto (maksimal 5 foto) dengan preview lokal.
3. Unggah foto ke Cloudinary melalui endpoint `POST /api/owner/upload` (Multer).
4. Ambil array URL foto hasil upload, gabungkan dengan payload kos, lalu kirim ke `POST /api/owner/kos`.
5. Redirect pemilik kos ke `/owner/kos` setelah berhasil dengan notifikasi sukses.

## Definition of Done (DoD)
- Foto berhasil terunggah ke Cloudinary dan tersimpan dalam array `fotoUrls`.
- Data kos baru berhasil masuk ke database dengan status awal `Pending`.
- Lolos `npm run build` tanpa error.
