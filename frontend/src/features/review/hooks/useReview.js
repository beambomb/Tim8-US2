'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { reviewService } from '../services/reviewService';

export function useReview(kosId) {
    const { user, isAuthenticated } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const fetchReviews = useCallback(async () => {
        if (!kosId) return;
        try {
            setIsLoading(true);
            setError(null);
            const res = await reviewService.getReviews(kosId);
            const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
            setReviews(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memuat ulasan.');
        } finally {
            setIsLoading(false);
        }
    }, [kosId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const hasUserReviewed = Boolean(
        user &&
        reviews.some(
            (rev) =>
                rev.user?._id === user._id ||
                rev.user === user._id ||
                rev.userId === user._id
        )
    );

    const canWriteReview =
        isAuthenticated && user?.role === 'PENCARI_KOS' && !hasUserReviewed;

    const submitReview = async ({ rating, komentar }) => {
        try {
            setIsSubmitting(true);
            setError(null);
            await reviewService.submitReview(kosId, {
                rating,
                komentar,
                comment: komentar,
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
    };

    return {
        reviews,
        isLoading,
        isSubmitting,
        error,
        canWriteReview,
        hasUserReviewed,
        submitReview,
        refetchReviews: fetchReviews,
    };
}