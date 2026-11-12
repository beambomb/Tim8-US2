'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '../services/authService';

export function useAuthForm(mode = 'login') {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    nomorTelepon: '',
    role: 'pencari',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'login') {
        const data = await authService.login({
          email: formData.email,
          password: formData.password,
        });

        login(data.token, data.user);

        // Redirect based on role
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (data.user.role === 'pemilik') {
          router.push('/owner/dashboard');
        } else {
          router.push('/kos');
        }
      } else {
        const data = await authService.register(formData);
        setSuccessMessage('Registrasi berhasil! Silakan masuk dengan akun baru Anda.');
        setTimeout(() => {
          router.push('/auth/login');
        }, 1500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Terjadi kesalahan pada sistem autentikasi.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    error,
    successMessage,
    handleChange,
    handleSubmit,
  };
}
