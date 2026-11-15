"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useOwnerBookings } from "@/features/owner/hooks/useOwnerBookings";
import { useAuth } from "@/context/AuthContext";

const STATUS_TABS = [
  { key: "ALL", label: "Semua" },
  { key: "PENDING", label: "Menunggu Konfirmasi" },
  { key: "DISETUJUI", label: "Disetujui" },
  { key: "DITOLAK", label: "Ditolak" },
  { key: "DIBATALKAN", label: "Dibatalkan" },
];

export default function OwnerBookingsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const {
    bookings,
    isLoading,
    error,
    processingId,
    handleApprove,
    handleReject,
    refetch,
  } = useOwnerBookings();

  const [activeTab, setActiveTab] = useState("ALL");

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

  const filteredBookings = useMemo(() => {
    if (activeTab === "ALL") return bookings;
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
      ALL: bookings.length,
      PENDING: pending,
      DISETUJUI: disetujui,
      DITOLAK: ditolak,
      DIBATALKAN: dibatalkan,
    };
  }, [bookings]);

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-72 rounded-lg bg-slate-800" />
        <div className="h-12 w-full rounded-xl bg-slate-800/60" />
        <div className="h-44 w-full rounded-xl bg-[#141D30] border border-slate-800" />
        <div className="h-44 w-full rounded-xl bg-[#141D30] border border-slate-800" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "PEMILIK_KOS") {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="rounded-2xl border border-slate-800 bg-[#141D30] p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#F1F5F9]">
            Akses Khusus Pemilik Kos
          </h2>
          <p className="mt-2 text-sm text-[#94A3B8]">
            Halaman ini hanya dapat diakses oleh akun dengan peran{" "}
            <strong className="text-emerald-400">Pemilik Kos</strong>.
          </p>
          <Link
            href="/auth/login"
            className="mt-5 inline-block rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-[#0A0F1D] hover:bg-emerald-400 transition-colors"
          >
            Login Pemilik Kos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F5F9]">
            Manajemen Permohonan Booking Masuk
          </h1>
          <p className="mt-1 text-xs text-[#94A3B8]">
            Setujui atau tolak permohonan sewa kamar dari mahasiswa. Persetujuan
            akan otomatis mengurangi kuota kamar tersedia secara atomik.
          </p>
        </div>

        <button
          type="button"
          onClick={refetch}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#141D30] border border-slate-700/80 transition-colors"
        >
          Segarkan Antrean
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Tabs Filter Status */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-800/80">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = counts[tab.key] || 0;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold"
                  : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#141D30]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono tabular-nums ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Booking List */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-[#141D30]/40 p-12 text-center">
          <p className="text-sm font-medium text-[#94A3B8]">
            Tidak ada permohonan booking pada kategori ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const tenant = booking.userId || {};
            const kos = booking.kosId || {};
            const status = normalizeStatus(booking.status);
            const totalHarga = (kos.harga || 0) * (booking.durasiBulan || 1);
            const isProcessing = processingId === booking._id;

            return (
              <div
                key={booking._id}
                className="flex flex-col justify-between gap-5 rounded-xl border border-slate-800 bg-[#141D30] p-5 shadow-sm lg:flex-row lg:items-center"
              >
                <div className="space-y-3">
                  {/* Status Badge & Kos Title */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider uppercase ${
                        status === "DISETUJUI"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : status === "DITOLAK"
                          ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                          : status === "DIBATALKAN"
                          ? "bg-slate-800 text-slate-400 border-slate-700"
                          : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {status}
                    </span>

                    {kos._id ? (
                      <Link
                        href={`/kos/${kos._id}`}
                        className="text-sm font-semibold text-[#F1F5F9] hover:text-emerald-400 transition-colors"
                      >
                        {kos.nama || "Properti Kos"}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-[#F1F5F9]">
                        {kos.nama || "Properti Kos"}
                      </span>
                    )}

                    <span className="text-xs text-[#64748B]">
                      • Diajukan {formatDate(booking.createdAt)}
                    </span>
                  </div>

                  {/* Profil Mahasiswa Pemesan */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#0A0F1D] border border-slate-800/80 p-3 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-[#F1F5F9]">
                        {tenant.nama || "Mahasiswa Pemesan"}
                      </p>
                      <p className="text-[#94A3B8]">
                        Email: {tenant.email || "-"} • No. HP:{" "}
                        <span className="text-slate-300 font-mono">
                          {tenant.noHp || "-"}
                        </span>
                      </p>
                    </div>

                    {tenant._id && (
                      <Link
                        href={`/chat/${tenant._id}?kosId=${kos._id || ""}`}
                        className="px-3 py-1.5 rounded-md text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 transition-colors"
                      >
                        💬 Chat Mahasiswa
                      </Link>
                    )}
                  </div>

                  {/* Rincian Sewa */}
                  <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-[#94A3B8]">
                    <span>
                      Mulai Sewa:{" "}
                      <strong className="text-[#F1F5F9]">
                        {formatDate(booking.tanggalMulai)}
                      </strong>
                    </span>
                    <span>
                      Durasi:{" "}
                      <strong className="text-[#F1F5F9]">
                        {booking.durasiBulan || 1} Bulan
                      </strong>
                    </span>
                    <span>
                      Estimasi Total:{" "}
                      <strong className="text-emerald-400 font-mono tabular-nums">
                        {formatRupiah(booking.totalHarga || totalHarga)}
                      </strong>
                    </span>
                  </div>

                  {booking.catatan && (
                    <p className="text-xs italic text-[#94A3B8] bg-[#0A0F1D]/50 rounded p-2 border border-slate-800/50">
                      Catatan pemesan: &quot;{booking.catatan}&quot;
                    </p>
                  )}
                </div>

                {/* Tombol Aksi Persetujuan / Penolakan */}
                <div className="flex shrink-0 flex-wrap items-center gap-2 pt-2 lg:pt-0">
                  {status === "PENDING" ? (
                    <>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleApprove(booking._id)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-[#0A0F1D] hover:bg-emerald-400 disabled:opacity-50 transition-colors shadow-xs"
                      >
                        {isProcessing ? "Memproses..." : "✓ Setujui (Approve)"}
                      </button>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleReject(booking._id)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 border border-rose-500/30 disabled:opacity-50 transition-colors"
                      >
                        ✕ Tolak (Reject)
                      </button>
                    </>
                  ) : status === "DISETUJUI" ? (
                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                      ✓ Telah Disetujui
                    </span>
                  ) : status === "DITOLAK" ? (
                    <span className="text-xs font-medium text-rose-400 flex items-center gap-1.5">
                      ✕ Telah Ditolak
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">
                      Permohonan Dibatalkan
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
