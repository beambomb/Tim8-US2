"use client";

import { useState, useEffect, useCallback } from "react";
import { bookingService } from "../services/bookingService";
import { useAuth } from "@/context/AuthContext";

export function useBookings() {
  const { isAuthenticated, user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookingsData = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "PENCARI_KOS") {
      setIsLoading(false);
      return;
    }

    try {
      const res = await bookingService.getMyBookings();
      setBookings(res?.data || []);
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
        setIsLoading(false);
        return;
      }

      try {
        const res = await bookingService.getMyBookings();
        if (!ignore) {
          setBookings(res?.data || []);
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
    if (
      !window.confirm(
        "Apakah Anda yakin ingin membatalkan pengajuan sewa kamar ini?"
      )
    ) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const res = await bookingService.cancelBooking(bookingId);
      const updated = res?.data;
      setBookings((prev) =>
        prev.map((item) =>
          item._id === bookingId
            ? updated
              ? { ...item, ...updated, status: "DIBATALKAN" }
              : { ...item, status: "DIBATALKAN" }
            : item
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Gagal membatalkan booking.");
    } finally {
      setCancellingId(null);
    }
  };

  return {
    bookings,
    isLoading,
    error,
    cancellingId,
    handleCancelBooking,
    refetch,
  };
}

export default useBookings;
