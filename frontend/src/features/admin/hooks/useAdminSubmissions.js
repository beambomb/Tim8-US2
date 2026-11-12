'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';

export function useAdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminService.getSubmissions();
      setSubmissions(result.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat antrean verifikasi kos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const approveKos = async (id) => {
    setActionLoadingId(id);
    try {
      await adminService.approveSubmission(id);
      await fetchSubmissions();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Gagal menyetujui pengajuan kos.',
      };
    } finally {
      setActionLoadingId(null);
    }
  };

  const rejectKos = async (id, reason) => {
    if (!reason?.trim()) {
      return { success: false, error: 'Alasan penolakan wajib diisi.' };
    }
    setActionLoadingId(id);
    try {
      await adminService.rejectSubmission(id, reason);
      await fetchSubmissions();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Gagal menolak pengajuan kos.',
      };
    } finally {
      setActionLoadingId(null);
    }
  };

  return {
    submissions,
    isLoading,
    error,
    actionLoadingId,
    refetch: fetchSubmissions,
    approveKos,
    rejectKos,
  };
}
