# Feature Module: Autentikasi dan Akun

Penanggung Jawab: Anggota 1

## Struktur Pemisahan Logic dan UI
- `services/authService.js`: Pemanggilan HTTP murni ke endpoint `/api/auth/*`.
- `hooks/useAuthForm.js`: Pengelolaan state formulir, validasi input, status loading, pesan error, integrasi `AuthContext`, dan routing redirect.
- Halaman UI pemanggil: `src/app/auth/login/page.jsx` dan `src/app/auth/register/page.jsx`.

## Cara Menggunakan di Komponen UI
```jsx
'use client';
import { useAuthForm } from '@/features/auth/hooks/useAuthForm';

export default function LoginPage() {
  const { formData, isLoading, error, handleChange, handleSubmit } = useAuthForm('login');

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="text-red-600">{error}</div>}
      <input name="email" value={formData.email} onChange={handleChange} required />
      <input type="password" name="password" value={formData.password} onChange={handleChange} required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Memproses...' : 'Masuk'}
      </button>
    </form>
  );
}
```
