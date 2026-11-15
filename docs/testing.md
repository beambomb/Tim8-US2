# Panduan Pengujian (Testing) CariKos

Arsitektur pengujian CariKos dibagi menjadi 3 lapisan sesuai struktur aplikasi (`backend/`, `frontend/`, dan `tests/e2e/` di root).

- **Backend & E2E**: Menggunakan test runner bawaan Node.js (`node --test`).
- **Frontend**: Menggunakan `node --test` (utilitas & interceptor HTTP `.test.mjs`) dan **Vitest + React Testing Library + jsdom** (service, hooks, & komponen UI React `.test.jsx`).

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
│           ├── kosRoutes.test.js
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
│       │   ├── featureServices.test.jsx
│       │   ├── kosComponents.test.jsx
│       │   ├── landingComponents.test.jsx
│       │   ├── navbar.test.jsx
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
```

### 3. End-to-End (Root Repo)
Pastikan dependensi di `backend/node_modules` dan `frontend/node_modules` sudah terpasang, lalu jalankan dari root:
```bash
node --test tests/e2e/*.e2e.test.mjs
```

## Catatan Mekanisme Isolasi
- **Unit & Integration Test Backend**: Mem-mock method model Mongoose menggunakan `t.mock.method` dari `node:test`, sementara Express routing, middleware JWT/RBAC, controller, service, dan HTTP handler tetap dieksekusi nyata melalui port ephemeral lokal (`127.0.0.1:0`).
- **Unit & Integration Test Frontend**: File `.test.mjs` memakai custom ESM loader (`frontend/tests/helpers/loader.mjs`) + stub HTTP server; file `.test.jsx` memakai Vitest + jsdom + React Testing Library (`frontend/vitest.config.mjs`) dengan `next/link` & `next/navigation` terisolasi.
- **E2E Test**: Menjalankan server Express + Socket.IO penuh dengan in-memory state store multi-aktor (`PENCARI_KOS`, `PEMILIK_KOS`, `ADMIN`) untuk memverifikasi alur bisnis utuh dan komunikasi WebSocket real-time end-to-end.
