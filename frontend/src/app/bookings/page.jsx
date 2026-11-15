"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RefreshButton from "@/components/ui/RefreshButton";
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

  const getStatusLabel = (status) => {
    switch (status) {
      case "DISETUJUI":
        return "Disetujui";
      case "DITOLAK":
        return "Ditolak";
      case "DIBATALKAN":
        return "Dibatalkan";
      default:
        return "Menunggu Konfirmasi";
    }
  };

  const getStatusBadge = (rawStatus) => {
    const status = normalizeStatus(rawStatus);
    switch (status) {
      case "DISETUJUI":
        return "bg-[#DCFAE5] text-[#04250E]";
      case "DITOLAK":
        return "bg-[#FFEDEA] text-[#831C1E]";
      case "DIBATALKAN":
        return "bg-[#EEF2F7] text-[#475569]";
      default:
        return "bg-[#FFFBEB] text-[#92400E]";
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
    <div className="min-h-dvh flex flex-col bg-[#F5F7FA] text-[#0F172A]">
      <Navbar />

      <main className="flex-1 pt-20 pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Riwayat Booking Saya
              </h1>
            </div>

            {isAuthenticated && (
              <RefreshButton
                onClick={refetch}
                isLoading={isLoading}
                label="Segarkan data booking"
                variant="public"
                className="self-start sm:self-auto"
              />
            )}
          </div>

          {/* Unauthorized / Not logged in */}
          {!authLoading && (!isAuthenticated || user?.role !== "PENCARI_KOS") ? (
            <div className="mx-auto max-w-2xl py-12 text-center">
              <div className="rounded-2xl bg-[#FFFFFF] p-8">
                <h2 className="text-xl font-bold text-[#0F172A]">
                  Akses Khusus Mahasiswa Pencari Kos
                </h2>
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
            <div className="space-y-4">
              <div className="h-11 w-full rounded-xl bg-[#E2E8F0]" />
              <div className="h-44 w-full rounded-2xl bg-[#FFFFFF]" />
              <div className="h-44 w-full rounded-2xl bg-[#FFFFFF]" />
            </div>
          ) : (
            <>
              {/* Tab Filter Status */}
              <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  const count = counts[tab.key] || 0;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        isActive
                          ? "bg-[#1D4ED8] text-white"
                          : "bg-[#FFFFFF] text-[#475569] hover:bg-[#EEF2F7] hover:text-[#0F172A]"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs tabular-nums ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-[#EEF2F7] text-[#475569]"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {error && (
                <div className="mb-6 rounded-xl bg-[#FFEDEA] p-4 text-sm text-[#831C1E]">
                  {error}
                </div>
              )}

              {/* Daftar Booking */}
              {filteredBookings.length === 0 ? (
                <div className="rounded-2xl bg-[#FFFFFF] p-12 text-center">
                  <p className="text-base font-semibold text-[#0F172A]">
                    Belum ada riwayat booking pada kategori ini.
                  </p>
                  <p className="mt-1 text-base text-[#475569]">
                    Mulai eksplorasi katalog kos untuk menemukan tempat tinggal
                    idaman.
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
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 rounded-2xl bg-[#FFFFFF] p-5 transition-colors"
                      >
                        {/* Foto & Info Utama */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                          {/* Thumbnail Foto Kos */}
                          <div className="relative h-28 w-full sm:w-36 shrink-0 overflow-hidden rounded-xl bg-[#EEF2F7]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={thumbnail}
                              alt={kos.nama || "Kos"}
                              className="h-full w-full object-cover"
                            />
                            {kos.tipe && (
                              <span className="absolute bottom-2 left-2 rounded-md bg-[#0F172A]/85 px-2 py-0.5 text-xs font-medium text-white">
                                Kos {kos.tipe}
                              </span>
                            )}
                          </div>

                          {/* Data Rincian */}
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${getStatusBadge(
                                  booking.status
                                )}`}
                              >
                                {getStatusLabel(normalizedStatus)}
                              </span>
                              <span className="text-[13px] text-[#475569] tabular-nums">
                                Diajukan pada {formatDate(booking.createdAt)}
                              </span>
                            </div>

                            {kos._id ? (
                              <Link
                                href={`/kos/${kos._id}`}
                                className="block text-base font-bold text-[#0F172A] hover:text-[#1D4ED8] transition-colors"
                              >
                                {kos.nama || "Properti Kos"}
                              </Link>
                            ) : (
                              <span className="block text-base font-bold text-[#0F172A]">
                                {kos.nama || "Properti Kos"}
                              </span>
                            )}

                            <p className="flex items-center gap-1.5 text-sm text-[#475569]">
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
                                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                />
                              </svg>
                              <span>{kos.lokasi || "-"}</span>
                            </p>

                            <div className="flex flex-wrap gap-x-5 gap-y-1 pt-1 text-[13px] text-[#475569]">
                              <span className="tabular-nums">
                                <strong className="text-[#0F172A]">
                                  Mulai Sewa:
                                </strong>{" "}
                                {formatDate(booking.tanggalMulai)}
                              </span>
                              <span className="tabular-nums">
                                <strong className="text-[#0F172A]">
                                  Durasi:
                                </strong>{" "}
                                {booking.durasiBulan} Bulan
                              </span>
                              <span>
                                <strong className="text-[#0F172A]">
                                  Total:
                                </strong>{" "}
                                <span className="font-bold text-[#0F172A] tabular-nums">
                                  {formatRupiah(
                                    booking.totalHarga || totalHarga
                                  )}
                                </span>
                              </span>
                            </div>

                            {booking.catatan && (
                              <p className="text-sm italic text-[#475569] bg-[#F5F7FA] rounded-lg px-3 py-2">
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
                              className="rounded-xl bg-[#FFEDEA] px-4 py-2 text-[13px] font-semibold text-[#831C1E] hover:bg-[#FEE2E2] disabled:opacity-50 transition-colors cursor-pointer"
                            >
                              {cancellingId === booking._id
                                ? "Membatalkan..."
                                : "Batalkan Pengajuan"}
                            </button>
                          )}

                          {kos._id && (
                            <Link
                              href={`/kos/${kos._id}`}
                              className="rounded-xl bg-[#EEF2F7] px-4 py-2 text-center text-[13px] font-semibold text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
                            >
                              Lihat Kos
                            </Link>
                          )}

                          {ownerId && (
                            <Link
                              href={`/chat/${ownerId}?kosId=${kos._id || ""}`}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#EFF6FF] px-4 py-2 text-center text-[13px] font-semibold text-[#1D4ED8] hover:bg-[#DBEAFE] transition-colors"
                            >
                              <svg
                                className="w-3.5 h-3.5 shrink-0"
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
