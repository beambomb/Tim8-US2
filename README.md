# CariKos

## Deskripsi Aplikasi

CariKos adalah aplikasi web yang menyediakan platform terpusat untuk mencari, mengelola, dan memverifikasi informasi kos di sekitar lingkungan kampus.

Informasi kos di sekitar kampus sering tersebar di grup WhatsApp, media sosial, dan banner, sehingga sulit didapat secara lengkap dan terkini. CariKos mengumpulkan informasi tersebut dalam satu platform dengan tiga jenis pengguna:

- **Pencari Kos**: mencari dan memfilter kos, melihat detail dan kos terdekat, menyimpan favorit, melakukan booking, memberi review, dan chat dengan pemilik kos.
- **Pemilik Kos**: mengelola data kos, ketersediaan kamar, dan foto, mengajukan verifikasi, serta menyetujui atau menolak booking.
- **Administrator**: melihat statistik, mengelola role pengguna, dan memverifikasi (menyetujui atau menolak) pengajuan kos sebelum ditampilkan ke publik.

## Kelompok

**Nama Kelompok:** Tim 8

| No. | Nama | NIM |
|-----|------|-----|
| 1 | Johannes De Deo Dimas Aryobimo | 24/540351/TK/59948 |
| 2 | Bintang Daneswara | 24/541599/TK/60084 |
| 3 | Javier Yazid Janadi | 24/545752/TK/60737 |
| 4 | Desi D Simamora | 23/514990/TK/56564 |

## Fitur Utama Sistem

### 1. Fitur Pencari Kos
- **Direktori dan Filter Kos**: Eksplorasi daftar kos terverifikasi dengan opsi penyaringan dinamis berdasarkan rentang harga, lokasi, tipe kos (Putra/Putri/Campur), fasilitas, dan ketersediaan kamar.
- **Pencarian Radius Terdekat (Geospatial Nearby Search)**: Menghitung jarak lengkung bumi pengguna ke tiap kos menggunakan formula Haversine untuk menemukan kos terdekat berdasarkan batas radius meter atau kilometer.
- **Detail Kos**: Menampilkan informasi lengkap kos, koordinat lokasi, fasilitas, harga, galeri foto, kontak langsung pemilik, dan rata-rata rating.
- **Manajemen Kos Favorit**: Menyimpan daftar kos pilihan untuk kemudahan akses kembali, dengan proteksi pencegahan data favorit ganda.
- **Pengajuan Pemesanan Kamar (Room Booking)**: Mengajukan sewa kamar kos untuk durasi tertentu dengan validasi ketersediaan unit dan pencegahan booking ganda yang masih pending.
- **Ulasan dan Penilaian (Reviews and Ratings)**: Memberikan rating bintang 1-5 dan ulasan tekstual dengan pencegahan review duplikat melalui compound index database.

### 2. Fitur Pemilik Kos
- **Manajemen Kos (CRUD)**: Menambah, mengubah, melihat, dan menghapus data properti kos milik sendiri.
- **Unggah Foto Berbasis Cloud**: Mengunggah foto kos langsung ke Cloudinary melalui Multer dengan validasi format dan ukuran file.
- **Kontrol Ketersediaan Kamar**: Memperbarui status dan jumlah unit kamar kosong secara real-time.
- **Pengajuan Verifikasi Kos**: Mengajukan kos baru ke Administrator dengan pelacakan status (Pending, Approved, Rejected) beserta transparansi catatan alasan penolakan jika ditolak.
- **Manajemen Booking Masuk**: Memeriksa daftar pemesanan masuk dari calon penghuni serta menyetujui (Approved) atau menolak (Rejected) permohonan booking. Persetujuan booking secara otomatis mengurangi stok kamar yang tersedia.

### 3. Fitur Administrator
- **Verifikasi dan Moderasi Kos**: Memeriksa pengajuan kos yang berstatus Pending, menyetujui agar tampil publik, atau menolak dengan catatan alasan perbaikan bagi pemilik kos.
- **Manajemen Hak Akses Pengguna (RBAC)**: Mengelola peran (role) pengguna secara terpusat untuk memisahkan kewenangan sistem.
- **Proteksi Privilege Escalation**: Sanitasi role registrasi publik untuk mencegah eskalasi hak akses ilegal ke level Administrator.
- **Dashboard Statistik Platform**: Menyajikan metrik agregasi ringkas seperti total pengguna per role, status kos (Approved, Pending, Rejected), dan metrik transaksi.

### 4. Fitur Pendukung dan Real-Time
- **Autentikasi dan Otorisasi**: Implementasi stateless authentication menggunakan JSON Web Token (JWT) dan hashing kata sandi dengan bcrypt.
- **Pesan Instan Real-Time (Socket.IO Chat)**: Komunikasi interaktif langsung antara pencari kos dan pemilik kos melalui koneksi WebSocket terisolasi per user room.
- **Sistem Notifikasi Terintegrasi**: Pengiriman pemberitahuan real-time dan riwayat notifikasi ke basis data saat terjadi pembaruan status kos maupun booking.
- **Keamanan HTTP**: Pemasangan HTTP security headers melalui Helmet dan konfigurasi Cross-Origin Resource Sharing (CORS).

## Struktur Folder dan File

```text
carikos/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Automated Continuous Integration (Lint, Build, Syntax Check)
│       └── cd.yml                 # Guarded Continuous Deployment (Manual Dispatch / Release Tag)
├── CariKos.postman_collection.json
├── docs/
│   ├── progress-be.md             # Status kelengkapan backend & endpoints
│   └── progress-fe.md             # Status implementasi frontend per rute
├── pembagian-tugas.md             # Matriks distribusi tugas 4 anggota tim
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── db.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── resetDatabase.js
│   │   ├── seedAdmin.js
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js App Router (21 route pages)
│   │   │   ├── admin/             # Rute Admin (dashboard, submissions, users)
│   │   │   ├── auth/              # Rute Login & Register
│   │   │   ├── bookings/          # Rute Riwayat Booking Pencari
│   │   │   ├── chat/              # Rute Percakapan Real-time
│   │   │   ├── favorites/         # Rute Kos Favorit
│   │   │   ├── kos/               # Rute Katalog, Detail, & Nearby
│   │   │   ├── owner/             # Rute Dashboard & Kelola Kos Pemilik
│   │   │   ├── layout.jsx
│   │   │   └── page.jsx           # Landing page
│   │   ├── components/            # Presentational UI Components
│   │   │   ├── providers/         # AppProviders (Auth & Socket context)
│   │   │   ├── ui/                # Reusable UI components
│   │   │   ├── Footer.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   └── Navbar.jsx
│   │   ├── context/               # Global state contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── features/              # Separation of Concerns (Logic & Services)
│   │   │   ├── admin/             # hooks/useAdminSubmissions.js & services/adminService.js
│   │   │   ├── auth/              # hooks/useAuthForm.js & services/authService.js
│   │   │   ├── booking/           # hooks/useBookings.js & services/bookingService.js
│   │   │   ├── chat/              # hooks/useChat.js & services/chatService.js
│   │   │   ├── kos/               # hooks/useKosList.js, useKosDetail.js & services/kosService.js
│   │   │   └── owner/             # hooks/useOwnerKos.js, useOwnerBookings.js & services/ownerService.js
│   │   └── lib/                   # Shared client utilities
│   │       ├── api.js             # Axios client dengan Bearer Token interceptor
│   │       ├── socket.js          # Singleton WebSocket Socket.IO client
│   │       └── utils.js           # Currency formatter, date helpers, cn utility
│   ├── .env.local.example
│   ├── next.config.mjs
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

## Teknologi yang Digunakan

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Axios, Socket.IO Client
- **Backend:** Node.js, Express.js (ES Modules)
- **Database:** MongoDB, Mongoose
- **Autentikasi & Keamanan:** JSON Web Token (JWT), bcrypt, Helmet, CORS
- **Komunikasi Real-time:** Socket.IO (WebSocket)
- **Media & Penyimpanan Berkas:** Cloudinary API, Multer
- **DevOps & CI/CD:** GitHub Actions (Automated CI Pipeline & Guarded CD Release)
- **Tools Pengembangan:** Git, Visual Studio Code, Postman Collection Runner

## Daftar Endpoint API

### 1. Autentikasi dan Akun
| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| POST | /api/auth/register | Registrasi akun baru (Pencari Kos atau Pemilik Kos) | Publik |
| POST | /api/auth/login | Autentikasi login dan penerbitan token JWT | Publik |
| GET | /api/auth/me | Mendapatkan informasi profil akun yang sedang login | Authenticated |

### 2. Eksplorasi dan Pencari Kos
| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| GET | /api/kos | Menampilkan seluruh kos terverifikasi dengan opsi filter | Publik |
| GET | /api/kos/:id | Menampilkan rincian detail data kos tertentu | Publik |
| GET | /api/kos/nearby | Menampilkan daftar kos terdekat berdasarkan radius (Haversine) | Publik |
| GET | /api/favorites | Menampilkan daftar kos favorit pengguna | Pencari Kos |
| POST | /api/favorites | Menyimpan kos ke daftar favorit | Pencari Kos |
| DELETE | /api/favorites/:id | Menghapus kos dari daftar favorit | Pencari Kos |
| GET | /api/kos/:id/reviews | Menampilkan daftar ulasan dan rating suatu kos | Publik |
| POST | /api/kos/:id/reviews | Menambahkan rating dan ulasan terhadap suatu kos | Pencari Kos |
| POST | /api/bookings | Mengajukan permohonan booking sewa kamar kos | Pencari Kos |
| GET | /api/bookings/my | Melihat seluruh riwayat booking pengguna | Pencari Kos |
| PATCH | /api/bookings/:id/cancel | Membatalkan pengajuan booking yang masih berstatus pending | Pencari Kos |

### 3. Pemilik Kos
| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| GET | /api/owner/kos | Mengambil seluruh kos milik akun pemilik kos | Pemilik Kos |
| POST | /api/owner/kos | Mendaftarkan properti kos baru | Pemilik Kos |
| PUT | /api/owner/kos/:id | Memperbarui seluruh data informasi kos | Pemilik Kos |
| DELETE | /api/owner/kos/:id | Menghapus data properti kos | Pemilik Kos |
| PATCH | /api/owner/kos/:id/availability | Memperbarui jumlah atau status ketersediaan kamar | Pemilik Kos |
| POST | /api/owner/kos/:id/submit | Mengajukan kos ke Administrator untuk verifikasi | Pemilik Kos |
| GET | /api/owner/kos/:id/status | Mengecek status verifikasi pengajuan kos beserta catatannya | Pemilik Kos |
| GET | /api/bookings/owner | Melihat daftar permohonan booking yang masuk untuk kos miliknya | Pemilik Kos |
| PATCH | /api/bookings/:id/status | Menyetujui atau menolak permohonan sewa kamar | Pemilik Kos |

### 4. Administrator
| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| GET | /api/admin/submissions | Menampilkan antrean kos yang menunggu verifikasi (Pending) | Administrator |
| GET | /api/admin/submissions/:id | Melihat rincian kos yang diajukan untuk verifikasi | Administrator |
| PATCH | /api/admin/submissions/:id/approve | Menyetujui pengajuan kos agar dipublikasikan | Administrator |
| PATCH | /api/admin/submissions/:id/reject | Menolak pengajuan kos disertai alasan penolakan | Administrator |
| GET | /api/admin/users | Melihat seluruh data pengguna terdaftar pada sistem | Administrator |
| PATCH | /api/admin/users/:id/role | Mengubah peran (role) pengguna | Administrator |
| GET | /api/admin/stats | Mengambil data statistik dan metrik operasional sistem | Administrator |

### 5. Media, Percakapan, dan Notifikasi
| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| POST | /api/upload | Mengunggah berkas gambar kos ke Cloudinary | Authenticated |
| GET | /api/chat/inbox | Mengambil daftar percakapan aktif pengguna | Authenticated |
| GET | /api/chat/:userId | Mengambil riwayat pesan spesifik dengan pengguna tertentu | Authenticated |
| POST | /api/chat/send | Mengirim pesan teks melalui protokol HTTP alternatif | Authenticated |
| GET | /api/notifications | Mengambil daftar notifikasi milik pengguna | Authenticated |
| PATCH | /api/notifications/:id/read | Menandai satu notifikasi tertentu sebagai telah dibaca | Authenticated |
| PATCH | /api/notifications/read-all | Menandai seluruh notifikasi pengguna sebagai telah dibaca | Authenticated |

## Konfigurasi Lingkungan (Environment Variables)

Buat berkas `.env` di dalam folder `backend/` menggunakan contoh format berikut:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/carikos
JWT_SECRET=rahasia_jwt_carikos_123

# Konfigurasi Cloudinary
CLOUDINARY_CLOUD_NAME=nama_cloud_anda
CLOUDINARY_API_KEY=kunci_api_anda
CLOUDINARY_API_SECRET=rahasia_api_anda
```

## Panduan Instalasi dan Menjalankan Proyek

### 1. Kebutuhan Sistem
- Node.js versi 18.x atau yang lebih baru
- MongoDB instance (MongoDB lokal atau MongoDB Atlas)
- Akun Cloudinary untuk fitur penyimpanan gambar

### 2. Langkah Pemasangan
1. Salin atau unduh repositori ini ke komputer lokal:
   ```bash
   git clone https://github.com/beambomb/Tim8-US2.git
   cd Tim8-US2/backend
   ```
2. Pasang pustaka dan dependensi proyek:
   ```bash
   npm install
   ```
3. Siapkan berkas variabel lingkungan:
   ```bash
   cp .env.example .env
   ```
   Sesuaikan parameter database dan kredensial JWT atau Cloudinary pada berkas `.env`.

### 3. Inisialisasi Data Awal (Opsional)
- Menjalankan seeder akun Administrator awal:
  ```bash
  npm run seed:admin
  ```
  Perintah ini membuat akun Administrator default dengan kredensial:
  - Email: `admin@example.com`
  - Kata Sandi: `admin123`

- Mereset basis data untuk pengujian ulang dari awal:
  ```bash
  npm run db:reset
  ```

### 4. Menjalankan Server
- Mode pengembangan dengan fitur hot-reload:
  ```bash
  npm run dev
  ```
- Server akan berjalan pada alamat: `http://localhost:5000` (atau port yang ditentukan pada berkas `.env`).

## Pengujian Otomatis dengan Postman

Repositori ini menyertakan koleksi pengujian otomatis lengkap pada berkas `CariKos.postman_collection.json`. Koleksi ini telah disusun menjadi 5 Skenario User Journey:

1. **Skenario 1 - Onboarding dan Autentikasi Pengguna**: Pengujian registrasi akun Pencari Kos, Pemilik Kos, login, pengambilan token, pengecekan data profil, dan inisialisasi kotak notifikasi.
2. **Skenario 2 - Pendaftaran Kos, Upload Foto Cloudinary dan Pengajuan Verifikasi (Pemilik)**: Pengujian pembuatan data kos baru dengan URL gambar Cloudinary, pembaruan data, penyesuaian ketersediaan kamar, pengajuan verifikasi ke status Pending, dan pengecekan status.
3. **Skenario 3 - Verifikasi Pengajuan Kos dan Tata Kelola Platform (Administrator)**: Pengujian login Administrator, pengecekan dashboard statistik, pemeriksaan antrean kos Pending, persetujuan (Approve) pengajuan kos, dan manajemen hak akses pengguna.
4. **Skenario 4 - Eksplorasi, Pencarian Radius Terdekat dan Kos Favorit (Pencari Kos)**: Pengujian katalog publik kos yang telah disetujui, pencarian kos terdekat menggunakan formula Haversine, pengecekan detail kos, penambahan kos ke daftar favorit, dan penghapusan favorit.
5. **Skenario 5 - Transaksi Booking Sewa, Ulasan Rating dan Notifikasi Real-Time**: Pengujian pengajuan booking kamar, pemeriksaan daftar pemesanan masuk oleh pemilik, persetujuan booking yang memicu pengurangan kamar kosong otomatis, pemberian rating bintang 5 dan ulasan, kalkulasi rata-rata rating publik, verifikasi pengiriman notifikasi real-time, serta penandaan notifikasi telah dibaca.

### Cara Menjalankan Pengujian di Postman:
1. Buka aplikasi Postman.
2. Klik tombol **Import** dan pilih berkas `CariKos.postman_collection.json` dari direktori utama repositori ini.
3. Pastikan variabel koleksi `baseUrl` mengarah ke `http://127.0.0.1:5000` atau `http://localhost:5000`.
4. Jalankan script reset database sebelum pengetesan jika ingin memulai dari kondisi bersih:
   ```bash
   npm run db:reset
   ```
5. Buka fitur **Collection Runner** di Postman dan pilih folder Skenario 1 hingga 5 secara berurutan untuk menjalankan seluruh rangkaian pengujian otomatis.

## Pemisahan Logic dan UI (Separation of Concerns)

Untuk memfasilitasi kolaborasi 4 anggota tim tanpa saling tumpang tindih (*merge conflicts*) dan menjaga skalabilitas kode, frontend menerapkan prinsip pemisahan ketat antara logika bisnis (*business logic*) dan tampilan visual (*presentational UI*).

### Arsitektur 3 Layer

```text
[Layer 1: Service / API]
  Lokasi: src/features/<domain>/services/*
  Tanggung Jawab: HTTP requests murni via Axios client (@/lib/api), manipulasi query params, payload form data.

        ↓ (dipanggil oleh)

[Layer 2: Custom Hook (Logic)]
  Lokasi: src/features/<domain>/hooks/*
  Tanggung Jawab: State management (useState/useReducer), lifecycle (useEffect), error handling, validasi input, kalkulasi bisnis, dan integrasi WebSocket.

        ↓ (dikonsumsi oleh)

[Layer 3: UI Component (Presentational)]
  Lokasi: src/app/**/page.jsx & src/components/*
  Tanggung Jawab: Markup Tailwind CSS visual murni, render data hasil hook, binding onClick/onSubmit ke handler hook, dan responsivitas layout.
```

### Panduan Implementasi per Anggota Tim

| Domain Modul | Folder Modul | Service File | Custom Hook File | Penanggung Jawab |
|---|---|---|---|---|
| **Autentikasi & Akun** | `src/features/auth/` | `authService.js` | `useAuthForm.js` | Anggota 1 |
| **Administrasi Platform** | `src/features/admin/` | `adminService.js` | `useAdminSubmissions.js` | Anggota 1 |
| **Katalog Kos & Geospasial** | `src/features/kos/` | `kosService.js` | `useKosList.js`, `useKosDetail.js` | Anggota 2 |
| **Pemilik Kos (CRUD)** | `src/features/owner/` | `ownerService.js` | `useOwnerKos.js` | Anggota 2 |
| **Detail Kos, Booking & Favorit** | `src/features/booking/` | `bookingService.js` | `useBookings.js`, `useOwnerBookings.js` | Anggota 3 |
| **Chat Real-time & Notifikasi** | `src/features/chat/` | `chatService.js` | `useChat.js` | Anggota 4 |
| **Ulasan & Rating Bintang** | `src/features/review/` | `kosService.js` | `useKosDetail.js` | Anggota 4 |

### Aturan Baku Pengembangan
1. **Dilarang melakukan panggilan `api.get()` / `api.post()` langsung di dalam file `page.jsx`**. Panggilan API wajib melalui `features/<domain>/services/<domain>Service.js`.
2. **State data dan lifecycle data fetching wajib diisolasi di Custom Hook**. Halaman `page.jsx` hanya memanggil hook dan mengekstraksi data serta handlers (`const { data, isLoading, error, handleSubmit } = use...()`).
3. **State visual lokal diperbolehkan langsung di komponen UI**, seperti toggle dropdown, modal buka/tutup sederhana, atau tab switching murni tanpa manipulasi data backend.

---

## Continuous Integration (CI) dan Continuous Deployment (CD)

### 1. Continuous Integration (CI Pipeline)
Repositori ini telah dilengkapi dengan pipeline otomatis GitHub Actions pada berkas `.github/workflows/ci.yml`.

- **Pemicu (Triggers):**
  - Setiap `push` ke branch `main`, `develop`, atau branch fitur `feature/**`.
  - Setiap pembukaan dan pembaruan `pull_request` menuju branch `main` atau `develop`.
- **Pemeriksaan yang Dijalankan (Automated Checks):**
  1. **Frontend Check:** Memasang dependensi dengan `npm ci`, memeriksa konfigurasi, dan menjalankan `npm run build` Next.js 16 (kompilasi Turbopack, typecheck, dan prerendering 21 halaman rute).
  2. **Backend Check:** Memasang dependensi backend dengan `npm ci` dan memvalidasi keabsahan sintaks seluruh modul Node.js ES Modules (`node --check`).
- **Tujuan CI:** Melindungi repositori dari kode yang merusak (*build breakers*) sebelum sebuah branch disetujui untuk di-merge.

### 2. Continuous Deployment (CD) dan Analisis Keamanan Produksi
Pertanyaan krusial dalam pengembangan web berskala tim: **"Apakah kita harus langsung mengaktifkan auto-deploy setiap kali ada push/merge?"**

> **Keputusan Arsitektur: Auto-deploy langsung ke lingkungan produksi (Production CD) TIDAK diaktifkan saat ini demi menjaga keamanan sistem.**

#### Alasan Teknis Mengapa Auto-Deploy ke Produksi Belum Aman Saat Ini:
1. **Fitur Frontend Masih Bertahap**: Sebanyak 21 rute frontend saat ini baru memiliki halaman placeholder interaktif yang sedang diimplementasikan secara paralel oleh 4 anggota. Auto-deploy ke domain produksi akan menampilkan halaman setengah jadi ke pengguna publik.
2. **Dinamika Skema & Basis Data**: Perubahan relasi data MongoDB atau seeder yang belum tervalidasi dapat merusak konsistensi data di database produksi.
3. **Kerahasiaan Kredensial Produksi**: Akses ke layanan produksi pihak ketiga (Cloudinary credentials, MongoDB Atlas cluster produksi, JWT production secret) harus dijaga ketat agar tidak terpapar selama masa pengujian.

#### Solusi Strategi CD yang Aman (Guarded Deployment)
Alur rilis pada `.github/workflows/cd.yml` dirancang dengan 2 mekanisme pengaman:
1. **Preview Deployment (Staging / PR Previews)**:
   Setiap Pull Request dapat memanfaatkan deployment preview sementara (misalnya via Vercel Preview) untuk pengujian fungsionalitas dan tampilan UI tanpa memengaruhi database atau domain produksi.
2. **Manual Approval Gate & Release Tagging**:
   Deployment ke server produksi hanya akan dieksekusi melalui:
   - Tombol **Run workflow** manual pada GitHub Actions (`workflow_dispatch`), dengan memilih target environment dan menyertakan catatan rilis; ATAU
   - Pembuatan Git Release Tag resmi (format `v*.*.*`, misalnya `v1.0.0`) setelah seluruh pengujian lulus dan disetujui bersama oleh seluruh anggota tim.

## Laporan Milestone 1

URL Google Drive laporan: https://drive.google.com/file/d/1BSTLPsp-7W-tnikiPJc8-RwNzqkbFWUf/view?usp=sharing
