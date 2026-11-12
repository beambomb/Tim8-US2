'use client';

import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../services/bookingService';

export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await bookingService.getMyBookings();
      setBookings(result.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat riwayat booking.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const cancelBooking = async (id) => {
    setCancellingId(id);
    try {
      await bookingService.cancelBooking(id);
      await fetchBookings();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Gagal membatalkan permohonan booking.',
      };
    } finally {
      setCancellingId(null);
    }
  };

  const createBooking = async (payload) => {
    try {
      const result = await bookingService.createBooking(payload);
      return { success: true, data: result.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Gagal mengajukan booking kamar.',
      };
    }
  };

  return {
    bookings,
    isLoading,
    error,
    cancellingId,
    refetch: fetchBookings,
    cancelBooking,
    createBooking,
  };
}
