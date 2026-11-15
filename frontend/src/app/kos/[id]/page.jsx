"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useKosDetail } from "@/features/kos/hooks/useKosDetail";
import { useAuth } from "@/context/AuthContext";
import BookingModal from "@/features/booking/components/BookingModal";
import ReviewSection from "@/features/review/components/ReviewSection";

function KosDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const {
    kos,
    reviews,
    isLoading,
    error,
    isFavorite,
    isTogglingFavorite,
    handleToggleFavorite,
    isBookingSubmitting,
    bookingError,
    setBookingError,
    handleCreateBooking,
    refetch,
  } = useKosDetail(id);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState("");

  const photos =
    kos?.fotoUrls && kos.fotoUrls.length > 0
      ? kos.fotoUrls
      : ["https://placehold.co/800x500/e2e8f0/475569?text=Foto+Kos+Belum+Tersedia"];

  const handlePrevPhoto = useCallback(() => {
    setActivePhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const handleNextPhoto = useCallback(() => {
    setActivePhotoIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (event.key === "ArrowLeft" && photos.length > 1) {
        handlePrevPhoto();
      } else if (event.key === "ArrowRight" && photos.length > 1) {
        handleNextPhoto();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, photos.length, handlePrevPhoto, handleNextPhoto]);

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka || 0);

  if (isLoading) {
    return <KosDetailSkeleton />;
  }

  if (error || !kos) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <div className="rounded-2xl bg-[#FFFFFF] p-8 ring-1 ring-[#FECACA]">
          <h1 className="text-xl font-bold text-[#831C1E]">
            Properti Tidak Ditemukan
          </h1>
          <p className="mt-2 text-sm text-[#475569]">
            {error || "Data kos tidak tersedia atau belum diverifikasi."}
          </p>
          <Link
            href="/kos"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E40AF] transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            <span>Kembali ke Katalog Kos</span>
          </Link>
        </div>
      </div>
    );
  }

  const owner = typeof kos.ownerId === "object" ? kos.ownerId : null;
  const ownerId = owner?._id || kos.ownerId;
  const isAvailable = (kos.jumlahKamarTersedia ?? 0) > 0;
  const isSeeker = isAuthenticated && user?.role === "PENCARI_KOS";
  const canBook = isSeeker && isAvailable;

  // Hitung rata-rata rating dari reviewList yang sudah tervalidasi array
  const avgRating =
    Array.isArray(reviews) && reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Navigasi lokasi"
        className="mb-5 flex items-center gap-2 text-xs sm:text-sm text-[#475569]"
      >
        <Link href="/" className="hover:text-[#1D4ED8] transition-colors">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/kos" className="hover:text-[#1D4ED8] transition-colors">
          Katalog Kos
        </Link>
        <span aria-hidden="true">/</span>
        <span className="truncate font-semibold text-[#0F172A]">
          {kos.nama}
        </span>
      </nav>

      {/* Banner Sukses Booking */}
      {bookingSuccessMsg && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-[#DCFAE5] p-4 text-sm text-[#04250E] ring-1 ring-[#BBF7D0]">
          <span className="flex items-center gap-2.5 font-medium">
            <svg
              className="w-5 h-5 shrink-0 text-[#247B50]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{bookingSuccessMsg}</span>
          </span>
          <Link
            href="/bookings"
            className="inline-flex items-center gap-1.5 font-semibold text-[#04250E] underline hover:text-[#0F172A] shrink-0"
          >
            <span>Buka Riwayat Booking</span>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      )}

      {/* Galeri Foto Utama & Thumbnails */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          aria-label="Perbesar galeri foto kos"
          className="relative h-72 sm:h-80 md:h-96 w-full cursor-pointer overflow-hidden rounded-2xl bg-[#EEF2F7] md:col-span-3 group text-left ring-1 ring-[#E2E8F0]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[activePhotoIndex]}
            alt={kos.nama}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute bottom-3 right-3 rounded-lg bg-[#0F172A]/85 px-3 py-1.5 text-xs font-medium text-white flex items-center gap-2">
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
              />
            </svg>
            <span>Klik untuk perbesar</span>
            <span className="tabular-nums text-white/90">
              ({activePhotoIndex + 1}/{photos.length})
            </span>
          </span>
        </button>

        {/* Thumbnail list */}
        <div className="flex gap-3 overflow-x-auto md:flex-col md:overflow-y-auto md:max-h-96 pb-2 md:pb-0">
          {photos.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActivePhotoIndex(idx)}
              aria-label={`Pilih foto ${idx + 1}`}
              className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl transition-opacity md:w-full cursor-pointer ${
                activePhotoIndex === idx
                  ? "ring-2 ring-[#1D4ED8] opacity-100"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Foto ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* 2 Kolom Konten */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
        {/* Kolom Kiri: Spesifikasi & Rincian */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Title & Tombol Simpan Favorit */}
          <section className="rounded-2xl bg-[#FFFFFF] p-6 ring-1 ring-[#E2E8F0]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="rounded-full bg-[#EEF2F7] px-3 py-1 text-xs font-semibold text-[#0F172A]">
                    Kos {kos.tipe}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold tabular-nums ${
                      isAvailable
                        ? "bg-[#DCFAE5] text-[#04250E]"
                        : "bg-[#FFEDEA] text-[#831C1E]"
                    }`}
                  >
                    {isAvailable
                      ? `Sisa ${kos.jumlahKamarTersedia} dari ${kos.jumlahKamar} kamar`
                      : "Kamar Penuh"}
                  </span>
                  {avgRating && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFFBEB] px-3 py-1 text-xs font-semibold text-[#92400E] tabular-nums">
                      <svg
                        className="w-3.5 h-3.5 text-[#D97706]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        {avgRating} ({reviews.length} ulasan)
                      </span>
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl tracking-tight">
                  {kos.nama}
                </h1>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-[#475569]">
                  <svg
                    className="w-4 h-4 shrink-0 text-[#475569]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                  <span>{kos.lokasi}</span>
                </p>
              </div>

              {/* Tombol Favorit / Wishlist (Optimistic Update) */}
              {isSeeker && (
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  disabled={isTogglingFavorite}
                  aria-label={
                    isFavorite ? "Hapus dari daftar favorit" : "Simpan ke favorit"
                  }
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ring-1 ${
                    isFavorite
                      ? "bg-[#FFEDEA] text-[#831C1E] ring-[#FECACA]"
                      : "bg-[#FFFFFF] text-[#0F172A] ring-[#CBD5E1] hover:bg-[#F5F7FA]"
                  }`}
                >
                  {isFavorite ? (
                    <svg
                      className="w-4 h-4 text-[#E11D48]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-[#475569]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                      />
                    </svg>
                  )}
                  <span>
                    {isFavorite ? "Tersimpan di Favorit" : "Simpan Favorit"}
                  </span>
                </button>
              )}
            </div>
          </section>

          {/* Fasilitas Properti */}
          <section className="rounded-2xl bg-[#FFFFFF] p-6 ring-1 ring-[#E2E8F0]">
            <h2 className="text-lg font-bold text-[#0F172A] mb-4">
              Fasilitas Kamar & Bangunan
            </h2>
            {kos.fasilitas && kos.fasilitas.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {kos.fasilitas.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 rounded-xl bg-[#F5F7FA] px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#0F172A]"
                  >
                    <svg
                      className="w-4 h-4 shrink-0 text-[#1D4ED8]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#475569]">
                Belum ada data fasilitas yang ditambahkan.
              </p>
            )}
          </section>

          {/* Informasi Pemilik Kos */}
          <section className="rounded-2xl bg-[#FFFFFF] p-6 ring-1 ring-[#E2E8F0]">
            <h2 className="text-lg font-bold text-[#0F172A] mb-4">
              Informasi Pemilik Kos
            </h2>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#F5F7FA] p-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF] text-lg font-bold text-[#1D4ED8] ring-1 ring-[#BFDBFE]">
                  {(owner?.nama || "P")[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A]">
                    {owner?.nama || "Pemilik Kos"}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#475569] tabular-nums">
                    {owner?.noHp ? (
                      <>
                        <svg
                          className="w-3.5 h-3.5 shrink-0 text-[#475569]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                          />
                        </svg>
                        <span>{owner.noHp}</span>
                      </>
                    ) : (
                      <span>Mitra Terverifikasi CariKos</span>
                    )}
                  </p>
                </div>
              </div>

              {ownerId && isSeeker && (
                <Link
                  href={`/chat/${ownerId}?kosId=${kos._id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#EFF6FF] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#1D4ED8] ring-1 ring-[#BFDBFE] hover:bg-[#DBEAFE] transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                  <span>Chat Pemilik</span>
                </Link>
              )}

              {ownerId && !isAuthenticated && (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FFFFFF] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#0F172A] ring-1 ring-[#CBD5E1] hover:bg-[#EEF2F7] transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-[#475569]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                  <span>Login untuk Chat Pemilik</span>
                </Link>
              )}
            </div>
          </section>

          {/* Peta Lokasi & Koordinat */}
          <section className="rounded-2xl bg-[#FFFFFF] p-6 ring-1 ring-[#E2E8F0]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#0F172A]">
                Lokasi & Titik Peta
              </h2>
              {kos.latitude && kos.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${kos.latitude},${kos.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#1D4ED8] hover:text-[#1E40AF] hover:underline"
                >
                  <span>Buka Google Maps</span>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                    />
                  </svg>
                </a>
              )}
            </div>
            <div className="overflow-hidden rounded-xl bg-[#EEF2F7]">
              {kos.latitude && kos.longitude ? (
                <>
                  <iframe
                    title="Peta Lokasi Kos"
                    width="100%"
                    height="260"
                    loading="lazy"
                    src={`https://maps.google.com/maps?q=${kos.latitude},${kos.longitude}&z=15&output=embed`}
                    className="border-0 w-full block"
                  />
                  <div className="px-4 py-3 text-xs text-[#475569] flex flex-col sm:flex-row sm:justify-between gap-1 bg-[#EEF2F7]">
                    <span>Alamat: {kos.lokasi}</span>
                    <span className="tabular-nums font-medium text-[#0F172A]">
                      Koordinat: {kos.latitude}, {kos.longitude}
                    </span>
                  </div>
                </>
              ) : (
                <p className="p-4 text-sm text-[#475569]">{kos.lokasi}</p>
              )}
            </div>
          </section>

          {/* Ulasan & Rating Penghuni */}
          <ReviewSection kosId={kos._id || id} />
        </div>

        {/* Kolom Kanan: Sticky Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl bg-[#FFFFFF] p-6 ring-1 ring-[#E2E8F0]">
            <span className="text-xs font-semibold text-[#475569]">
              Biaya Sewa
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tabular-nums">
                {formatRupiah(kos.harga)}
              </span>
              <span className="text-sm text-[#475569]">/ bulan</span>
            </div>

            <div className="mt-5 rounded-xl bg-[#F5F7FA] p-4 text-xs sm:text-sm space-y-2.5">
              <div className="flex justify-between">
                <span className="text-[#475569]">Sisa Kamar Kos</span>
                <span
                  className={`font-semibold tabular-nums ${
                    isAvailable ? "text-[#247B50]" : "text-[#C4242A]"
                  }`}
                >
                  {kos.jumlahKamarTersedia} unit
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475569]">Tipe Hunian</span>
                <span className="font-semibold text-[#0F172A]">
                  Kos {kos.tipe}
                </span>
              </div>
            </div>

            {/* Tombol Ajukan Sewa / Booking */}
            <div className="mt-6">
              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => router.push("/auth/login")}
                  className="w-full rounded-xl bg-[#1D4ED8] py-3 text-sm font-semibold text-white hover:bg-[#1E40AF] transition-colors cursor-pointer"
                >
                  Login untuk Mengajukan Sewa
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canBook}
                  onClick={() => {
                    setBookingError(null);
                    setIsBookingModalOpen(true);
                  }}
                  className="w-full rounded-xl bg-[#1D4ED8] py-3 text-sm font-semibold text-white hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:bg-[#E2E8F0] disabled:text-[#475569] transition-colors cursor-pointer"
                >
                  {!isAvailable
                    ? "Kamar Penuh"
                    : user?.role !== "PENCARI_KOS"
                    ? "Khusus Akun Pencari Kos"
                    : "Ajukan Sewa / Booking"}
                </button>
              )}
            </div>

            <p className="mt-3 text-center text-xs text-[#475569]">
              Pengajuan sewa akan langsung diteruskan ke pemilik kos untuk
              disetujui.
            </p>
          </div>
        </div>
      </div>

      {/* Lightbox Modal untuk Preview Foto */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau foto properti kos"
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/90 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full"
          >
            <div className="flex items-center justify-between pb-3 text-white">
              <span className="text-xs font-medium tabular-nums">
                Foto {activePhotoIndex + 1} dari {photos.length}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                aria-label="Tutup pratinjau foto"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25 transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Tutup (Esc)</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <button
                type="button"
                onClick={handlePrevPhoto}
                disabled={photos.length <= 1}
                aria-label="Foto sebelumnya"
                className="absolute left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#0F172A]/80 text-white hover:bg-[#0F172A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[activePhotoIndex]}
                alt={`${kos.nama} - Foto ${activePhotoIndex + 1}`}
                className="max-h-[80vh] w-full rounded-xl object-contain bg-black/40"
              />

              <button
                type="button"
                onClick={handleNextPhoto}
                disabled={photos.length <= 1}
                aria-label="Foto berikutnya"
                className="absolute right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#0F172A]/80 text-white hover:bg-[#0F172A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pengajuan Booking */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        kos={kos}
        onSubmit={handleCreateBooking}
        isSubmitting={isBookingSubmitting}
        error={bookingError}
        onSuccess={() => {
          setBookingSuccessMsg(
            "Pengajuan booking kamar berhasil dikirim dan menunggu konfirmasi pemilik kos!"
          );
          refetch();
        }}
      />
    </div>
  );
}

function KosDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="h-5 w-48 rounded-lg bg-[#E2E8F0]" />
      <div className="h-80 w-full rounded-2xl bg-[#E2E8F0]" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-28 w-full rounded-2xl bg-[#FFFFFF] ring-1 ring-[#E2E8F0]" />
          <div className="h-36 w-full rounded-2xl bg-[#FFFFFF] ring-1 ring-[#E2E8F0]" />
        </div>
        <div className="h-64 rounded-2xl bg-[#FFFFFF] ring-1 ring-[#E2E8F0]" />
      </div>
    </div>
  );
}

export default function KosDetailPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-[#F5F7FA] text-[#0F172A]">
      <Suspense fallback={<div className="h-16 bg-[#FFFFFF]" />}>
        <Navbar />
      </Suspense>
      <main className="flex-1 pt-20 pb-12">
        <Suspense fallback={<KosDetailSkeleton />}>
          <KosDetailContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
