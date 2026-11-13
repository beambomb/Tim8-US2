'use client';

import { useState, useEffect, useCallback } from 'react';
import { ownerService } from '../services/ownerService';

export function useOwnerKos() {
  const [kosList, setKosList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    let ignore = false;

    const execute = async () => {
      try {
        const result = await ownerService.getOwnerKos();
        if (!ignore) {
          setKosList(result.data || []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || 'Gagal memuat daftar kos milik Anda.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    execute();

    return () => {
      ignore = true;
    };
  }, []);

  const refetch = useCallback(async () => {
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

  const handleDelete = async (id) => {
    setActionLoadingId(id);
    try {
      const res = await ownerService.deleteKos(id);
      setKosList((prev) => prev.filter((item) => item._id !== id));
      return { success: true, message: res.message || 'Kos berhasil dihapus.' };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Gagal menghapus properti kos.',
      };
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSubmitVerification = async (id) => {
    setActionLoadingId(id);
    try {
      const res = await ownerService.submitVerification(id);
      // Update local state statusVerifikasi to 'Pending'
      setKosList((prev) =>
        prev.map((item) =>
          item._id === id
            ? { ...item, statusVerifikasi: 'Pending', alasanPenolakan: null }
            : item
        )
      );
      return { success: true, message: res.message || 'Pengajuan verifikasi berhasil dikirim.' };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Gagal mengajukan verifikasi kos.',
      };
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateAvailability = async (id, jumlahKamarTersedia) => {
    const numericVal = Math.max(0, Number(jumlahKamarTersedia));
    setActionLoadingId(id);
    try {
      const res = await ownerService.updateAvailability(id, numericVal);
      // Update local state
      setKosList((prev) =>
        prev.map((item) =>
          item._id === id
            ? { ...item, jumlahKamarTersedia: numericVal }
            : item
        )
      );
      return { success: true, data: res.data, message: 'Ketersediaan kamar berhasil diperbarui.' };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Gagal memperbarui ketersediaan kamar.',
      };
    } finally {
      setActionLoadingId(null);
    }
  };

  return {
    kosList,
    isLoading,
    error,
    actionLoadingId,
    refetch,
    handleDelete,
    handleSubmitVerification,
    handleUpdateAvailability,
  };
}
