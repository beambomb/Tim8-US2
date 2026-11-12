# Pembagian Tugas Tim Pengembang CariKos

Dokumen ini memuat matriks pembagian tugas pengembangan aplikasi web CariKos untuk tim yang terdiri dari 4 orang pengembang. Seluruh ruang lingkup pekerjaan dibagi secara sama rata (*equal workload*) tanpa adanya hierarki atau peran senior/junior.

Dokumen ini juga mengatur standar rekayasa perangkat lunak yang wajib dipatuhi oleh seluruh anggota tim, mencakup **Pemisahan Logika & UI (Separation of Concerns)** dan **Pipeline CI/CD (Continuous Integration & Deployment)**.

---

## 1. Tabel Matriks Pembagian Tugas (5 Kolom)

| Nama | Domain Paket Tugas | Folder / Modul yang Dikerjakan | Deskripsi Tugas yang Detail | Definition of Done (DoD) |
| :--- | :--- | :--- | :--- | :--- |
| **Anggota 1** | **Autentikasi Akun, State Sesi & Portal Administrator** | 1. `frontend/src/lib/api.js`<br>2. `frontend/src/context/AuthContext.jsx`<br>3. `frontend/src/features/auth/` (`services/authService.js`, `hooks/useAuthForm.js`)<br>4. `frontend/src/features/admin/` (`services/adminService.js`, `hooks/useAdminSubmissions.js`)<br>5. `frontend/src/app/auth/login/`<br>6. `frontend/src/app/auth/register/`<br>7. `frontend/src/app/admin/dashboard/`<br>8. `frontend/src/app/admin/submissions/`<br>9. `frontend/src/app/admin/users/` | 1. **Setup Klien API**: Membangun instance Axios terpusat dengan base URL `http://localhost:5000/api`, otomatis menyisipkan Bearer Token dari `localStorage`, dan menangani error 401 (*auto-logout*).<br>2. **Global Auth Context & Hook**: Menyediakan `useAuthForm.js` dan `authService.js` untuk fungsi `login()`, `register()`, `logout()`, serta validasi sesi aktif via `GET /api/auth/me`.<br>3. **Halaman Login & Register**: Form login & register dengan validasi input, alert error, dan navigasi otomatis sesuai role (`ADMIN`, `PEMILIK_KOS`, `PENCARI_KOS`).<br>4. **Dashboard Admin**: Integrasi metrik statistik total user, distribusi role, dan status verifikasi kos via `GET /api/admin/stats`.<br>5. **Hook & Halaman Verifikasi Kos**: `useAdminSubmissions.js` untuk mengelola antrean pending via `GET /api/admin/submissions`, modal review foto, tombol Setujui via `PATCH /api/admin/submissions/:id/approve`, dan tombol Tolak dengan input `alasanPenolakan` via `PATCH /api/admin/submissions/:id/reject`.<br>6. **Manajemen Pengguna**: Tabel master data user via `GET /api/admin/users`, fitur pencarian nama/email, dan mutasi role via `PATCH /api/admin/users/:id/role`. | 1. Pengguna dapat login dan register dengan penyimpanan token JWT yang valid.<br>2. Admin dapat melihat statistik sistem yang akurat.<br>3. Pengajuan kos pending dapat disetujui (Approved) atau ditolak (Rejected dengan alasan).<br>4. Admin dapat mengubah role akun pengguna lain.<br>5. Menerapkan pemisahan logic (`services/` & `hooks/`) tanpa raw API call di `page.jsx`.<br>6. Lolos uji build lokal dan pipeline CI GitHub Actions tanpa error. |
| **Anggota 2** | **Katalog Pencarian, Geospasial & Manajemen Kos Pemilik** | 1. `frontend/src/features/kos/` (`services/kosService.js`, `hooks/useKosList.js`)<br>2. `frontend/src/features/owner/` (`services/ownerService.js`, `hooks/useOwnerKos.js`)<br>3. `frontend/src/app/kos/`<br>4. `frontend/src/app/kos/nearby/`<br>5. `frontend/src/app/owner/dashboard/`<br>6. `frontend/src/app/owner/kos/`<br>7. `frontend/src/app/owner/kos/tambah/`<br>8. `frontend/src/app/owner/kos/[id]/edit/` | 1. **Katalog Kos & Custom Hook Filter**: Membangun `useKosList.js` dan `kosService.js` untuk mengambil data kos approved via `GET /api/kos` dengan filter multikriteria (rentang harga, tipe putra/putri/campur, checklist fasilitas, toggle ketersediaan). Dilengkapi skeleton loader dan sinkronisasi URL query params.<br>2. **Pencarian Geospasial Kos Terdekat**: Integrasi `GET /api/kos/nearby` menggunakan koordinat browser (`navigator.geolocation`) atau preset kampus, slider radius 1-10 km, dan kalkulasi jarak nyata formula Haversine.<br>3. **Dashboard Pemilik**: Widget analitik properti milik owner via agregasi data `GET /api/owner/kos` dan `GET /api/bookings/owner`.<br>4. **Hook & Manajemen Properti Pemilik**: `useOwnerKos.js` untuk tabel/grid kos milik owner, badge status (*Pending/Approved/Rejected*), accordion alasan penolakan, tombol hapus via `DELETE /api/owner/kos/:id`, dan quick-update ketersediaan via `PATCH /api/owner/kos/:id/availability`.<br>5. **Form Input & Edit Kos**: Form tambah & edit kos dengan input spesifikasi, dropzone upload multi-foto ke Cloudinary via `POST /api/upload`, kemudian submit data via `POST /api/owner/kos` dan `PUT /api/owner/kos/:id`. | 1. Mahasiswa dapat memfilter kos berdasarkan harga, tipe, fasilitas, dan ketersediaan secara akurat.<br>2. Fitur geospasial menampilkan jarak kos dalam meter/km dari koordinat pengguna.<br>3. Pemilik kos dapat membuat properti baru dan mengunggah foto ke Cloudinary.<br>4. Pemilik kos dapat memperbarui stok kamar kosong secara instan.<br>5. Menerapkan pemisahan logic (`services/` & `hooks/`) tanpa raw API call di `page.jsx`.<br>6. Lolos uji build lokal dan pipeline CI GitHub Actions tanpa error. |
| **Anggota 3** | **Detail Properti, Transaksi Booking & Wishlist Favorit** | 1. `frontend/src/features/kos/` (`hooks/useKosDetail.js`, favorit API)<br>2. `frontend/src/features/booking/` (`services/bookingService.js`, `hooks/useBookings.js`)<br>3. `frontend/src/features/owner/` (`hooks/useOwnerBookings.js`)<br>4. `frontend/src/app/kos/[id]/`<br>5. `frontend/src/app/bookings/`<br>6. `frontend/src/app/owner/bookings/`<br>7. `frontend/src/app/favorites/` | 1. **Detail Kos & Hook**: Menggunakan `useKosDetail.js` untuk mengambil data spesifikasi kos via `GET /api/kos/:id`, galeri foto lightbox, informasi kontak pemilik, peta koordinat, dan ketersediaan kamar dinamis.<br>2. **Modal Pengajuan Booking**: Dialog pop-up di halaman detail kos untuk memilih tanggal mulai sewa (`tanggalMulai`), durasi sewa (`durasiBulan`), catatan, dan kalkulasi biaya sewa via `POST /api/bookings`. Validasi: disabled jika kamar penuh atau user belum login.<br>3. **Riwayat Booking Mahasiswa**: `useBookings.js` untuk pelacakan status sewa via `GET /api/bookings/my`, tab status (*Semua, PENDING, APPROVED, REJECTED, CANCELLED*), dan tombol pembatalan sewa via `PATCH /api/bookings/:id/cancel`.<br>4. **Manajemen Booking Masuk Pemilik**: `useOwnerBookings.js` untuk antrean permohonan sewa masuk via `GET /api/bookings/owner`, profil pemesan, tombol Approve (mengurangi kuota kamar atomik) dan tombol Reject via `PATCH /api/bookings/:id/status`.<br>5. **Modul Favorit / Wishlist**: Halaman `/favorites` via `GET /api/favorites` dan tombol toggle love icon di setiap kartu kos via `POST /api/favorites` dan `DELETE /api/favorites/:id` dengan *optimistic update*. | 1. Mahasiswa dapat mengajukan booking kamar kos dan melihat rincian kalkulasi harga secara tepat.<br>2. Mahasiswa dapat membatalkan booking berstatus PENDING.<br>3. Pemilik kos dapat menyetujui atau menolak permohonan sewa masuk.<br>4. Persetujuan booking berhasil mengurangi stok kamar tersedia sebanyak 1 secara atomik.<br>5. Mahasiswa dapat menambah dan menghapus kos dari daftar favorit.<br>6. Menerapkan pemisahan logic (`services/` & `hooks/`) tanpa raw API call di `page.jsx`.<br>7. Lolos uji build lokal dan pipeline CI GitHub Actions tanpa error. |
| **Anggota 4** | **Chat Real-Time, Notifikasi Socket.IO & Sistem Ulasan** | 1. `frontend/src/lib/socket.js`<br>2. `frontend/src/context/SocketContext.jsx`<br>3. `frontend/src/features/chat/` (`services/chatService.js`, `hooks/useChat.js`)<br>4. `frontend/src/features/review/` (`README.md`, form review)<br>5. `frontend/src/app/chat/`<br>6. `frontend/src/app/chat/[userId]/`<br>7. `frontend/src/components/layout/NavbarNotifications.jsx` | 1. **Infrastruktur Socket.IO**: Singleton client Socket.IO, provider context, koneksi otomatis saat login, emit `joinRoom` berbasis `user._id`, dan auto-reconnect.<br>2. **Hook & Inbox Chat**: `useChat.js` dan `chatService.js` untuk mengambil daftar percakapan aktif via `GET /api/chat/inbox`, mitra bicara, pesan terakhir, waktu, dan badge unread.<br>3. **Ruang Obrolan Real-Time**: Riwayat pesan via `GET /api/chat/:userId` (auto mark read), preview kos, input teks kirim pesan via socket event `sendMessage` (fallback HTTP `/api/chat/send`), listener `receiveMessage`, dan auto-scroll to bottom.<br>4. **Sistem Notifikasi**: Bell icon di navbar dengan unread counter, dropdown riwayat via `GET /api/notifications`, listener socket event `notification` untuk memunculkan floating toast alert saat status booking/kos berubah, dan tombol tandai dibaca via `PATCH /api/notifications/:id/read` & `PATCH /api/notifications/read-all`.<br>5. **Sistem Ulasan & Rating Bintang**: Komponen testimoni di detail kos via `GET /api/kos/:id/reviews` dan formulir input rating bintang 1-5 + komentar via `POST /api/kos/:id/reviews` (dibatasi 1 review per user). | 1. Mahasiswa dan pemilik kos dapat saling berkirim pesan secara real-time tanpa me-refresh halaman.<br>2. Pesan yang dibuka otomatis ditandai sebagai telah dibaca.<br>3. Notifikasi toast muncul seketika di layar saat booking disetujui/ditolak oleh pemilik.<br>4. Mahasiswa dapat memberikan rating bintang dan ulasan komentar.<br>5. Menerapkan pemisahan logic (`services/` & `hooks/`) tanpa raw API call di `page.jsx`.<br>6. Lolos uji build lokal dan pipeline CI GitHub Actions tanpa error. |

---

## 2. Standar Pemisahan Logic dan UI (Separation of Concerns)

Setiap anggota tim **wajib** mengikuti pola arsitektur 3 layer berikut agar kode tidak menumpuk menjadi komponen raksasa (*God Component*) dan mencegah konflik antar developer:

```text
[Layer 1: Service]      --> frontend/src/features/<domain>/services/*
                            Hanya berisi fungsi pemanggilan Axios (@/lib/api) dan pembentukan payload.
                            Murni asynchronous functions tanpa state React.
                                ↓
[Layer 2: Custom Hook]  --> frontend/src/features/<domain>/hooks/*
                            Mengelola useState, useEffect, validasi form, loading status, error alerts,
                            kalkulasi tanggal/harga, dan integrasi WebSocket.
                                ↓
[Layer 3: UI Component] --> frontend/src/app/**/page.jsx & frontend/src/components/*
                            Komponen visual presentational murni (Tailwind CSS JSX).
                            Hanya memanggil custom hook dan me-render data ke elemen visual.
```

### Aturan Wajib untuk Semua Anggota:
1. **DILARANG** memanggil `api.get()`, `api.post()`, `api.put()`, atau `api.delete()` secara langsung di dalam file `page.jsx`.
2. Semua pemanggilan HTTP harus dikemas di dalam file `services/<domain>Service.js`.
3. Semua state data fetching, mutasi data, dan penanganan loading/error harus dikemas di dalam Custom Hook `hooks/use<Fitur>.js`.
4. State visual lokal yang tidak berhubungan dengan backend (contoh: toggle menu dropdown, modal buka/tutup sederhana, atau tab switching visual murni) **boleh** diletakkan langsung di dalam komponen UI menggunakan `useState` lokal.

---

## 3. Kebijakan & Alur Kerja CI/CD (Continuous Integration & Continuous Deployment)

Untuk menjaga stabilitas kode bersama, proyek CariKos menerapkan alur kerja berbasis otomatisasi pipeline GitHub Actions.

### A. Continuous Integration (CI Pipeline)
- **Berkas Konfigurasi**: `.github/workflows/ci.yml`
- **Pemicu Otomatis**:
  - Setiap `push` ke branch `main`, `develop`, atau `feature/**`.
  - Setiap pembukaan atau pembaruan `pull_request` menuju `main` atau `develop`.
- **Pemeriksaan Otomatis yang Dijalankan**:
  1. **Frontend**: Menjalankan `npm ci` lalu `npm run build` Next.js 16 (Turbopack compile, typecheck, dan validasi prerender 21 rute).
  2. **Backend**: Menjalankan `npm ci` lalu verifikasi sintaksis seluruh file JavaScript Node.js ES Modules (`node --check`).
- **Aturan Merge**: Pull Request **TIDAK BISA DI-MERGE** jika status CI masih merah (*Failed*). Setiap anggota bertanggung jawab memastikan CI hijau sebelum meminta rekan tim me-review kodenya.

### B. Continuous Deployment (CD) dan Keamanan Produksi
- **Mengapa Auto-Deploy ke Produksi Belum Diaktifkan?**
  Karena aplikasi sedang dalam tahap pengembangan aktif oleh 4 orang secara paralel. Auto-deploy langsung ke domain produksi pada setiap push akan:
  1. Menampilkan halaman placeholder setengah jadi kepada pengguna publik.
  2. Berisiko merusak basis data produksi jika skema Mongoose atau data seeder masih berubah-ubah.
  3. Berisiko mengekspos kredensial produksi (MongoDB Atlas, Cloudinary) yang belum terisolasi.
- **Mekanisme Guarded CD (`.github/workflows/cd.yml`)**:
  1. **Preview Deployments**: Setiap Pull Request dapat diuji melalui deployment preview sementara (misalnya Vercel Preview) tanpa menyentuh database produksi.
  2. **Manual Dispatch & Release Tag Gate**: Deployment ke server produksi dikunci. Proses rilis hanya dapat dijalankan melalui:
     - Tombol **Run workflow** manual di tab Actions GitHub (`workflow_dispatch`); ATAU
     - Pembuatan Git Release Tag resmi (format `v*.*.*`, contoh: `v1.0.0`) ketika seluruh fitur Milestone 2 telah selesai diuji dan disetujui bersama.

---

## 4. Alur Kerja Git Standar (Git Workflow) untuk 4 Anggota

1. **Selalu Tarik Kode Terbaru Sebelum Mulai**:
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. **Buat Branch Fitur Baru**:
   Gunakan format penamaan `feature/<nama-tugas>`, contoh:
   - Anggota 1: `feature/auth-login-register` atau `feature/admin-dashboard`
   - Anggota 2: `feature/kos-catalog-filter` atau `feature/owner-manage-kos`
   - Anggota 3: `feature/kos-detail-booking` atau `feature/user-favorites`
   - Anggota 4: `feature/realtime-chat` atau `feature/socket-notifications`
3. **Uji Build Lokal Sebelum Commit**:
   ```bash
   cd frontend
   npm run build
   ```
   Pastikan tidak ada galat kompilasi (21 rute berstatus Static/PPR).
4. **Push dan Buka Pull Request (PR)**:
   ```bash
   git push origin feature/<nama-tugas>
   ```
   Buka PR menuju branch `develop`. Tunggu GitHub Actions CI selesai memeriksa (*checks passed*).
5. **Peer Review**: Minimal 1 anggota tim lain memeriksa dan memberikan *Approve* sebelum PR di-merge.
