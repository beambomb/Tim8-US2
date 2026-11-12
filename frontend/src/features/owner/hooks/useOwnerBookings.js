'use client';

import { useState, useEffect, useCallback } from 'react';
import { ownerService } from '../services/ownerService';

export function useOwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await ownerService.getOwnerBookings();
      setBookings(result.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat permohonan booking masuk.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateStatus = async (bookingId, status) => {
    setActionLoadingId(bookingId);
    try {
      await ownerService.updateBookingStatus(bookingId, status);
      await fetchBookings();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || `Gagal mengubah status booking menjadi ${status}.`,
      };
    } finally {
      setActionLoadingId(null);
    }
  };

  return {
    bookings,
    isLoading,
    error,
    actionLoadingId,
    refetch: fetchBookings,
    approveBooking: (id) => updateStatus(id, 'approved'),
    rejectBooking: (id) => updateStatus(id, 'rejected'),
  };
}
