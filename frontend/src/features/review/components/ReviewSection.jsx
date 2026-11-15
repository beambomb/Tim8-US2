'use client';

import { useState } from 'react';
import { useReview } from '../hooks/useReview';

function StarIcon({ filled, className = 'w-4 h-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill={filled ? '#D97706' : '#CBD5E1'}
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export default function ReviewSection({ kosId }) {
  const {
    reviews,
    averageRating,
    totalReviews,
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

    setFeedbackMsg(null);
    const result = await submitReview({ rating, komentar });
    if (result.success) {
      setKomentar('');
      setRating(5);
      setFeedbackMsg({ type: 'success', text: 'Ulasan Anda berhasil dikirim.' });
    } else {
      setFeedbackMsg({ type: 'error', text: result.error });
    }
  };

  const formattedAverage = totalReviews > 0 ? Number(averageRating).toFixed(1) : '0.0';
  const roundedAverage = Math.round(Number(averageRating) || 0);

  return (
    <section
      aria-labelledby="review-section-title"
      className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-8 mt-8"
    >
      {/* Header Rata-rata Rating & Total Ulasan */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 id="review-section-title" className="text-xl font-bold text-[#0F172A]">
            Ulasan &amp; Penilaian Penghuni
          </h2>
          <p className="text-sm text-[#475569] mt-1">
            Pengalaman langsung dari mahasiswa pencari kos.
          </p>
        </div>

        <div className="bg-[#F5F7FA] rounded-xl px-4 py-3 flex items-center gap-3 self-start sm:self-auto">
          <span className="text-2xl font-bold text-[#0F172A] tabular-nums leading-none">
            {formattedAverage}
          </span>
          <div>
            <div
              className="flex items-center gap-0.5"
              role="img"
              aria-label={`Rata-rata rating ${formattedAverage} dari 5 bintang`}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} filled={star <= roundedAverage} className="w-4 h-4" />
              ))}
            </div>
            <p className="text-xs font-medium text-[#475569] mt-1 tabular-nums">
              {totalReviews} ulasan
            </p>
          </div>
        </div>
      </div>

      {/* Form Tulis Ulasan (Hanya untuk PENCARI_KOS yang belum pernah mengulas) */}
      {canWriteReview && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 bg-[#F5F7FA] rounded-xl">
          <h3 className="font-semibold text-[#0F172A] text-sm mb-3">
            Tulis Ulasan Anda
          </h3>

          {/* Rating Bintang Interaktif */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            <span className="text-sm text-[#475569] mr-2">Rating:</span>
            <div className="flex items-center gap-1" role="group" aria-label="Pilih rating bintang">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Beri rating ${star} dari 5 bintang`}
                  aria-pressed={rating === star}
                  className="p-1 rounded-md transition-transform hover:scale-110 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2"
                >
                  <StarIcon
                    filled={star <= (hoverRating || rating)}
                    className="w-6 h-6"
                  />
                </button>
              ))}
            </div>
            <span className="text-xs text-[#475569] ml-2 font-medium tabular-nums">
              {rating} dari 5 bintang
            </span>
          </div>

          <label htmlFor="review-komentar-input" className="sr-only">
            Komentar ulasan kos
          </label>
          <textarea
            id="review-komentar-input"
            value={komentar}
            onChange={(e) => setKomentar(e.target.value)}
            rows={3}
            placeholder="Bagikan pengalaman Anda mengenai fasilitas, kebersihan, atau kenyamanan kos ini..."
            className="w-full p-3 border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A] placeholder:text-[#475569] focus:outline-none focus:border-[#1D4ED8] mb-3 bg-[#FFFFFF]" // taste-skill-ignore: form field border
            required
          />

          {feedbackMsg && (
            <p
              className={`text-xs font-medium mb-3 ${
                feedbackMsg.type === 'success' ? 'text-[#047857]' : 'text-[#DC2626]'
              }`}
            >
              {feedbackMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !komentar.trim()}
            className="bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-[#CBD5E1] disabled:text-[#475569] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
          </button>
        </form>
      )}

      {hasUserReviewed && (
        <div className="mb-6 px-4 py-3 bg-[#EFF6FF] text-[#1E40AF] text-xs font-medium rounded-xl">
          Anda sudah memberikan ulasan untuk kos ini. Terima kasih atas masukan Anda.
        </div>
      )}

      {/* Daftar Ulasan Pengguna */}
      {isLoading ? (
        <div className="space-y-4" aria-label="Memuat ulasan">
          {[1, 2].map((item) => (
            <div key={item} className="p-5 bg-[#F5F7FA] rounded-xl space-y-2.5">
              <div className="h-4 w-36 bg-[#E2E8F0] rounded" />
              <div className="h-3.5 w-full bg-[#E2E8F0] rounded" />
              <div className="h-3.5 w-2/3 bg-[#E2E8F0] rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 text-center text-[#B91C1C] text-sm bg-[#FEF2F2] rounded-xl">
          {error}
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-6 bg-[#F5F7FA] rounded-xl text-center">
          <p className="text-sm font-medium text-[#0F172A]">Belum ada ulasan</p>
          <p className="text-xs text-[#475569] mt-1">
            Jadilah penghuni pertama yang membagikan penilaian untuk kos ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev, idx) => {
            const reviewerName =
              rev.userId?.nama || rev.user?.nama || rev.user?.name || 'Mahasiswa';
            const ratingValue = Number(rev.rating) || 5;

            return (
              <article
                key={rev._id || idx}
                className="p-5 rounded-xl bg-[#F5F7FA]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full bg-[#EEF2F7] text-[#1D4ED8] flex items-center justify-center font-bold text-xs shrink-0"
                      aria-hidden="true"
                    >
                      {reviewerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-[#0F172A] truncate">
                        {reviewerName}
                      </h3>
                      <span className="text-xs text-[#475569] tabular-nums block">
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
                  <div
                    className="flex items-center gap-0.5 shrink-0"
                    role="img"
                    aria-label={`Rating ${ratingValue} dari 5 bintang`}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        filled={star <= ratingValue}
                        className="w-4 h-4"
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-[#0F172A] mt-3 leading-relaxed whitespace-pre-wrap">
                  {rev.komentar || rev.comment}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
