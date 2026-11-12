# Feature Module: Pengajuan dan Riwayat Booking

Penanggung Jawab: Anggota 3

## Struktur Pemisahan Logic dan UI
- `services/bookingService.js`: Seluruh panggilan API ke `/api/bookings/*`.
- `hooks/useBookings.js`: Pengelolaan state riwayat booking pencari kos, pembatalan booking pending, dan pembuatan booking baru.
- Halaman UI pemanggil: `src/app/bookings/page.jsx` dan komponen modal booking di halaman detail kos `/kos/[id]`.
