# Panduan Pengujian (Testing) CariKos

Arsitektur pengujian CariKos dibagi menjadi 3 lapisan sesuai struktur aplikasi (`backend/`, `frontend/`, dan `tests/e2e/` di root), menggunakan test runner bawaan Node.js (`node --test`).

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
│       │   └── kosService.test.js
│       └── integration/
│           ├── app.test.js
│           ├── authRoutes.test.js
│           ├── bookingOwnerRoutes.test.js
│           └── kosRoutes.test.js
├── frontend/
│   └── tests/
│       ├── helpers/
│       │   ├── loader.mjs
│       │   ├── mockWindow.mjs
│       │   └── register-alias.mjs
│       ├── unit/
│       │   ├── campusStorage.test.mjs
│       │   └── utils.test.mjs
│       └── integration/
│           └── apiAndKosService.test.mjs
└── tests/
    └── e2e/
        ├── helpers/e2eHarness.mjs
        ├── kos-booking-journey.e2e.test.mjs
        └── support-chat-realtime.e2e.test.mjs
```

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
npm test
```

### 3. End-to-End (Root Repo)
Pastikan dependensi di `backend/node_modules` dan `frontend/node_modules` sudah terpasang, lalu jalankan dari root:
```bash
node --test tests/e2e/*.e2e.test.mjs
```

## Catatan Mekanisme Isolasi
- **Unit & Integration Test Backend**: Berjalan terisolasi tanpa koneksi MongoDB eksternal dengan me-mock method model Mongoose menggunakan `t.mock.method` dari `node:test`, sementara Express routing, middleware JWT/RBAC, controller, service, dan HTTP handler tetap dieksekusi nyata melalui port ephemeral lokal (`127.0.0.1:0`).
- **Unit & Integration Test Frontend**: Menggunakan custom ESM loader (`frontend/tests/helpers/loader.mjs`) untuk menyelesaikan path alias `@/*` serta stub HTTP server untuk menguji interceptor Axios pada `src/lib/api.js` dan service `kosService`.
- **E2E Test**: Menjalankan server Express + Socket.IO penuh dengan in-memory state store multi-aktor (`PENCARI_KOS`, `PEMILIK_KOS`, `ADMIN`) untuk memverifikasi alur bisnis utuh dan komunikasi WebSocket real-time end-to-end.
