'use client';

import { useState } from 'react';
import { useReview } from '../hooks/useReview';

export default function ReviewSection({ kosId }) {
    const {
        reviews,
        isLoading,
        isSubmitting,
        error,
        canWriteReview,
        hasUserReviewed,
        submitReview,
    } = useReview(kosId);

    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [komentar, setKomentar] = useState('');
    const [feedbackMsg, setFeedbackMsg] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!komentar.trim()) return;

        const result = await submitReview({ rating, komentar });
        if (result.success) {
            setKomentar('');
            setRating(5);
            setFeedbackMsg({ type: 'success', text: 'Ulasan Anda berhasil dikirim!' });
        } else {
            setFeedbackMsg({ type: 'error', text: result.error });
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Ulasan & Penilaian Penghuni</h2>

            {/* Form Tulis Ulasan (Hanya untuk PENCARI_KOS yang belum pernah mengulas) */}
            {canWriteReview && (
                <form onSubmit={handleSubmit} className="mb-8 p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <h3 className="font-semibold text-gray-800 text-sm mb-3">Tulis Ulasan Anda</h3>

                    {/* Rating Bintang Interaktif */}
                    <div className="flex items-center gap-1 mb-4">
                        <span className="text-sm text-gray-600 mr-2">Rating:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="text-2xl transition focus:outline-none"
                            >
                                <span
                                    className={
                                        star <= (hoverRating || rating)
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                    }
                                >
                                    ★
                                </span>
                            </button>
                        ))}
                        <span className="text-xs text-gray-500 ml-2 font-medium">
                            ({rating} dari 5 bintang)
                        </span>
                    </div>

                    <textarea
                        value={komentar}
                        onChange={(e) => setKomentar(e.target.value)}
                        rows={3}
                        placeholder="Bagikan pengalaman Anda mengenai fasilitas, lingkungan, atau kenyamanan kos ini..."
                        className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 bg-white"
                        required
                    />

                    {feedbackMsg && (
                        <p
                            className={`text-xs mb-3 ${feedbackMsg.type === 'success' ? 'text-green-600' : 'text-red-600'
                                }`}
                        >
                            {feedbackMsg.text}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || !komentar.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
                    >
                        {isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
                    </button>
                </form>
            )}

            {hasUserReviewed && (
                <div className="mb-6 p-4 bg-blue-50 text-blue-700 text-xs rounded-lg">
                    Anda sudah memberikan ulasan untuk kos ini. Terima kasih atas masukan Anda!
                </div>
            )}

            {/* Daftar Testimoni Pengguna */}
            {isLoading ? (
                <div className="py-8 text-center text-gray-400 text-sm">
                    Memuat ulasan...
                </div>
            ) : error ? (
                <div className="py-4 text-center text-red-500 text-sm bg-red-50 rounded-lg">
                    {error}
                </div>
            ) : reviews.length === 0 ? (
                <p className="text-gray-400 text-sm py-4 text-center">
                    Belum ada ulasan untuk kos ini. Jadilah yang pertama memberikan ulasan!
                </p>
            ) : (
                <div className="space-y-4">
                    {reviews.map((rev, idx) => (
                        <div
                            key={rev._id || idx}
                            className="p-4 border border-gray-100 rounded-lg bg-white"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                        {(rev.user?.nama || rev.user?.name || 'Mahasiswa').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 leading-none">
                                            {rev.user?.nama || rev.user?.name || 'Mahasiswa CariKos'}
                                        </h4>
                                        <span className="text-[11px] text-gray-400">
                                            {rev.createdAt
                                                ? new Date(rev.createdAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })
                                                : 'Baru saja'}
                                        </span>
                                    </div>
                                </div>

                                {/* Tampilan Bintang */}
                                <div className="flex text-yellow-400 text-sm">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            className={
                                                star <= (rev.rating || 5) ? 'text-yellow-400' : 'text-gray-200'
                                            }
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <p className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap">
                                {rev.komentar || rev.comment}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}