import api from '@/lib/api';

export const reviewService = {
    async getReviews(kosId) {
        const response = await api.get(`/kos/${kosId}/reviews`);
        return response.data;
    },

    async submitReview(kosId, payload) {
        const response = await api.post(`/kos/${kosId}/reviews`, payload);
        return response.data;
    },
};