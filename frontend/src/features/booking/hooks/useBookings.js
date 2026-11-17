"use client";

import { useState, useEffect, useCallback } from "react";
import { bookingService } from "../services/bookingService";
import { useAuth } from "@/context/AuthContext";

export function useBookings() {
  const { isAuthenticated, user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookingsData = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "PENCARI_KOS") {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    try {
      const res = await bookingService.getMyBookings();
      setBookings(Array.isArray(res?.data) ? res.data : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat riwayat booking.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    let ignore = false;

    const execute = async () => {
      if (!isAuthenticated || user?.role !== "PENCARI_KOS") {
        if (!ignore) {
          setBookings([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await bookingService.getMyBookings();
        if (!ignore) {
          setBookings(Array.isArray(res?.data) ? res.data : []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Gagal memuat riwayat booking.");
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
  }, [isAuthenticated, user]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchBookingsData();
  }, [fetchBookingsData]);

  const handleCancelBooking = async (bookingId) => {
    setActionError(null);
    setCancellingId(bookingId);
    try {
      await bookingService.cancelBooking(bookingId);
      await fetchBookingsData();
      return { success: true };
    } catch (err) {
      setActionError(err.response?.data?.message || "Gagal membatalkan booking.");
      return { success: false };
    } finally {
      setCancellingId(null);
    }
  };

  return {
    bookings,
    isLoading,
    error,
    actionError,
    clearActionError: () => setActionError(null),
    cancellingId,
    handleCancelBooking,
    refetch,
  };
}

export default useBookings;
