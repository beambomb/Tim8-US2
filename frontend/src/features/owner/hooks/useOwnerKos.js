'use client';

import { useState, useEffect, useCallback } from 'react';
import { ownerService } from '../services/ownerService';

export function useOwnerKos() {
  const [kosList, setKosList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOwnerKos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await ownerService.getOwnerKos();
      setKosList(result.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat daftar kos milik Anda.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOwnerKos();
  }, [fetchOwnerKos]);

  const handleDelete = async (id) => {
    try {
      await ownerService.deleteKos(id);
      setKosList((prev) => prev.filter((item) => item._id !== id));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Gagal menghapus properti kos.',
      };
    }
  };

  const handleSubmitVerification = async (id) => {
    try {
      const res = await ownerService.submitVerification(id);
      await fetchOwnerKos();
      return { success: true, message: res.message };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Gagal mengajukan verifikasi.',
      };
    }
  };

  return {
    kosList,
    isLoading,
    error,
    refetch: fetchOwnerKos,
    handleDelete,
    handleSubmitVerification,
  };
}
