"use client";

import { useState, useEffect, useCallback } from "react";
import { kosService } from "../services/kosService";
import { bookingService } from "@/features/booking/services/bookingService";
import { useAuth } from "@/context/AuthContext";

function extractReviewList(reviewRes) {
  if (Array.isArray(reviewRes?.data)) return reviewRes.data;
  if (Array.isArray(reviewRes?.data?.reviews)) return reviewRes.data.reviews;
  return [];
}

export function useKosDetail(kosId) {
  const { user, isAuthenticated } = useAuth();

  const [kos, setKos] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(kosId));
  const [error, setError] = useState(null);

  // State Favorit
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // State Pengajuan Booking
  const [activeKosBooking, setActiveKosBooking] = useState(null);
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const fetchDetailData = useCallback(async () => {
    if (!kosId) return;
    try {
      const [kosRes, reviewRes] = await Promise.all([
        kosService.getKosDetail(kosId),
        kosService.getReviews(kosId).catch(() => ({ data: [] })),
      ]);

      setKos(kosRes?.data || kosRes);
      setReviews(extractReviewList(reviewRes));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat detail kos.");
    } finally {
      setIsLoading(false);
    }
  }, [kosId]);

  useEffect(() => {
    let ignore = false;

    if (!kosId) {
      return;
    }

    const execute = async () => {
      try {
        const [kosRes, reviewRes] = await Promise.all([
          kosService.getKosDetail(kosId),
          kosService.getReviews(kosId).catch(() => ({ data: [] })),
        ]);

        if (!ignore) {
          setKos(kosRes?.data || kosRes);
          setReviews(extractReviewList(reviewRes));
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Gagal memuat detail kos.");
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
  }, [kosId]);

  useEffect(() => {
    let ignore = false;

    if (!isAuthenticated || user?.role !== "PENCARI_KOS" || !kosId) {
      return;
    }

    const checkSeekerStatus = async () => {
      try {
        const [favRes, bookingsRes] = await Promise.all([
          kosService.getFavorites().catch(() => ({ data: [] })),
          bookingService.getMyBookings().catch(() => ({ data: [] })),
        ]);
        const favList = Array.isArray(favRes?.data) ? favRes.data : [];
        const found = favList.find(
          (item) => String(item.kosId?._id || item.kosId) === String(kosId)
        );
        const myBookings = Array.isArray(bookingsRes?.data)
          ? bookingsRes.data
          : [];
        const activeBooking = myBookings.find(
          (item) =>
            String(item.kosId?._id || item.kosId) === String(kosId) &&
            (item.status === "PENDING" || item.status === "DISETUJUI")
        );

        if (!ignore) {
          if (found) {
            setIsFavorite(true);
            setFavoriteId(found._id);
          } else {
            setIsFavorite(false);
            setFavoriteId(null);
          }
          setActiveKosBooking(activeBooking || null);
        }
      } catch (err) {
        console.error("Gagal mengecek status favorit:", err);
      }
    };

    checkSeekerStatus();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, user, kosId]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchDetailData();
  }, [fetchDetailData]);

  // Toggle Favorit dengan Optimistic Update
  const handleToggleFavorite = async () => {
    if (!isAuthenticated || user?.role !== "PENCARI_KOS" || isTogglingFavorite) return;

    const prevStatus = isFavorite;
    const prevFavId = favoriteId;

    // Optimistic UI update
    setIsFavorite(!prevStatus);
    setIsTogglingFavorite(true);

    try {
      if (!prevStatus) {
        const res = await kosService.addFavorite(kosId);
        setFavoriteId(res?.data?._id || null);
      } else {
        await kosService.removeFavorite(prevFavId || kosId);
        setFavoriteId(null);
      }
    } catch (err) {
      // Rollback jika gagal
      setIsFavorite(prevStatus);
      setFavoriteId(prevFavId);
      alert(err.response?.data?.message || "Gagal memperbarui favorit.");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // Submit Booking dari Modal
  const handleCreateBooking = async (payload) => {
    setIsBookingSubmitting(true);
    setBookingError(null);
    try {
      const res = await bookingService.createBooking({
        kosId,
        ...payload,
      });
      if (res?.data) {
        setActiveKosBooking(res.data);
      }
      return { success: true, data: res?.data };
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal mengajukan booking.";
      setBookingError(msg);
      return { success: false, message: msg };
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  return {
    kos,
    reviews,
    isLoading,
    error,
    isFavorite,
    isTogglingFavorite,
    handleToggleFavorite,
    activeKosBooking,
    isBookingSubmitting,
    bookingError,
    setBookingError,
    handleCreateBooking,
    refetch,
  };
}

export default useKosDetail;
