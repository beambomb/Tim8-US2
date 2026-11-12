# Laporan Progres Pengembangan Backend (CariKos API)

Dokumen ini mencatat status implementasi, pengujian, dan integrasi seluruh modul pada sisi backend (`backend/`) aplikasi CariKos.

---

## 1. Ringkasan Status Keseluruhan Backend

| Kategori | Status | Keterangan |
| :--- | :--- | :--- |
| **Arsitektur & Server** | Selesai (100%) | Express.js 5.2.1, Node.js ES Modules, Helmet, CORS, Error Handlers |
| **Koneksi Basis Data** | Selesai (100%) | MongoDB via Mongoose 9.10.1 dengan skema relasi dan indeks unik komposit |
| **Autentikasi & RBAC** | Selesai (100%) | JWT stateless authentication, bcrypt hashing, role middleware (`PENCARI_KOS`, `PEMILIK_KOS`, `ADMIN`) |
| **Penyimpanan Media** | Selesai (100%) | Multer (Memory Storage) terintegrasi ke CDN Cloudinary SDK |
| **Komunikasi Real-Time** | Selesai (100%) | Socket.IO 4.8.3 server dengan room terisolasi per `userId` untuk chat & push notifikasi |
| **Dokumentasi Pengujian**| Selesai (100%) | Tersedia koleksi pengujian Postman (`CariKos.postman_collection.json`) |

---

## 2. Status Implementasi Model Data (MongoDB Schema)

- [x] **User (`src/models/User.js`)**: Fields `nama`, `email` (unique), `password`, `noHp`, `role` (`PENCARI_KOS`, `PEMILIK_KOS`, `ADMIN`).
- [x] **Kos (`src/models/Kos.js`)**: Fields `ownerId`, `nama`, `harga`, `lokasi`, `latitude`, `longitude`, `tipe`, `fasilitas`, `jumlahKamar`, `jumlahKamarTersedia`, `fotoUrls`, `statusVerifikasi` (`Pending`, `Approved`, `Rejected`), `alasanPenolakan`.
- [x] **Booking (`src/models/Booking.js`)**: Fields `userId`, `kosId`, `tanggalMulai`, `durasiBulan`, `catatan`, `status` (`PENDING`, `DISETUJUI`, `DITOLAK`, `DIBATALKAN`).
- [x] **Review (`src/models/Review.js`)**: Fields `userId`, `kosId`, `rating` (1-5), `komentar`. Proteksi compound unique index `(userId, kosId)`.
- [x] **Favorite (`src/models/Favorite.js`)**: Fields `userId`, `kosId`. Proteksi compound unique index `(userId, kosId)`.
- [x] **Message (`src/models/Message.js`)**: Fields `senderId`, `receiverId`, `kosId`, `pesan`, `dibaca`. Indeks komposit `(senderId, receiverId, createdAt)`.
- [x] **Notification (`src/models/Notification.js`)**: Fields `userId`, `judul`, `pesan`, `tipe` (`SYSTEM`, `KOS_VERIFIKASI`, `BOOKING_BARU`, `BOOKING_STATUS`), `isRead`, `metadata`.

---

## 3. Matriks Implementasi Rute & Endpoint API

### 3.1 Modul Autentikasi (`/api/auth`)
- [x] `POST /api/auth/register` - Pendaftaran akun baru dengan enkripsi kata sandi bcrypt.
- [x] `POST /api/auth/login` - Verifikasi akun dan penerbitan token JWT.
- [x] `GET /api/auth/me` - Verifikasi token dan pengambilan data pengguna aktif.

### 3.2 Modul Eksplorasi & Katalog Kos (`/api/kos`)
- [x] `GET /api/kos` - Pengambilan seluruh kos berstatus `Approved` dengan filter harga, lokasi, tipe, fasilitas, ketersediaan.
- [x] `GET /api/kos/nearby` - Kalkulasi jarak lengkung bumi formula Haversine berdasarkan koordinat GPS dan radius meter.
- [x] `GET /api/kos/:id` - Detail spesifikasi kos terverifikasi beserta relasi data pemilik kos.
- [x] `GET /api/kos/:id/reviews` - Daftar ulasan dan rating kos dari mahasiswa.
- [x] `POST /api/kos/:id/reviews` - Penulisan ulasan dan rating (khusus `PENCARI_KOS`, dibatasi 1 kali).

### 3.3 Modul Transaksi Booking (`/api/bookings`)
- [x] `POST /api/bookings` - Pengajuan sewa kamar baru oleh mahasiswa (validasi stok kamar > 0 dan cegah double pending).
- [x] `GET /api/bookings/my` - Daftar riwayat sewa milik mahasiswa.
- [x] `PATCH /api/bookings/:id/cancel` - Pembatalan sewa oleh mahasiswa (hanya status `PENDING`).
- [x] `GET /api/bookings/owner` - Antrean permohonan booking masuk ke kos milik pemilik.
- [x] `PATCH /api/bookings/:id/approve` - Persetujuan booking oleh pemilik kos dengan operasi atomik pengurangan ketersediaan kamar (`jumlahKamarTersedia - 1`) dan proteksi race condition. Memicu notifikasi Socket.IO.
- [x] `PATCH /api/bookings/:id/reject` - Penolakan booking oleh pemilik kos. Memicu notifikasi Socket.IO.

### 3.4 Modul Kos Favorit (`/api/favorites`)
- [x] `GET /api/favorites` - Daftar kos yang disimpan oleh mahasiswa aktif.
- [x] `POST /api/favorites` - Menambahkan kos ke daftar favorit.
- [x] `DELETE /api/favorites/:id` - Menghapus kos dari daftar favorit.

### 3.5 Modul Manajemen Properti Pemilik (`/api/owner`)
- [x] `GET /api/owner/kos` - Daftar seluruh properti milik pemilik yang sedang login.
- [x] `POST /api/owner/kos` - Pembuatan draf properti kos baru (status awal: `Pending`).
- [x] `PUT /api/owner/kos/:id` - Pembaruan data spesifikasi properti kos.
- [x] `DELETE /api/owner/kos/:id` - Penghapusan data properti kos.
- [x] `PATCH /api/owner/kos/:id/availability` - Pembaruan instan kuota kamar kosong tanpa submit ulang verifikasi.
- [x] `POST /api/owner/kos/:id/submit` - Pengajuan draf kos ke admin untuk proses verifikasi.
- [x] `POST /api/owner/upload` - Pengunggahan berkas foto (hingga 5 file) langsung ke Cloudinary via Multer.
- [x] `POST /api/owner/kos/:id/images` - Penambahan foto langsung ke galeri kos.
- [x] `DELETE /api/owner/kos/:id/images` - Penghapusan foto tertentu dari galeri kos.

### 3.6 Modul Portal Administrator (`/api/admin`)
- [x] `GET /api/admin/stats` - Metrik statistik sistem (total user per role dan status seluruh kos).
- [x] `GET /api/admin/submissions` - Antrean daftar kos yang menunggu verifikasi admin (`statusVerifikasi: 'Pending'`).
- [x] `GET /api/admin/submissions/:id` - Peninjauan detail lengkap berkas kos pending.
- [x] `PATCH /api/admin/submissions/:id/approve` - Persetujuan penerbitan kos menjadi `Approved`. Memicu notifikasi ke pemilik kos.
- [x] `PATCH /api/admin/submissions/:id/reject` - Penolakan kos menjadi `Rejected` disertai pencatatan `alasanPenolakan`. Memicu notifikasi ke pemilik kos.
- [x] `GET /api/admin/users` - Master data seluruh pengguna platform.
- [x] `PATCH /api/admin/users/:id/role` - Pengubahan role pengguna secara langsung oleh admin.

### 3.7 Modul Chat Real-Time & HTTP Fallback (`/api/chat` & Socket.IO)
- [x] `GET /api/chat/inbox` - Daftar percakapan aktif yang dikelompokkan per mitra bicara beserta cuplikan pesan terakhir.
- [x] `GET /api/chat/:userId` - Riwayat obrolan lengkap antara dua user (otomatis mengubah `dibaca: true`).
- [x] `POST /api/chat/send` - Pengiriman pesan melalui HTTP REST API (fallback).
- [x] Socket Event `joinRoom` - Menggabungkan socket ke room personal pengguna (`userId`).
- [x] Socket Event `sendMessage` - Pengiriman pesan WebSocket dua arah yang langsung disimpan ke basis data MongoDB dan dipancarkan ke penerima.
- [x] Socket Event `receiveMessage` - Penerimaan pesan instan di sisi klien.

### 3.8 Modul Notifikasi (`/api/notifications`)
- [x] `GET /api/notifications` - Riwayat notifikasi tersimpan milik pengguna.
- [x] `PATCH /api/notifications/:id/read` - Penandaan satu notifikasi telah dibaca.
- [x] `PATCH /api/notifications/read-all` - Penandaan seluruh notifikasi telah dibaca.
- [x] Socket Event `notification` - Pemancaran sinyal notifikasi instan ke room pengguna saat status verifikasi kos atau status booking berubah.

---

## 4. Script Pendukung & Utilitas Database

- [x] **Seed Admin (`npm run seed:admin`)**: Script otomatis untuk membuat akun Administrator bawaan (`admin@carikos.com`) dengan proteksi keamanan.
- [x] **Reset Database (`npm run db:reset`)**: Script untuk membersihkan koleksi data dan mereset kondisi database untuk kebutuhan pengujian.

---

## 5. Rencana Tindak Lanjut Backend (Next Action Items)

- [ ] Melakukan pengujian integrasi ujung-ke-ujung (*end-to-end integration test*) bersama klien Frontend.
- [ ] Pengujian beban koneksi Socket.IO saat banyak koneksi simultan aktif.
- [ ] Pengaturan rate limiting pada endpoint publik seperti registrasi dan login untuk mencegah serangan brute force.
