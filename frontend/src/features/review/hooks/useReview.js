'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { reviewService } from '../services/reviewService';

const extractReviewerId = (rev) => {
  const raw = rev?.userId ?? rev?.user;
  if (!raw) return null;
  if (typeof raw === 'string') return raw;
  return raw._id || raw.id || null;
};

const parseReviewResponse = (res) => {
  const payload = res?.data ?? res;
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.reviews)
    ? payload.reviews
    : [];

  const total =
    typeof payload?.total === 'number' ? payload.total : list.length;

  let averageRating = 0;
  if (typeof payload?.averageRating === 'number') {
    averageRating = payload.averageRating;
  } else if (payload?.averageRating !== undefined && payload?.averageRating !== null) {
    averageRating = Number(payload.averageRating) || 0;
  } else if (list.length > 0) {
    const sum = list.reduce((acc, item) => acc + (Number(item.rating) || 0), 0);
    averageRating = Number((sum / list.length).toFixed(1));
  }

  return { list, averageRating, total };
};

export function useReview(kosId) {
  const { user, isAuthenticated } = useAuth();
  const currentUserId = user?._id || user?.id;

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(kosId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    if (!kosId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await reviewService.getReviews(kosId);
      const parsed = parseReviewResponse(res);
      setReviews(parsed.list);
      setAverageRating(parsed.averageRating);
      setTotalReviews(parsed.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat ulasan.');
    } finally {
      setIsLoading(false);
    }
  }, [kosId]);

  useEffect(() => {
    let ignore = false;

    async function execute() {
      if (!kosId) {
        await Promise.resolve();
        if (!ignore) {
          setReviews([]);
          setAverageRating(0);
          setTotalReviews(0);
          setIsLoading(false);
        }
        return;
      }

      await Promise.resolve();
      if (ignore) return;
      setIsLoading(true);
      setError(null);

      try {
        const res = await reviewService.getReviews(kosId);
        const parsed = parseReviewResponse(res);
        if (!ignore) {
          setReviews(parsed.list);
          setAverageRating(parsed.averageRating);
          setTotalReviews(parsed.total);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || 'Gagal memuat ulasan.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    execute();

    return () => {
      ignore = true;
    };
  }, [kosId]);

  const hasUserReviewed = useMemo(() => {
    if (!currentUserId) return false;
    return reviews.some((rev) => {
      const reviewerId = extractReviewerId(rev);
      return reviewerId && String(reviewerId) === String(currentUserId);
    });
  }, [currentUserId, reviews]);

  const canWriteReview =
    Boolean(isAuthenticated) && user?.role === 'PENCARI_KOS' && !hasUserReviewed;

  const submitReview = useCallback(
    async ({ rating, komentar }) => {
      const trimmedComment = komentar?.trim();
      if (!trimmedComment) {
        return { success: false, error: 'Komentar ulasan wajib diisi.' };
      }

      try {
        setIsSubmitting(true);
        setError(null);
        await reviewService.submitReview(kosId, {
          rating: Number(rating),
          komentar: trimmedComment,
        });
        await fetchReviews();
        return { success: true };
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Gagal mengirim ulasan.';
        setError(errMsg);
        return { success: false, error: errMsg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [kosId, fetchReviews]
  );

  return {
    reviews,
    averageRating,
    totalReviews,
    isLoading,
    isSubmitting,
    error,
    canWriteReview,
    hasUserReviewed,
    submitReview,
    refetchReviews: fetchReviews,
  };
}
