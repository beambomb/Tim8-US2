# Panduan Pengujian (Testing) CariKos

Arsitektur pengujian CariKos dibagi menjadi 3 lapisan sesuai struktur aplikasi (`backend/`, `frontend/`, dan `tests/e2e/` di root), ditambah live smoke check untuk memverifikasi konektivitas layanan eksternal sebelum/sesudah deploy.

- **Backend & E2E**: Menggunakan test runner bawaan Node.js (`node --test`).
- **Frontend**: Menggunakan `node --test` (utilitas & interceptor HTTP `.test.mjs`) dan **Vitest + React Testing Library + jsdom** (service, context, hooks, & komponen UI React `.test.jsx`).
- **Live Smoke Check (`backend/`)**: Menjalankan ping read-only terhadap MongoDB dan Cloudinary memakai environment variables aktif.

## Struktur Direktori

```text
carikos/
├── backend/
│   └── tests/
│       ├── helpers/httpHelper.js
│       ├── unit/
│       │   ├── authMiddleware.test.js
│       │   ├── bookingReviewService.test.js
│       │   ├── campusService.test.js
│       │   ├── envConfig.test.js
│       │   └── kosService.test.js
│       └── integration/
│           ├── adminFavoriteNotificationRoutes.test.js
│           ├── app.test.js
│           ├── authRoutes.test.js
│           ├── bookingOwnerRoutes.test.js
│           ├── kosRoutes.test.js
│           ├── ownerMutationsAndUpload.test.js
│           └── updatedFeatures.test.js
├── frontend/
│   ├── vitest.config.mjs
│   └── tests/
│       ├── helpers/
│       │   ├── loader.mjs
│       │   ├── mockWindow.mjs
│       │   ├── register-alias.mjs
│       │   └── setupVitest.mjs
│       ├── unit/
│       │   ├── authHooks.test.jsx
│       │   ├── campusStorage.test.mjs
│       │   ├── chatAndNotifications.test.jsx
│       │   ├── featureServices.test.jsx
│       │   ├── kosComponents.test.jsx
│       │   ├── kosHooksAndPicker.test.jsx
│       │   ├── landingComponents.test.jsx
│       │   ├── navbar.test.jsx
│       │   ├── ownerAndAdminFlows.test.jsx
│       │   └── utils.test.mjs
│       └── integration/
│           ├── apiAndKosService.test.mjs
│           ├── authForm.test.jsx
│           └── bookingAndReview.test.jsx
└── tests/
    └── e2e/
        ├── helpers/e2eHarness.mjs
        ├── kos-booking-journey.e2e.test.mjs
        └── support-chat-realtime.e2e.test.mjs
```

## Cakupan Pengujian Per Lapisan

1. **Backend Unit Tests (`backend/tests/unit/`)**
   - `authMiddleware.test.js`: validasi token Bearer, penolakan token tidak valid (`401`), dan RBAC `authorizeRoles` (`403`).
   - `bookingReviewService.test.js`: aturan booking (validasi ID, stok kamar, duplikasi pending, kepemilikan `403`, pembatalan) dan review (rentang rating 1-5, rata-rata rating).
   - `campusService.test.js`: preset kampus, perluasan alias, normalisasi Nominatim, caching, dan fallback offline.
   - `kosService.test.js`: kalkulasi jarak Haversine, validasi ID/koordinat, filter pencarian, dan urutan kos terdekat.
   - `envConfig.test.js`: validasi `JWT_SECRET` di mode `production`, normalisasi `CORS_ORIGIN`, dan validasi `MONGO_URI` saat startup.

2. **Backend HTTP Integration Tests (`backend/tests/integration/`)**
   - `app.test.js`: healthcheck `/` & `/api/health`, header keamanan Helmet, allowlist `CORS_ORIGIN` (`403` untuk origin luar daftar), handler `404`, dan handler JSON invalid `400`.
   - `authRoutes.test.js`: sanitasi role registrasi (`ADMIN` dipaksa menjadi `PENCARI_KOS`), duplikasi email, login JWT, dan `/api/auth/me`.
   - `kosRoutes.test.js`: katalog publik approved, `/api/kos/nearby`, `/api/kos/campuses`, detail kos, dan `POST /api/kos/:id/reviews`.
   - `bookingOwnerRoutes.test.js`: pembuatan booking + notifikasi, perubahan status oleh `PEMILIK_KOS`, dan proteksi RBAC `GET /api/owner/kos`.
   - `ownerMutationsAndUpload.test.js`: CRUD kos milik owner (`POST/PUT/DELETE`), update ketersediaan kamar, submit verifikasi, `uploadMiddleware` Multer (penolakan file non-gambar), dan streaming upload ke Cloudinary (termasuk attach & delete URL foto).
   - `adminFavoriteNotificationRoutes.test.js`: endpoint admin (`/api/admin/stats`, approve/reject kos, update role user), `/api/favorites`, dan `/api/notifications` (`read` & `read-all`).
   - `updatedFeatures.test.js`: kampus tersimpan (`/api/auth/campuses`, batas 12 item) serta `/api/chat/support` dan `/api/chat/:userId`.

3. **Frontend Unit & Integration Tests (`frontend/tests/`)**
   - **Core & Interceptor (`.test.mjs`)**: formatter `utils`, `campusStorage` + pencarian kampus langsung, interceptor Bearer token & redirect `401` pada `api.js`.
   - **Hooks, Context & Services (`.test.jsx`)**: `AuthContext`, `useAuthForm`, `SocketContext`, `useChat` (WebSocket + fallback REST), `useNotifications`, `useFavorites`, `useOwnerKos`, `useOwnerKosForm`, `useAdminSubmissions`, `useAdminUsers`, dan seluruh feature services (`auth`, `kos`, `booking`, `owner`, `admin`, `chat`, `review`).
   - **Komponen UI (`.test.jsx`)**: `Navbar`, `NavbarNotifications`, `FaqSection`, `SupportButton`, `AuthForm`, `BookingModal`, `ReviewSection`, `KosCardReal`, `KosFilterSidebar`, `CampusPickerPanel`, `OwnerMetricsGrid`, `OwnerKosTable`, dan `AdminShell`.

4. **End-to-End Tests (`tests/e2e/`)**
   - `kos-booking-journey.e2e.test.mjs`: alur penuh multi-role dari pengajuan kos oleh owner -> persetujuan admin -> kemunculan di katalog publik -> booking pencari kos -> pengurangan stok kamar saat approved -> pemberian ulasan.
   - `support-chat-realtime.e2e.test.mjs`: resolusi kontak admin support dan pengiriman pesan real-time via Socket.IO end-to-end.

## Cara Menjalankan Test

### 1. Backend (`backend/`)
```bash
cd backend
npm run test:unit
npm run test:integration
npm test
```

### 2. Frontend (`frontend/`)
```bash
cd frontend
npm run test:unit
npm run test:integration
npm run test:components
npm test
npm run lint
npm run build
```

### 3. End-to-End (Root Repo)
Pastikan dependensi di `backend/node_modules` dan `frontend/node_modules` sudah terpasang, lalu jalankan dari root:
```bash
node --test tests/e2e/*.e2e.test.mjs
```

### 4. Live Smoke Check (`backend/`, Opsional Sebelum/Sesudah Deploy)
Pastikan `MONGO_URI` dan kredensial `CLOUDINARY_*` sudah terpasang di environment (atau `backend/.env`), lalu jalankan:
```bash
cd backend
npm run smoke
```
Perintah ini hanya menjalankan `ping` read-only ke MongoDB dan Cloudinary tanpa menulis atau mengubah data.

## Catatan Mekanisme Isolasi & Batasan
- **Unit & Integration Test Backend**: Mem-mock method model Mongoose serta `cloudinary.uploader.upload_stream` menggunakan `t.mock.method` dari `node:test`, sementara Express routing, middleware JWT/RBAC, Multer multipart parsing, controller, service, dan HTTP handler tetap dieksekusi nyata melalui port ephemeral lokal (`127.0.0.1:0`).
- **Unit & Integration Test Frontend**: File `.test.mjs` memakai custom ESM loader (`frontend/tests/helpers/loader.mjs`) + stub HTTP server; file `.test.jsx` memakai Vitest + jsdom + React Testing Library (`frontend/vitest.config.mjs`) dengan `next/link` & `next/navigation` terisolasi.
- **E2E Test**: Menjalankan server Express + Socket.IO penuh dengan in-memory state store multi-aktor (`PENCARI_KOS`, `PEMILIK_KOS`, `ADMIN`) untuk memverifikasi alur bisnis utuh dan komunikasi WebSocket real-time end-to-end.
- **Cakupan yang sengaja tidak dijalankan di CI**: Test browser headless penuh (misalnya Playwright terhadap Next.js server + MongoDB live) dan mutasi database/Cloudinary production tidak dijalankan di CI agar pipeline tetap cepat, deterministik, dan aman terhadap data live.
