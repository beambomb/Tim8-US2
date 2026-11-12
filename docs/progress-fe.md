# Laporan Progres Pengembangan Frontend (CariKos Web App)

Dokumen ini mencatat status implementasi, struktur direktori, antarmuka halaman, dan pembagian pengerjaan modul frontend (`frontend/`) aplikasi CariKos.

---

## 1. Ringkasan Status Keseluruhan Frontend

| Kategori | Status | Keterangan |
| :--- | :--- | :--- |
| **Framework & Compiler** | Selesai (100%) | Next.js 16.4.5 (App Router), React 19, Turbopack, Tailwind CSS v4 |
| **Fondasi Arsitektur** | Selesai (100%) | Klien API Axios terpusat dengan Bearer Token interceptor, Singleton Socket.IO |
| **State Global & Sesi** | Selesai (100%) | `AuthContext` (manajemen login/token) dan `SocketContext` (real-time listener) |
| **Halaman Beranda** | Selesai (100%) | Desain modular, Hero section Full HD tajam (`kamarKos2.webp`), search bar, footer |
| **Pemisahan Logic & UI**| Selesai (100%) | Modul `src/features/*` (services & custom hooks per domain tugas) |
| **Struktur Rute Aplikasi**| Selesai (100%) | 21 rute telah dibuatkan placeholder interaktif dan file `README.md` panduan teknis |
| **Pipeline CI/CD** | Selesai (100%) | GitHub Actions `.github/workflows/ci.yml` & `.github/workflows/cd.yml` |
| **Kompilasi Build** | Lolos (100%) | Pengujian `npm run build` sukses merender seluruh 21 rute tanpa galat |

---

## 2. Fondasi Bersama yang Telah Diimplementasikan

- [x] **`src/lib/api.js`**: Instance Axios terpusat yang otomatis menyisipkan header `Authorization: Bearer <token>` dari `localStorage` dan menangani error 401 (*auto-logout*).
- [x] **`src/lib/socket.js`**: Instance Singleton Socket.IO Client yang siap terhubung ke backend `http://localhost:5000` dengan pengaturan auto-reconnect.
- [x] **`src/lib/utils.js`**: Kumpulan fungsi pembantu terstandarisasi: `formatRupiah(amount)`, `formatDate(dateString)`, `formatTime(dateString)`, dan `cn(...classes)`.
- [x] **`src/context/AuthContext.jsx`**: Global Provider untuk mengelola login, register, logout, penyimpanan token, dan pengecekan sesi aktif via `GET /api/auth/me`.
- [x] **`src/context/SocketContext.jsx`**: Global Provider untuk menangani koneksi WebSocket, registrasi ke room pribadi user (`joinRoom`), dan listener notifikasi real-time.
- [x] **`src/components/providers/AppProviders.jsx`**: Komponen wrapper penyatu context di `src/app/layout.jsx` agar root layout tetap berupa Server Component.
- [x] **`src/components/ui/PlaceholderPage.jsx`**: Komponen visual interaktif untuk rute-rute dalam tahap pengembangan, lengkap dengan badge penanggung jawab dan rute endpoint terkait.
- [x] **`src/features/*`**: Kerangka arsitektur pemisahan logic dan UI (Services & Custom Hooks) untuk domain Auth, Admin, Kos, Owner, Booking, dan Chat.
- [x] **`.github/workflows/ci.yml`**: Pipeline otomatis GitHub Actions untuk memvalidasi Next.js build dan integritas sintaks Node.js pada setiap PR/push.
- [x] **`.github/workflows/cd.yml`**: Alur rilis deployment terkontrol (*guarded CD*) berbasis staging preview dan release gate.

---

## 3. Matriks Progres Rute & Modul per Anggota Tim

Keterangan status:
- `[x]` Selesai / Terimplementasi Penuh
- `[/]` Sedang Berjalan / Fondasi & Placeholder Siap
- `[ ]` Belum Dimulai

### 3.1 Anggota 1: Autentikasi Pengguna & Portal Administrator
- [x] **Fondasi Klien API & Auth State**: `src/lib/api.js` dan `src/context/AuthContext.jsx`.
- [x] **Modul Logic & Service Auth**: `src/features/auth/services/authService.js` dan `src/features/auth/hooks/useAuthForm.js`.
- [x] **Modul Logic & Service Admin**: `src/features/admin/services/adminService.js` dan `src/features/admin/hooks/useAdminSubmissions.js`.
- [/] **Halaman Masuk (`/auth/login`)**:
  - [x] Folder dan placeholder interaktif: `src/app/auth/login/page.jsx`.
  - [x] Dokumen instruksi teknis: `src/app/auth/login/README.md`.
  - [ ] Integrasi UI form login dengan hook `useAuthForm.js`.
- [/] **Halaman Pendaftaran (`/auth/register`)**:
  - [x] Folder dan placeholder interaktif: `src/app/auth/register/page.jsx`.
  - [x] Dokumen instruksi teknis: `src/app/auth/register/README.md`.
  - [ ] Integrasi UI form register dengan hook `useAuthForm.js`.
- [/] **Dashboard Statistik Admin (`/admin/dashboard`)**:
  - [x] Folder dan placeholder interaktif: `src/app/admin/dashboard/page.jsx`.
  - [x] Dokumen instruksi teknis: `src/app/admin/dashboard/README.md`.
  - [ ] Integrasi kartu metrik analitik dari `GET /api/admin/stats`.
- [/] **Audit Pengajuan Kos (`/admin/submissions`)**:
  - [x] Folder dan placeholder interaktif: `src/app/admin/submissions/page.jsx`.
  - [x] Dokumen instruksi teknis: `src/app/admin/submissions/README.md`.
  - [ ] Integrasi antrean kos pending dengan hook `useAdminSubmissions.js`.
- [/] **Manajemen Akun Pengguna (`/admin/users`)**:
  - [x] Folder dan placeholder interaktif: `src/app/admin/users/page.jsx`.
  - [x] Dokumen instruksi teknis: `src/app/admin/users/README.md`.
  - [ ] Integrasi tabel user (`GET /api/admin/users`) dan dropdown mutasi role (`PATCH /api/admin/users/:id/role`).

---

### 3.2 Anggota 2: Katalog Eksplorasi, Geospasial & Manajemen Kos Pemilik
- [x] **Modul Logic & Service Katalog Kos**: `src/features/kos/services/kosService.js` dan `src/features/kos/hooks/useKosList.js`.
- [x] **Modul Logic & Service Kos Pemilik**: `src/features/owner/services/ownerService.js` dan `src/features/owner/hooks/useOwnerKos.js`.
- [/] **Katalog & Filter Kos Lengkap (`/kos`)**:
  - [x] Folder dan placeholder interaktif: `src/app/kos/page.jsx`.
  - [x] Dokumen instruksi teknis: `src/app/kos/README.md`.
  - [ ] Integrasi UI filter katalog dengan hook `useKosList.js`.
- [/] **Kos Terdekat Kampus Geospasial (`/kos/nearby`)**:
  - [x] Folder dan placeholder interaktif: `src/app/kos/nearby/page.jsx`.
  - [x] Dokumen instruksi teknis: `src/app/kos/nearby/README.md`.
  - [ ] Integrasi Geolocation API browser dan kalkulasi radius jarak ke `GET /api/kos/nearby`.
- [/] **Dashboard Pemilik Kos (`/owner/dashboard`)**:
  - [x] Folder dan placeholder interaktif: `src/app/owner/dashboard/page.jsx`.
  - [x] Dokumen instruksi teknis: `src/app/owner/dashboard/README.md`.
  - [ ] Integrasi metrik total kos dan antrean booking baru dari `GET /api/owner/kos`.
- [/] **Manajemen Inventaris Kos Pemilik (`/owner/kos`)**:
  - [x] Folder dan placeholder interaktif: `src/app/owner/kos/page.jsx`.
  - [x] Dokumen instruksi teknis: `src/app/owner/kos/README.md`.
  - [ ] Integrasi tabel kos owner dan aksi status dengan hook `useOwnerKos.js`.
- [/] **Form Tambah & Edit Kos + Upload Cloudinary (`/owner/kos/tambah` & `.../edit`)**:
  - [x] Folder dan placeholder interaktif: `src/app/owner/kos/tambah/page.jsx` dan `src/app/owner/kos/[id]/edit/page.jsx`.
  - [x] Dokumen instruksi teknis: `README.md` pada masing-masing folder.
  - [ ] Implementasi form spesifikasi kos dan dropzone upload hingga 5 foto ke Cloudinary (`POST /api/owner/upload`).

---

### 3.3 Anggota 3: Detail Properti, Transaksi Booking & Wishlist
- [x] **Modul Logic & Hook Detail Kos**: `src/features/kos/hooks/useKosDetail.js`.
- [x] **Modul Logic & Service Booking**: `src/features/booking/services/bookingService.js` dan `src/features/booking/hooks/useBookings.js`.
- [x] **Modul Logic Hook Booking Masuk Pemilik**: `src/features/owner/hooks/useOwnerBookings.js`.
- [/] **Halaman Detail Kos Komprehensif (`/kos/[id]`)**:
  - [x] Folder dan placeholder interaktif: `src/app/kos/[id]/page.jsx`.
  - [x] Dokumen instruksi teknis: `src/app/kos/[id]/README.md`.
  - [ ] Integrasi data kos dinamis dengan hook `useKosDetail.js`.
- [/] **Modal Pengajuan Booking Kamar**:
  - [x] Dokumen instruksi teknis: `src/features/booking/README.md`.
  - [ ] Integrasi dialog modal sewa dengan method `createBooking()` dari `useBookings.js`.
- [/] **Riwayat Booking Mahasiswa (`/bookings`)**:
  - [x] Folder dan placeholder interaktif: `src/app/bookings/page.jsx`.
  - [x] Dokumen instruksi teknis: `src/app/bookings/README.md`.
  - [ ] Integrasi tabel riwayat booking dan pembatalan dengan hook `useBookings.js`.
- [/] **Manajemen Permohonan Booking Masuk Pemilik (`/owner/bookings`)**:
  - [x] Folder dan placeholder interaktif: `src/app/owner/bookings/page.jsx`.
  - [x] Dokumen instruksi teknis: `src/app/owner/bookings/README.md`.
  - [ ] Integrasi antrean sewa masuk, tombol Approve, dan tombol Reject dengan hook `useOwnerBookings.js`.
- [/] **Modul Kos Favorit / Wishlist (`/favorites`)**:
  - [x] Folder dan placeholder interaktif: `src/app/favorites/page.jsx`.
  - [x] Dokumen instruksi teknis: `src/app/favorites/README.md`.
  - [ ] Integrasi daftar favorit (`GET /api/favorites`) dan toggle love icon di kartu kos.

---

### 3.4 Anggota 4: Chat Real-Time, Notifikasi Socket.IO & Sistem Ulasan
- [x] **Fondasi Singleton Socket.IO & Context**: `src/lib/socket.js` dan `src/context/SocketContext.jsx`.
- [x] **Modul Logic & Service Chat**: `src/features/chat/services/chatService.js` dan `src/features/chat/hooks/useChat.js`.
- [/] **Inbox Percakapan Chat (`/chat`)**:
  - [x] Folder dan placeholder interaktif: `src/app/chat/page.jsx`.
  - [x] Dokumen instruksi teknis: `src/app/chat/README.md`.
  - [ ] Integrasi daftar percakapan aktif dengan hook `useChat.js`.
- [/] **Ruang Obrolan Real-Time (`/chat/[userId]`)**:
  - [x] Folder dan placeholder interaktif: `src/app/chat/[userId]/page.jsx`.
  - [x] Dokumen instruksi teknis: `src/app/chat/[userId]/README.md`.
  - [ ] Integrasi obrolan real-time (listener socket `receive_message` & auto-scroll) dengan hook `useChat.js`.
- [/] **Komponen Notifikasi Lonceng & Pop-up Toast**:
  - [ ] Bell icon di navbar dengan unread counter dan dropdown riwayat notifikasi (`GET /api/notifications`).
  - [ ] Floating toast alert yang otomatis muncul saat event socket `notification` dipancarkan server.
  - [ ] Tombol aksi tandai dibaca (`PATCH /api/notifications/:id/read` dan `PATCH /api/notifications/read-all`).
- [/] **Sistem Ulasan & Rating Bintang**:
  - [x] Dokumen instruksi teknis: `src/features/review/README.md`.
  - [ ] Integrasi daftar ulasan dan form rating bintang 1-5 dengan method `submitReview()` di `useKosDetail.js`.

---

## 4. Rencana Kerja Selanjutnya (Next Sprint Goals)

1. **Sprint 1 (Prioritas Awal)**:
   - Anggota 1 menyelesaikan integrasi form di `/auth/login` dan `/auth/register` agar seluruh anggota tim dapat login dan memperoleh token JWT riil.
   - Anggota 2 menghubungkan `/kos` dengan data kos Approved dari backend.
   - Anggota 3 menghubungkan `/kos/[id]` dengan detail data kos riil.
   - Anggota 4 menyambungkan koneksi aktif Socket.IO saat user login.
2. **Sprint 2 (Modul Transaksi & Operasional)**:
   - Form booking mahasiswa dan persetujuan pemilik kos.
   - Form tambah kos baru dengan unggah foto ke Cloudinary.
   - Audit verifikasi pengajuan kos oleh admin.
   - Chatting real-time mahasiswa dengan pemilik kos.
