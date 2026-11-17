"use client";

import { useState, useEffect, useCallback } from "react";
import { bookingService } from "@/features/booking/services/bookingService";
import { useAuth } from "@/context/AuthContext";

export function useOwnerBookings() {
  const { isAuthenticated, user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchOwnerBookingsData = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "PEMILIK_KOS") {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    try {
      const res = await bookingService.getOwnerBookings();
      setBookings(Array.isArray(res?.data) ? res.data : []);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal memuat daftar booking masuk."
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    let ignore = false;

    const execute = async () => {
      if (!isAuthenticated || user?.role !== "PEMILIK_KOS") {
        if (!ignore) {
          setBookings([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await bookingService.getOwnerBookings();
        if (!ignore) {
          setBookings(Array.isArray(res?.data) ? res.data : []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message || "Gagal memuat daftar booking masuk."
          );
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
    await fetchOwnerBookingsData();
  }, [fetchOwnerBookingsData]);

  const handleApprove = async (bookingId) => {
    setActionError(null);
    setProcessingId(bookingId);
    try {
      const res = await bookingService.approveBooking(bookingId);
      const updated = res?.data;
      setBookings((prev) =>
        prev.map((item) =>
          item._id === bookingId
            ? (updated ? { ...item, ...updated, status: "DISETUJUI" } : { ...item, status: "DISETUJUI" })
            : item
        )
      );
      return { success: true };
    } catch (err) {
      setActionError(err.response?.data?.message || "Gagal menyetujui permohonan booking.");
      return { success: false };
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (bookingId) => {
    setActionError(null);
    setProcessingId(bookingId);
    try {
      const res = await bookingService.rejectBooking(bookingId);
      const updated = res?.data;
      setBookings((prev) =>
        prev.map((item) =>
          item._id === bookingId
            ? (updated ? { ...item, ...updated, status: "DITOLAK" } : { ...item, status: "DITOLAK" })
            : item
        )
      );
      return { success: true };
    } catch (err) {
      setActionError(err.response?.data?.message || "Gagal menolak permohonan booking.");
      return { success: false };
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateStatus = async (bookingId, status) => {
    if (status === "Approved" || status === "DISETUJUI") {
      return handleApprove(bookingId);
    }
    return handleReject(bookingId);
  };

  return {
    bookings,
    isLoading,
    error,
    actionError,
    clearActionError: () => setActionError(null),
    processingId,
    handleApprove,
    handleReject,
    handleUpdateStatus,
    refetch,
  };
}

export default useOwnerBookings;
