"use client";

import { useState, useEffect, useCallback } from "react";
import { bookingService } from "@/features/booking/services/bookingService";
import { useAuth } from "@/context/AuthContext";

export function useOwnerBookings() {
  const { isAuthenticated, user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchOwnerBookingsData = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "PEMILIK_KOS") {
      setIsLoading(false);
      return;
    }

    try {
      const res = await bookingService.getOwnerBookings();
      setBookings(res?.data || []);
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
        setIsLoading(false);
        return;
      }

      try {
        const res = await bookingService.getOwnerBookings();
        if (!ignore) {
          setBookings(res?.data || []);
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
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menyetujui permohonan sewa ini? Stok kamar kosong kos akan berkurang 1."
      )
    ) {
      return;
    }

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
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyetujui permohonan booking.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (bookingId) => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menolak permohonan sewa ini?"
      )
    ) {
      return;
    }

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
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menolak permohonan booking.");
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
    processingId,
    handleApprove,
    handleReject,
    handleUpdateStatus,
    refetch,
  };
}

export default useOwnerBookings;
