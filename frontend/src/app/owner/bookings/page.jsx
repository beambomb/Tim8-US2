"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import RefreshButton from "@/components/ui/RefreshButton";
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

  const getStatusLabel = (status) => {
    switch (status) {
      case "DISETUJUI":
        return "Disetujui";
      case "DITOLAK":
        return "Ditolak";
      case "DIBATALKAN":
        return "Dibatalkan";
      default:
        return "Menunggu";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "DISETUJUI":
        return "bg-[#DCFAE5] text-[#04250E] border border-[#BBF7D0]";
      case "DITOLAK":
        return "bg-[#FFEDEA] text-[#831C1E] border border-[#FECACA]";
      case "DIBATALKAN":
        return "bg-[#EEF2F7] text-[#475569] border border-[#E2E8F0]";
      default:
        return "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]";
    }
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
      <div className="flex flex-col gap-6 text-[#0F172A]">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-72 rounded-md bg-[#E2E8F0]" />
            <div className="h-4 w-96 rounded-md bg-[#EEF2F7]" />
          </div>
          <div className="h-9 w-32 rounded-lg bg-[#E2E8F0]" />
        </div>
        <div className="h-10 w-full rounded-lg bg-[#EEF2F7]" />
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] divide-y divide-[#E2E8F0]">
          {[1, 2, 3].map((row) => (
            <div key={row} className="p-5 flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-56 rounded bg-[#E2E8F0]" />
                <div className="h-3.5 w-80 rounded bg-[#EEF2F7]" />
              </div>
              <div className="h-9 w-36 rounded-lg bg-[#EEF2F7]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "PEMILIK_KOS") {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-8">
          <h1 className="text-xl font-bold text-[#0F172A]">
            Akses Khusus Pemilik Kos
          </h1>
          <p className="mt-2 text-sm text-[#475569]">
            Halaman ini hanya dapat diakses oleh akun dengan peran{" "}
            <strong className="text-[#0F172A]">Pemilik Kos</strong>.
          </p>
          <Link
            href="/auth/login"
            className="mt-5 inline-block rounded-lg bg-[#1D4ED8] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1E40AF] transition-colors"
          >
            Login Pemilik Kos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-[#0F172A]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Permohonan Booking Masuk
          </h1>
          <p className="mt-1 text-sm text-[#475569] tabular-nums">
            {counts.PENDING > 0
              ? `${counts.PENDING} permohonan menunggu konfirmasi dari total ${counts.ALL} pengajuan.`
              : `Seluruh ${counts.ALL} permohonan booking telah ditinjau.`}
          </p>
        </div>

        <RefreshButton
          onClick={refetch}
          isLoading={isLoading}
          label="Segarkan antrean booking"
          variant="app"
          className="self-start sm:self-auto"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-[#FECACA] bg-[#FFEDEA] p-4 text-xs font-medium text-[#831C1E]">
          {error}
        </div>
      )}

      {/* Underline Tabs Filter Status */}
      <div className="flex gap-1 overflow-x-auto border-b border-[#E2E8F0]">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = counts[tab.key] || 0;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? "border-[#1D4ED8] text-[#0F172A] font-semibold"
                  : "border-transparent text-[#475569] hover:text-[#0F172A]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs tabular-nums ${
                  isActive
                    ? "bg-[#EFF6FF] text-[#1D4ED8] font-semibold"
                    : "bg-[#EEF2F7] text-[#475569]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Booking Queue List */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-12 text-center">
          <p className="text-sm font-semibold text-[#0F172A]">
            Tidak ada permohonan booking pada kategori ini.
          </p>
          <p className="mt-1 text-xs text-[#475569]">
            Permohonan baru dari mahasiswa akan langsung muncul di daftar ini.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] overflow-hidden divide-y divide-[#E2E8F0]">
          {filteredBookings.map((booking) => {
            const tenant = booking.userId || {};
            const tenantId = tenant._id || tenant.id;
            const kos = booking.kosId || {};
            const kosId = kos._id || kos.id;
            const status = normalizeStatus(booking.status);
            const totalHarga = (kos.harga || 0) * (booking.durasiBulan || 1);
            const isProcessing = processingId === booking._id;
            const tenantInitial = (tenant.nama || "M").charAt(0).toUpperCase();

            return (
              <div
                key={booking._id}
                className="flex flex-col justify-between gap-4 px-5 py-4 hover:bg-[#F5F7FA]/70 transition-colors lg:flex-row lg:items-center"
              >
                {/* Identitas Properti, Penyewa & Detail Sewa */}
                <div className="min-w-0 flex-1 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadgeClass(
                        status
                      )}`}
                    >
                      {getStatusLabel(status)}
                    </span>

                    {kosId ? (
                      <Link
                        href={`/kos/${kosId}`}
                        className="text-sm font-semibold text-[#0F172A] hover:text-[#1D4ED8] transition-colors truncate"
                      >
                        {kos.nama || "Properti Kos"}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-[#0F172A] truncate">
                        {kos.nama || "Properti Kos"}
                      </span>
                    )}

                    <span className="text-xs text-[#475569] tabular-nums">
                      Diajukan {formatDate(booking.createdAt)}
                    </span>
                  </div>

                  {/* Baris Profil Mahasiswa Pemesan */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#475569]">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#EEF2F7] text-[#0F172A] flex items-center justify-center text-xs font-semibold shrink-0">
                        {tenantInitial}
                      </span>
                      <span className="font-semibold text-[#0F172A]">
                        {tenant.nama || "Mahasiswa Pemesan"}
                      </span>
                    </div>
                    <span>{tenant.email || "-"}</span>
                    <span className="tabular-nums text-[#0F172A]">
                      {tenant.noHp || "-"}
                    </span>
                    {tenantId && (
                      <Link
                        href={`/chat/${tenantId}?kosId=${kosId || ""}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] hover:underline"
                      >
                        <svg
                          className="w-3.5 h-3.5"
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
                        <span>Chat Mahasiswa</span>
                      </Link>
                    )}
                  </div>

                  {/* Rincian Sewa */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#475569]">
                    <span className="tabular-nums">
                      Mulai Sewa:{" "}
                      <strong className="font-semibold text-[#0F172A]">
                        {formatDate(booking.tanggalMulai)}
                      </strong>
                    </span>
                    <span className="tabular-nums">
                      Durasi:{" "}
                      <strong className="font-semibold text-[#0F172A]">
                        {booking.durasiBulan || 1} Bulan
                      </strong>
                    </span>
                  </div>

                  {booking.catatan && (
                    <p className="text-xs text-[#475569] bg-[#F5F7FA] rounded-lg px-3 py-2">
                      Catatan pemesan: &quot;{booking.catatan}&quot;
                    </p>
                  )}
                </div>

                {/* Kolom Kanan: Total Biaya (rata kanan tabular) & Tombol Aksi */}
                <div className="flex shrink-0 flex-wrap items-center justify-between lg:justify-end gap-5 pt-2 lg:pt-0">
                  <div className="lg:text-right">
                    <span className="block text-xs text-[#475569]">
                      Estimasi Total
                    </span>
                    <strong className="text-base font-bold text-[#0F172A] tabular-nums">
                      {formatRupiah(booking.totalHarga || totalHarga)}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {status === "PENDING" ? (
                      <>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleApprove(booking._id)}
                          className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-semibold bg-[#1D4ED8] text-white hover:bg-[#1E40AF] disabled:opacity-50 transition-colors cursor-pointer"
                        >
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
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                          <span>{isProcessing ? "Memproses..." : "Setujui"}</span>
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleReject(booking._id)}
                          className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-semibold text-[#831C1E] bg-[#FFFFFF] border border-[#FECACA] hover:bg-[#FFEDEA] disabled:opacity-50 transition-colors cursor-pointer"
                        >
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          <span>Tolak</span>
                        </button>
                      </>
                    ) : status === "DISETUJUI" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#247B50]">
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
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                        <span>Telah Disetujui</span>
                      </span>
                    ) : status === "DITOLAK" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C4242A]">
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
                        <span>Telah Ditolak</span>
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-[#475569]">
                        Permohonan Dibatalkan
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
