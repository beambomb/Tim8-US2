"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useBookings } from "@/features/booking/hooks/useBookings";
import { useAuth } from "@/context/AuthContext";

const TABS = [
  { key: "Semua", label: "Semua" },
  { key: "PENDING", label: "Menunggu Konfirmasi" },
  { key: "DISETUJUI", label: "Disetujui" },
  { key: "DITOLAK", label: "Ditolak" },
  { key: "DIBATALKAN", label: "Dibatalkan" },
];

export default function MyBookingsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { bookings, isLoading, error, cancellingId, handleCancelBooking, refetch } =
    useBookings();
  const [activeTab, setActiveTab] = useState("Semua");

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
      month: "long",
      year: "numeric",
    });
  };

  const normalizeStatus = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "APPROVED" || s === "DISETUJUI") return "DISETUJUI";
    if (s === "REJECTED" || s === "DITOLAK") return "DITOLAK";
    if (s === "CANCELLED" || s === "DIBATALKAN") return "DIBATALKAN";
    return s || "PENDING";
  };

  const getStatusBadge = (rawStatus) => {
    const status = normalizeStatus(rawStatus);
    switch (status) {
      case "DISETUJUI":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "DITOLAK":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "DIBATALKAN":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const filteredBookings = useMemo(() => {
    if (activeTab === "Semua") return bookings;
    return bookings.filter((b) => normalizeStatus(b.status) === activeTab);
  }, [bookings, activeTab]);

  const counts = useMemo(() => {
    const pending = bookings.filter(
      (b) => normalizeStatus(b.status) === "PENDING"
    ).length;
    const disetujui = bookings.filter(
      (b) => normalizeStatus(b.status) === "DISETUJUI"
    ).length;
    const ditolak = bookings.filter(
      (b) => normalizeStatus(b.status) === "DITOLAK"
    ).length;
    const dibatalkan = bookings.filter(
      (b) => normalizeStatus(b.status) === "DIBATALKAN"
    ).length;
    return {
      Semua: bookings.length,
      PENDING: pending,
      DISETUJUI: disetujui,
      DITOLAK: ditolak,
      DIBATALKAN: dibatalkan,
    };
  }, [bookings]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Riwayat Booking Saya
              </h1>
              <p className="mt-1 text-sm text-[#475569]">
                Pantau status pengajuan sewa kamar kos Anda secara real-time.
              </p>
            </div>

            {isAuthenticated && (
              <button
                type="button"
                onClick={refetch}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#1D4ED8] bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE] transition-colors"
              >
                Segarkan Data
              </button>
            )}
          </div>

          {/* Unauthorized / Not logged in */}
          {!authLoading && (!isAuthenticated || user?.role !== "PENCARI_KOS") ? (
            <div className="mx-auto max-w-2xl py-12 text-center">
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900">
                  Akses Khusus Mahasiswa Pencari Kos
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Silakan login menggunakan akun <strong>Pencari Kos</strong> untuk
                  melihat riwayat dan status pengajuan sewa Anda.
                </p>
                <Link
                  href="/auth/login"
                  className="mt-5 inline-block rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E40AF] transition-colors"
                >
                  Login Sekarang
                </Link>
              </div>
            </div>
          ) : authLoading || isLoading ? (
            /* Skeleton Loading */
            <div className="space-y-4 animate-pulse">
              <div className="h-10 w-full rounded-xl bg-slate-200" />
              <div className="h-44 w-full rounded-2xl bg-slate-200" />
              <div className="h-44 w-full rounded-2xl bg-slate-200" />
            </div>
          ) : (
            <>
              {/* Tab Filter Status */}
              <div className="mb-6 flex gap-2 overflow-x-auto border-b border-slate-200 pb-2">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  const count = counts[tab.key] || 0;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                        isActive
                          ? "bg-[#1D4ED8] text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono tabular-nums ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Daftar Booking */}
              {filteredBookings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                  <p className="text-base font-semibold text-slate-700">
                    Belum ada riwayat booking pada kategori ini.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Mulai eksplorasi katalog kos untuk menemukan tempat tinggal idaman.
                  </p>
                  <Link
                    href="/kos"
                    className="mt-5 inline-block rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E40AF] transition-colors"
                  >
                    Jelajahi Katalog Kos
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => {
                    const kos = booking.kosId || {};
                    const normalizedStatus = normalizeStatus(booking.status);
                    const totalHarga =
                      (kos.harga || 0) * (booking.durasiBulan || 1);
                    const thumbnail =
                      kos.fotoUrls?.[0] ||
                      "https://placehold.co/600x400/e2e8f0/475569?text=Foto+Kos";
                    const isPending = normalizedStatus === "PENDING";
                    const ownerId =
                      typeof kos.ownerId === "object"
                        ? kos.ownerId?._id
                        : kos.ownerId;

                    return (
                      <div
                        key={booking._id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-[#1D4ED8]/30 transition-all"
                      >
                        {/* Foto & Info Utama */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                          {/* Thumbnail Foto Kos */}
                          <div className="relative h-28 w-full sm:w-36 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={thumbnail}
                              alt={kos.nama || "Kos"}
                              className="h-full w-full object-cover"
                            />
                            {kos.tipe && (
                              <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                                Kos {kos.tipe}
                              </span>
                            )}
                          </div>

                          {/* Data Rincian */}
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${getStatusBadge(
                                  booking.status
                                )}`}
                              >
                                {normalizedStatus}
                              </span>
                              <span className="text-xs text-slate-400">
                                Diajukan pada {formatDate(booking.createdAt)}
                              </span>
                            </div>

                            {kos._id ? (
                              <Link
                                href={`/kos/${kos._id}`}
                                className="block text-base font-bold text-slate-900 hover:text-[#1D4ED8] transition-colors"
                              >
                                {kos.nama || "Properti Kos"}
                              </Link>
                            ) : (
                              <span className="block text-base font-bold text-slate-900">
                                {kos.nama || "Properti Kos"}
                              </span>
                            )}

                            <p className="text-xs text-slate-500">
                              📍 {kos.lokasi || "-"}
                            </p>

                            <div className="flex flex-wrap gap-x-5 gap-y-1 pt-1 text-xs text-slate-700">
                              <span>
                                <strong>Mulai Sewa:</strong>{" "}
                                {formatDate(booking.tanggalMulai)}
                              </span>
                              <span>
                                <strong>Durasi:</strong> {booking.durasiBulan}{" "}
                                Bulan
                              </span>
                              <span>
                                <strong>Total:</strong>{" "}
                                <span className="font-bold text-emerald-700 font-mono">
                                  {formatRupiah(
                                    booking.totalHarga || totalHarga
                                  )}
                                </span>
                              </span>
                            </div>

                            {booking.catatan && (
                              <p className="text-xs italic text-slate-500 bg-slate-50 rounded-lg p-2 border border-slate-100">
                                Catatan Anda: &quot;{booking.catatan}&quot;
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Tombol Aksi Kanan */}
                        <div className="flex flex-wrap sm:flex-col items-stretch gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
                          {isPending && (
                            <button
                              type="button"
                              disabled={cancellingId === booking._id}
                              onClick={() => handleCancelBooking(booking._id)}
                              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition-colors"
                            >
                              {cancellingId === booking._id
                                ? "Membatalkan..."
                                : "Batalkan Pengajuan"}
                            </button>
                          )}

                          {kos._id && (
                            <Link
                              href={`/kos/${kos._id}`}
                              className="rounded-xl border border-slate-300 px-4 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              Lihat Kos
                            </Link>
                          )}

                          {ownerId && (
                            <Link
                              href={`/chat/${ownerId}?kosId=${kos._id || ""}`}
                              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-center text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                            >
                              💬 Chat Pemilik
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
