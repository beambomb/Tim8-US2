# Laporan Progres Pengembangan Frontend (CariKos Web App)

Dokumen ini mencatat status implementasi, struktur direktori, antarmuka halaman, dan pembagian pengerjaan modul frontend (`frontend/`) aplikasi CariKos.

---

## 1. Ringkasan Status Keseluruhan Frontend

| Kategori | Status | Keterangan |
| :--- | :--- | :--- |
| **Framework & Compiler** | Selesai (100%) | Next.js 16.4.5 (App Router), React 19, Turbopack, Tailwind CSS v4 |
| **Sistem Desain & Tema** | Selesai (100%) | Palet **Architectural Limestone & Royal Cobalt** (`#F5F7FA`, `#FFFFFF`, `#0F172A`, `#1D4ED8`) untuk seluruh halaman publik |
| **Fondasi Arsitektur** | Selesai (100%) | Klien API Axios terpusat dengan Bearer Token interceptor, Singleton Socket.IO |
| **State Global & Sesi** | Selesai (100%) | `AuthContext` (manajemen login/token) dan `SocketContext` (real-time listener) |
| **Halaman Beranda & Navigasi** | Selesai (100%) | Split-hero asimetris dengan typewriter search, `HeroKosMarquee` interaktif (hover-pause, drag, scroll horizontal, tombol `<` / `>`), dan `Navbar` adaptif berbasis role |
| **Pemisahan Logic & UI** | Selesai (100%) | Modul `src/features/*` (services, custom hooks, dan komponen fitur per domain tugas) |
| **Struktur Rute Aplikasi** | Berjalan (7/18 Rute Utama) | 7 rute terimplementasi penuh (`/`, `/kos`, `/kos/nearby`, `/owner/dashboard`, `/owner/kos`, `/owner/kos/tambah`, `/owner/kos/[id]/edit`); 11 rute lainnya siap sebagai `PlaceholderPage` |
| **Pipeline CI/CD** | Selesai (100%) | GitHub Actions `.github/workflows/ci.yml` & `.github/workflows/cd.yml` |
| **Kompilasi Build** | Lolos (100%) | Pengujian `npm run build` dan `npx eslint` sukses tanpa galat |

---

## 2. Fondasi Bersama yang Telah Diimplementasikan

- [x] **`src/lib/api.js`**: Instance Axios terpusat yang otomatis menyisipkan header `Authorization: Bearer <token>` dari `localStorage` dan menangani error 401 (*auto-logout*).
- [x] **`src/lib/socket.js`**: Instance Singleton Socket.IO Client yang siap terhubung ke backend `http://localhost:5000` dengan pengaturan auto-reconnect.
- [x] **`src/lib/utils.js`**: Kumpulan fungsi pembantu terstandarisasi: `formatRupiah(amount)`, `formatDate(dateString)`, `formatTime(dateString)`, dan `cn(...classes)`.
- [x] **`src/context/AuthContext.jsx`**: Global Provider untuk mengelola login, register, logout, penyimpanan token, dan pengecekan sesi aktif via `GET /api/auth/me`.
- [x] **`src/context/SocketContext.jsx`**: Global Provider untuk menangani koneksi WebSocket, registrasi ke room pribadi user (`joinRoom`), dan listener notifikasi real-time.
- [x] **`src/components/providers/AppProviders.jsx`**: Komponen wrapper penyatu context di `src/app/layout.jsx` agar root layout tetap berupa Server Component.
- [x] **Antarmuka Beranda & Navigasi Publik (`src/app/page.jsx`, `src/app/globals.css`, `src/components/*`)**:
  - `Navbar.jsx` adaptif berbasis status login & role (`Guest`, `Mahasiswa`, `Pemilik Kos`, `Admin`) dengan menu terpusat.
  - `HeroSection.jsx` dengan tata letak split-hero asimetris, pencarian *typewriter* interaktif menuju `/kos`, dan CTA adaptif per role (`RoleAdaptiveCTA`).
  - `HeroKosMarquee.jsx` interaktif berbasis *native horizontal scroll* yang jeda otomatis saat *hover/focus*, mendukung klik-geser (*drag*), gulir horizontal, serta tombol navigasi `<` / `>` dengan efek pudar tepi (`mask-image`).
  - `FeaturedCatalog.jsx`, `ValueProps.jsx`, `OwnerCTA.jsx`, dan `Footer.jsx` menggunakan palet Architectural Limestone & Royal Cobalt.
- [x] **`src/components/ui/PlaceholderPage.jsx`**: Komponen visual interaktif untuk rute-rute dalam tahap pengembangan, lengkap dengan badge penanggung jawab dan rute endpoint terkait.
- [x] **`src/features/*`**: Kerangka arsitektur pemisahan logic dan UI (Services, Custom Hooks, dan Feature Components) untuk domain Auth, Admin, Kos, Owner, Booking, dan Chat.
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
- [x] **Modul Logic, Service & Komponen Katalog Kos**: `src/features/kos/services/kosService.js`, `useKosList.js`, `useNearbyKos.js`, serta `KosCardReal.jsx`, `KosFilterSidebar.jsx`, `CampusPresetSelector.jsx`, dan `KosCatalogSkeleton.jsx`.
- [x] **Modul Logic, Service & Komponen Kos Pemilik**: `src/features/owner/services/ownerService.js`, `useOwnerKos.js`, `useOwnerDashboard.js`, serta `OwnerLayout.jsx`, `OwnerMetricsGrid.jsx`, `OwnerKosTable.jsx`, dan `OwnerKosForm.jsx`.
- [x] **Katalog & Filter Kos Lengkap (`/kos`)**:
  - [x] Halaman katalog terimplementasi penuh: `src/app/kos/page.jsx`.
  - [x] Dokumen instruksi teknis: `src/app/kos/README.md`.
  - [x] Integrasi UI filter katalog, sidebar pencarian, dan kartu kos (`KosCardReal.jsx`) dengan hook `useKosList.js` dalam palet Architectural Limestone & Royal Cobalt.
- [x] **Kos Terdekat Kampus Geospasial (`/kos/nearby`)**:
  - [x] Halaman pencarian terdekat terimplementasi penuh: `src/app/kos/nearby/page.jsx`.
  - [x] Dokumen instruksi teknis: `src/app/kos/nearby/README.md`.
  - [x] Integrasi Geolocation API browser, preset koordinat kampus (`CampusPresetSelector.jsx`), dan kalkulasi jarak radius ke `GET /api/kos/nearby` melalui `useNearbyKos.js`.
- [x] **Dashboard Pemilik Kos (`/owner/dashboard`)**:
  - [x] Halaman dashboard pemilik terimplementasi penuh: `src/app/owner/dashboard/page.jsx`.
  - [x] Dokumen instruksi teknis: `src/app/owner/dashboard/README.md`.
  - [x] Integrasi metrik analitik (`OwnerMetricsGrid.jsx`), ringkasan permohonan booking, dan inventaris properti melalui `useOwnerDashboard.js`.
- [x] **Manajemen Inventaris Kos Pemilik (`/owner/kos`)**:
  - [x] Halaman manajemen kos terimplementasi penuh: `src/app/owner/kos/page.jsx`.
  - [x] Dokumen instruksi teknis: `src/app/owner/kos/README.md`.
  - [x] Integrasi `OwnerKosTable.jsx`, filter status verifikasi (`ALL`/`Approved`/`Pending`/`Rejected`), aksi hapus/verifikasi/update kuota kamar dengan `useOwnerKos.js`.
- [x] **Form Tambah & Edit Kos + Upload Foto (`/owner/kos/tambah` & `.../edit`)**:
  - [x] Halaman create dan edit terimplementasi penuh: `src/app/owner/kos/tambah/page.jsx` dan `src/app/owner/kos/[id]/edit/page.jsx`.
  - [x] Dokumen instruksi teknis: `README.md` pada masing-masing folder.
  - [x] Implementasi `OwnerKosForm.jsx` (mode tambah & edit), preset koordinat kampus, pemilihan fasilitas, serta dropzone upload hingga 5 foto (maks. 5 MB/file) melalui `POST /api/owner/upload`.

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

1. **Sprint 1 (Fondasi Autentikasi & Detail Properti)**:
   - Anggota 1 menyelesaikan integrasi form di `/auth/login` dan `/auth/register` agar seluruh anggota tim dapat login dan memperoleh token JWT riil.
   - *(Selesai)* Anggota 2 menyelesaikan katalog publik `/kos`, pencarian geospasial `/kos/nearby`, portal pemilik `/owner/dashboard`, `/owner/kos`, dan form `/owner/kos/tambah` + `/owner/kos/[id]/edit` (PR `#15`, diperbarui visual beranda & katalog pada branch `fe-homepage-experiment-1`).
   - Anggota 3 menghubungkan `/kos/[id]` dengan detail data kos riil menggunakan `useKosDetail.js`.
   - Anggota 4 menyambungkan koneksi aktif Socket.IO saat user login.
2. **Sprint 2 (Modul Transaksi, Admin, Chat & Wishlist)**:
   - Form pengajuan booking mahasiswa (`/bookings`), modal booking di `/kos/[id]`, dan persetujuan pemilik kos (`/owner/bookings`) oleh Anggota 3.
   - Fitur wishlist/favorit (`/favorites`) oleh Anggota 3.
   - Audit verifikasi pengajuan kos (`/admin/submissions`), statistik (`/admin/dashboard`), dan manajemen user (`/admin/users`) oleh Anggota 1.
   - Chatting real-time (`/chat` dan `/chat/[userId]`), notifikasi lonceng + toast, dan ulasan/rating bintang oleh Anggota 4.
