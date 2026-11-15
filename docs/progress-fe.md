# Laporan Progres Pengembangan Frontend (CariKos Web App)

Dokumen ini mencatat status implementasi, struktur direktori, antarmuka halaman, dan pembagian pengerjaan modul frontend (`frontend/`) aplikasi CariKos.

---

## 1. Ringkasan Status Keseluruhan Frontend

| Kategori | Status | Keterangan |
| :--- | :--- | :--- |
| **Framework & Compiler** | Selesai (100%) | Next.js 16.4.5 (App Router), React 19, Turbopack, Tailwind CSS v4 |
| **Fondasi Arsitektur** | Selesai (100%) | Klien API Axios terpusat dengan Bearer Token interceptor, Singleton Socket.IO |
| **State Global & Sesi** | Selesai (100%) | `AuthContext` (manajemen login/token/campuses) dan `SocketContext` (real-time listener) |
| **Halaman Beranda & Navigasi** | Selesai (100%) | Landing page modular (`HeroSection`, `HeroKosMarquee`, `FeaturedCatalog`, `ValueProps`, `OwnerCTA`, `Footer`) dan `Navbar.jsx` adaptif per role |
| **Portal UI Terpadu** | Selesai (100%) | `PortalShell`, `PortalPageHeader`, `PortalUI`, `RefreshButton`, dan `NavbarNotifications` untuk keseragaman portal Pemilik & Admin |
| **Pencarian Kos Terpadu** | Selesai (100%) | Penggabungan katalog filter multikriteria + geospasial kampus/GPS (`UGM` default, Nominatim custom search, slider radius 1–10 km, sort comparison) |
| **Seluruh Rute Halaman** | Terimplementasi (21 rute) | Seluruh rute utama telah terhubung ke service & custom hook masing-masing (tidak ada placeholder `PlaceholderPage` tersisa di rute `app/`) |
| **Pipeline CI/CD** | Selesai (100%) | GitHub Actions `.github/workflows/ci.yml` & `.github/workflows/cd.yml` |
| **Kompilasi Build** | Lolos (100%) | Pengujian `npm run build` sukses merender 21/21 rute dan `eslint` 0 errors |

---

## 2. Fondasi & Komponen Bersama yang Telah Diimplementasikan

- [x] **`src/lib/api.js`**: Instance Axios terpusat yang otomatis menyisipkan header `Authorization: Bearer <token>` dari `localStorage` dan menangani error 401 (*auto-logout*).
- [x] **`src/lib/socket.js`**: Instance Singleton Socket.IO Client yang terhubung ke backend `http://localhost:5000` dengan pengaturan auto-reconnect.
- [x] **`src/lib/utils.js`**: Fungsi utilitas terstandarisasi (`formatRupiah`, `formatDate`, `formatTime`, `cn`).
- [x] **`src/context/AuthContext.jsx` & `src/context/SocketContext.jsx`**: Global state sesi pengguna, daftar kampus tersimpan (`savedCampuses`), koneksi WebSocket, dan push notifikasi.
- [x] **`src/components/Navbar.jsx`**: Top bar kompak (`h-16`) dengan menu adaptif:
  - **Guest:** header bersih (logo `CariKos`, `Untuk Pemilik`, `Masuk` + link `Katalog Kos` di menu mobile).
  - **`PENCARI_KOS`:** `Katalog Kos`, `Favorit`, `Booking`, `Pesan`.
  - **`PEMILIK_KOS`:** `Portal Pemilik`, `Kos Saya`, `Booking`, `Pesan`.
  - **`ADMIN`:** `Panel Admin`, `Verifikasi`, `Pengguna`, `Pesan`.
- [x] **`src/components/portal/*` (`PortalShell`, `PortalPageHeader`, `PortalUI`)**: Shell navigasi sidebar dan komponen dashboard seragam untuk portal Pemilik Kos dan Administrator.
- [x] **`src/components/ui/RefreshButton.jsx`**: Tombol muat ulang data ikon-pertama yang seragam untuk portal (`variant="portal"`) dan halaman publik (`variant="public"`).
- [x] **`src/features/kos/utils/campusStorage.js` & `CampusPickerPanel.jsx`**: Penyimpanan kampus tamu (`localStorage`), daftar preset populer (default awal `UGM`), serta pencarian kampus bebas OpenStreetMap Nominatim dengan fallback langsung di browser.

---

## 3. Matriks Progres Rute & Modul per Anggota Tim

Keterangan status:
- `[x]` Terimplementasi & Terhubung
- `[/]` Masih Perlu Penyempurnaan / Belum Tersambung Penuh

### 3.1 Anggota 1: Autentikasi Pengguna & Portal Administrator
- [x] **Fondasi Klien API & Auth State**: `src/lib/api.js` dan `src/context/AuthContext.jsx`.
- [x] **Modul Logic & Service Auth/Admin**: `src/features/auth/*` dan `src/features/admin/*`.
- [x] **Halaman Masuk (`/auth/login`)**: Terintegrasi dengan `useAuthForm.js`.
- [x] **Halaman Pendaftaran (`/auth/register`)**: Terintegrasi dengan `useAuthForm.js` dan pilihan role.
- [x] **Dashboard Statistik Admin (`/admin/dashboard`)**: Ringkasan metrik user & properti menggunakan `PortalShell` dan `GET /api/admin/stats`.
- [x] **Audit Pengajuan Kos (`/admin/submissions`)**: Antrean kos `Pending`, preview detail, aksi `Approve` & `Reject` dengan alasan via `useAdminSubmissions.js`.
- [x] **Manajemen Akun Pengguna (`/admin/users`)**: Tabel user (`GET /api/admin/users`) dan mutasi role (`PATCH /api/admin/users/:id/role`).

### 3.2 Anggota 2: Katalog Eksplorasi Terpadu, Geospasial & Manajemen Kos Pemilik
- [x] **Pencarian Kos Terpadu (`/kos`)**: Menggabungkan filter multikriteria (`KosFilterSidebar.jsx`) dengan filter radius kampus/GPS (`UGM` default, `+ Tambah Kampus` preset atau pencarian bebas Nominatim, GPS perangkat, slider 1–10 km) dan pengurutan (`Terdekat`, `Terbaru`, `Harga Termurah`, `Harga Tertinggi`, `Kamar Tersedia`) via `useKosList.js`.
- [x] **Kompatibilitas Rute `/kos/nearby`**: Mengarahkan otomatis (`redirect`) ke `/kos?campus=UGM&radius=5`.
- [x] **Dashboard Pemilik Kos (`/owner/dashboard`)**: Statistik properti, tingkat okupansi, estimasi pendapatan, ringkasan booking masuk, dan daftar properti via `PortalShell`.
- [x] **Manajemen Inventaris Kos Pemilik (`/owner/kos`)**: Tabel kos milik owner, update instan ketersediaan kamar, hapus, dan ajukan verifikasi via `useOwnerKos.js`.
- [x] **Form Tambah & Edit Kos + Upload Cloudinary (`/owner/kos/tambah` & `/owner/kos/[id]/edit`)**: Form spesifikasi kos, koordinat, dan upload galeri foto (`POST /api/owner/upload`).

### 3.3 Anggota 3: Detail Properti, Transaksi Booking & Wishlist
- [x] **Halaman Detail Kos (`/kos/[id]`)**: Galeri foto, fasilitas, ketersediaan kamar, kontak pemilik, ulasan, dan integrasi `useKosDetail.js`.
- [x] **Modal Pengajuan Booking Kamar**: Terhubung dengan `createBooking()` pada `useBookings.js`.
- [x] **Riwayat Booking Mahasiswa (`/bookings`)**: Tabel riwayat sewa dan pembatalan status `PENDING` via `useBookings.js`.
- [x] **Manajemen Booking Masuk Pemilik (`/owner/bookings`)**: Antrean permohonan sewa serta aksi `Approve` dan `Reject` via `useOwnerBookings.js`.
- [x] **Kos Favorit / Wishlist (`/favorites`)**: Daftar favorit (`GET /api/favorites`) dan tombol toggle simpan/hapus favorit pada kartu & detail kos.

### 3.4 Anggota 4: Chat Real-Time, Notifikasi Socket.IO & Sistem Ulasan
- [x] **Fondasi Socket.IO & Context**: `src/lib/socket.js` dan `src/context/SocketContext.jsx`.
- [x] **Inbox Percakapan Chat (`/chat`)**: Daftar obrolan aktif terhubung ke `useChat.js`.
- [x] **Ruang Obrolan Real-Time (`/chat/[userId]`)**: Pengiriman & penerimaan pesan real-time via Socket.IO + fallback REST API.
- [x] **Komponen Notifikasi Navbar (`src/components/layout/NavbarNotifications.jsx`)**: Lonceng notifikasi dengan unread counter, dropdown riwayat (`GET /api/notifications`), dan aksi tandai dibaca.
- [x] **Sistem Ulasan & Rating Bintang**: Daftar ulasan kos serta form pemberian rating 1–5 di `/kos/[id]` melalui `useKosDetail.js`.

### 3.5 Komponen Pendukung Beranda (`SupportButton.jsx`)
- [/] **Tombol Bantuan Mengambang (`src/components/SupportButton.jsx`)**: UI tombol Customer Support di sudut kanan bawah beranda (`/`), saat ini masih berupa aksi statis (`alert("Layanan Bantuan & Chat Customer Support CariKos")`) dan belum tersambung ke modal bantuan/FAQ atau kanal chat dukungan.

---

## 4. Rencana Tindak Lanjut Frontend (Next Action Items)

1. **Menyambungkan `SupportButton.jsx`**: Mengganti `alert(...)` dengan panel bantuan/FAQ ringkas atau pintasan menuju halaman kontak/chat admin dukungan.
2. **Uji Integrasi End-to-End Frontend + Backend**: Verifikasi alur penuh pada server lokal aktif (`npm run dev` di backend port `5000` & frontend port `3000`) untuk seluruh skenario peran (`PENCARI_KOS`, `PEMILIK_KOS`, `ADMIN`).
3. **Optimasi Minor Lint**: Mengganti tag `<img>` pada `src/app/admin/submissions/page.jsx` bila diperlukan untuk menghilangkan warning `@next/next/no-img-element`.
