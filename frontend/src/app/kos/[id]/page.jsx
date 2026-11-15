"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useKosDetail } from "@/features/kos/hooks/useKosDetail";
import { useAuth } from "@/context/AuthContext";
import BookingModal from "@/features/booking/components/BookingModal";

export default function KosDetailPage() {
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

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
            <div className="h-80 w-full rounded-2xl bg-slate-200" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 w-2/3 rounded-lg bg-slate-200" />
                <div className="h-4 w-1/2 rounded-lg bg-slate-200" />
                <div className="h-32 w-full rounded-xl bg-slate-200" />
              </div>
              <div className="h-64 rounded-2xl bg-slate-200" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !kos) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
              <h2 className="text-xl font-bold text-red-800">
                Properti Tidak Ditemukan
              </h2>
              <p className="mt-2 text-sm text-red-600">
                {error || "Data kos tidak tersedia atau belum diverifikasi."}
              </p>
              <Link
                href="/kos"
                className="mt-5 inline-block rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                ← Kembali ke Katalog Kos
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const photos =
    kos.fotoUrls && kos.fotoUrls.length > 0
      ? kos.fotoUrls
      : ["https://placehold.co/800x500/e2e8f0/475569?text=Foto+Kos+Belum+Tersedia"];

  const owner = typeof kos.ownerId === "object" ? kos.ownerId : null;
  const ownerId = owner?._id || kos.ownerId;
  const isAvailable = (kos.jumlahKamarTersedia ?? 0) > 0;
  const canBook =
    isAuthenticated && user?.role === "PENCARI_KOS" && isAvailable;

  // Hitung rata-rata rating
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Breadcrumb Navigation */}
          <nav className="mb-4 flex items-center gap-2 text-xs sm:text-sm text-slate-500">
            <Link href="/" className="hover:text-[#1D4ED8] transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/kos" className="hover:text-[#1D4ED8] transition-colors">
              Katalog Kos
            </Link>
            <span>/</span>
            <span className="truncate font-semibold text-slate-800">
              {kos.nama}
            </span>
          </nav>

          {/* Banner Sukses Booking */}
          {bookingSuccessMsg && (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-xs">
              <span className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{bookingSuccessMsg}</span>
              </span>
              <Link
                href="/bookings"
                className="font-semibold underline hover:text-emerald-950 shrink-0"
              >
                Buka Riwayat Booking →
              </Link>
            </div>
          )}

          {/* Galeri Foto Utama & Thumbnails */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="relative h-72 sm:h-80 md:h-96 cursor-pointer overflow-hidden rounded-2xl bg-slate-100 md:col-span-3 group border border-slate-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[activePhotoIndex]}
                alt={kos.nama}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-xs flex items-center gap-1.5">
                <span>🔍 Klik untuk perbesar</span>
                <span className="font-mono">
                  ({activePhotoIndex + 1}/{photos.length})
                </span>
              </span>
            </div>

            {/* Thumbnail list */}
            <div className="flex gap-3 overflow-x-auto md:flex-col md:overflow-y-auto md:max-h-96 pb-2 md:pb-0">
              {photos.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all md:w-full ${
                    activePhotoIndex === idx
                      ? "border-[#1D4ED8] ring-2 ring-[#1D4ED8]/30"
                      : "border-transparent opacity-70 hover:opacity-100"
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Kolom Kiri: Spesifikasi & Rincian */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Title & Tombol Simpan Favorit */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800">
                      Kos {kos.tipe}
                    </span>
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                        isAvailable
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {isAvailable
                        ? `Sisa ${kos.jumlahKamarTersedia} dari ${kos.jumlahKamar} kamar`
                        : "Kamar Penuh"}
                    </span>
                    {avgRating && (
                      <span className="rounded-full bg-amber-50 px-3 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                        ★ {avgRating} ({reviews.length} ulasan)
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    {kos.nama}
                  </h1>
                  <p className="mt-1.5 text-sm text-slate-600">📍 {kos.lokasi}</p>
                </div>

                {/* Tombol Favorit / Wishlist (Optimistic Update) */}
                {isAuthenticated && user?.role === "PENCARI_KOS" && (
                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    disabled={isTogglingFavorite}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                      isFavorite
                        ? "border-rose-200 bg-rose-50 text-rose-600"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{isFavorite ? "❤️" : "🤍"}</span>
                    <span>{isFavorite ? "Tersimpan di Favorit" : "Simpan Favorit"}</span>
                  </button>
                )}
              </div>

              {/* Fasilitas Properti */}
              <div className="border-b border-slate-200 pb-6">
                <h2 className="text-lg font-bold text-slate-900 mb-3">
                  Fasilitas Kamar & Bangunan
                </h2>
                {kos.fasilitas && kos.fasilitas.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {kos.fasilitas.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 shadow-2xs"
                      >
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Belum ada data fasilitas yang ditambahkan.
                  </p>
                )}
              </div>

              {/* Informasi Pemilik Kos */}
              <div className="border-b border-slate-200 pb-6">
                <h2 className="text-lg font-bold text-slate-900 mb-3">
                  Informasi Pemilik Kos
                </h2>
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                      {(owner?.nama || "P")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {owner?.nama || "Pemilik Kos"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {owner?.noHp ? `📞 ${owner.noHp}` : "Mitra Terverifikasi"}
                      </p>
                    </div>
                  </div>

                  {ownerId && (
                    <Link
                      href={`/chat/${ownerId}?kosId=${kos._id}`}
                      className="rounded-xl border border-[#1D4ED8] bg-[#EFF6FF] px-4 py-2 text-xs sm:text-sm font-semibold text-[#1D4ED8] hover:bg-[#DBEAFE] transition-colors"
                    >
                      💬 Chat Pemilik
                    </Link>
                  )}
                </div>
              </div>

              {/* Peta Lokasi & Koordinat */}
              <div className="border-b border-slate-200 pb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-slate-900">
                    Lokasi & Titik Peta
                  </h2>
                  {kos.latitude && kos.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${kos.latitude},${kos.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm font-semibold text-[#1D4ED8] hover:underline"
                    >
                      Buka Google Maps ↗
                    </a>
                  )}
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                  {kos.latitude && kos.longitude ? (
                    <>
                      <iframe
                        title="Peta Lokasi Kos"
                        width="100%"
                        height="260"
                        loading="lazy"
                        src={`https://maps.google.com/maps?q=${kos.latitude},${kos.longitude}&z=15&output=embed`}
                        className="border-0 w-full"
                      />
                      <div className="px-4 py-2.5 text-xs text-slate-500 flex flex-col sm:flex-row sm:justify-between gap-1 border-t border-slate-100 bg-slate-50">
                        <span>Alamat: {kos.lokasi}</span>
                        <span className="font-mono">
                          Koordinat: {kos.latitude}, {kos.longitude}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="p-4 text-sm text-slate-500">{kos.lokasi}</p>
                  )}
                </div>
              </div>

              {/* Ulasan & Rating Penghuni */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">
                  Ulasan Penghuni ({reviews.length})
                </h2>
                {reviews.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                    Belum ada ulasan untuk properti ini.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((rev) => (
                      <div
                        key={rev._id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-slate-900">
                            {rev.userId?.nama || "Mahasiswa"}
                          </span>
                          <span className="text-xs font-bold text-amber-500 tracking-wider">
                            {"★".repeat(rev.rating || 5)}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm text-slate-600">
                          {rev.komentar}
                        </p>
                        {rev.createdAt && (
                          <span className="mt-2 block text-[11px] text-slate-400">
                            {formatDate(rev.createdAt)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Kolom Kanan: Sticky Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Biaya Sewa
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-mono">
                    {formatRupiah(kos.harga)}
                  </span>
                  <span className="text-sm text-slate-500">/ bulan</span>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-3.5 text-xs sm:text-sm space-y-2 border border-slate-200/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sisa Kamar Kos</span>
                    <span
                      className={`font-semibold ${
                        isAvailable ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      {kos.jumlahKamarTersedia} unit
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tipe Hunian</span>
                    <span className="font-semibold text-slate-800">
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
                      className="w-full rounded-xl bg-[#0F172A] py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
                      className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 transition-colors cursor-pointer"
                    >
                      {!isAvailable
                        ? "Kamar Penuh"
                        : user?.role !== "PENCARI_KOS"
                        ? "Khusus Akun Pencari Kos"
                        : "Ajukan Sewa / Booking"}
                    </button>
                  )}
                </div>

                <p className="mt-3 text-center text-xs text-slate-400">
                  Pengajuan sewa akan langsung diteruskan ke pemilik kos untuk
                  disetujui.
                </p>
              </div>
            </div>
          </div>

          {/* Lightbox Modal untuk Preview Foto */}
          {isLightboxOpen && (
            <div
              onClick={() => setIsLightboxOpen(false)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-4xl w-full"
              >
                <div className="flex items-center justify-between pb-3 text-white">
                  <span className="text-xs font-mono">
                    Foto {activePhotoIndex + 1} dari {photos.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(false)}
                    className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    ✕ Tutup (Esc)
                  </button>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photos[activePhotoIndex]}
                  alt={kos.nama}
                  className="max-h-[80vh] w-full rounded-xl object-contain bg-black/40"
                />
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
      </main>

      <Footer />
    </div>
  );
}
