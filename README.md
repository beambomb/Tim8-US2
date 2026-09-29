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

## Struktur Folder dan File

```text
Tim8-US2/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── db.js
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── bookingController.js
│   │   │   ├── chatController.js
│   │   │   ├── favoriteController.js
│   │   │   ├── kosController.js
│   │   │   ├── notificationController.js
│   │   │   ├── ownerController.js
│   │   │   └── reviewController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── uploadMiddleware.js
│   │   ├── models/
│   │   │   ├── Booking.js
│   │   │   ├── Favorite.js
│   │   │   ├── Kos.js
│   │   │   ├── Message.js
│   │   │   ├── Notification.js
│   │   │   ├── Review.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   ├── favoriteRoutes.js
│   │   │   ├── kosRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   └── ownerRoutes.js
│   │   ├── services/
│   │   │   ├── adminService.js
│   │   │   ├── bookingService.js
│   │   │   ├── chatService.js
│   │   │   ├── favoriteService.js
│   │   │   ├── kosService.js
│   │   │   ├── notificationService.js
│   │   │   ├── ownerService.js
│   │   │   ├── reviewService.js
│   │   │   └── uploadService.js
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

## Teknologi yang Digunakan

- **Runtime & Framework:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Autentikasi & Keamanan:** JSON Web Token (JWT), bcrypt, Helmet, CORS
- **Real-time:** Socket.IO
- **Upload Gambar:** Multer, Cloudinary
- **Tools Pengembangan:** Git, GitHub, Visual Studio Code, Postman

## Laporan Milestone 1

URL Google Drive laporan: MASUKKAN LINK GOOGLE DRIVE DI SINI
