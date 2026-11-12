'use client';

import { useState, useEffect, useCallback } from 'react';
import { kosService } from '../services/kosService';

export function useKosDetail(kosId) {
  const [kos, setKos] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = useCallback(async () => {
    if (!kosId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [kosRes, reviewsRes] = await Promise.all([
        kosService.getKosDetail(kosId),
        kosService.getReviews(kosId).catch(() => ({ data: [] })),
      ]);
      setKos(kosRes.data);
      setReviews(reviewsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat detail data kos.');
    } finally {
      setIsLoading(false);
    }
  }, [kosId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const submitReview = async ({ rating, review }) => {
    try {
      const result = await kosService.addReview(kosId, { rating, review });
      await fetchDetail();
      return { success: true, data: result.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Gagal mengirimkan ulasan.',
      };
    }
  };

  return {
    kos,
    reviews,
    isLoading,
    error,
    refetch: fetchDetail,
    submitReview,
  };
}
