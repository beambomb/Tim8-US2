# Feature Module: Chat Real-time & Notifikasi

Penanggung Jawab: Anggota 4

## Struktur Pemisahan Logic dan UI
- `services/chatService.js`: Pemanggilan HTTP REST untuk inbox, pesan, dan notifikasi.
- `hooks/useChat.js`: Pengelolaan pesan aktif, listener WebSocket event `receive_message`, fallback HTTP, dan pengiriman pesan.
- Halaman UI pemanggil:
  - `src/app/chat/page.jsx`
  - `src/app/chat/[userId]/page.jsx`
  - Komponen popover notifikasi di navbar.
