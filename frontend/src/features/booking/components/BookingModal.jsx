"use client";

import { useState, useEffect } from "react";

function getLocalTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const mm = month < 10 ? `0${month}` : `${month}`;
  const dd = day < 10 ? `0${day}` : `${day}`;
  return `${year}-${mm}-${dd}`;
}

export default function BookingModal({
  isOpen,
  onClose,
  kos,
  onSubmit,
  isSubmitting,
  error,
  onSuccess,
}) {
  const today = getLocalTodayString();
  const [tanggalMulai, setTanggalMulai] = useState(today);
  const [durasiBulan, setDurasiBulan] = useState(1);
  const [catatan, setCatatan] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !kos) return null;

  const totalBiaya = (kos.harga || 0) * Number(durasiBulan || 1);

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka || 0);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const result = await onSubmit({
      tanggalMulai,
      durasiBulan: Number(durasiBulan),
      catatan: catatan.trim(),
    });

    if (result?.success) {
      setCatatan("");
      onSuccess?.();
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-[#FFFFFF] p-6 ring-1 ring-[#E2E8F0]"
      >
        {/* Header Modal */}
        <div className="flex items-start justify-between pb-4">
          <div>
            <h3
              id="booking-modal-title"
              className="text-xl font-bold text-[#0F172A]"
            >
              Ajukan Sewa Kamar
            </h3>
            <p className="mt-1 text-xs text-[#475569]">{kos.nama}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#475569] hover:bg-[#EEF2F7] hover:text-[#0F172A] transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 rounded-xl bg-[#FFEDEA] p-3 text-xs font-medium text-[#831C1E] ring-1 ring-[#FECACA]">
            {error}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Tanggal Mulai */}
          <div>
            <label
              htmlFor="booking-tanggal-mulai"
              className="mb-1.5 block text-xs font-semibold text-[#0F172A]"
            >
              Tanggal Mulai Masuk Kos
            </label>
            <input
              id="booking-tanggal-mulai"
              type="date"
              min={today}
              required
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="w-full rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-3.5 py-2 text-sm text-[#0F172A] tabular-nums focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
            />
          </div>

          {/* Durasi Sewa */}
          <div>
            <label
              htmlFor="booking-durasi-bulan"
              className="mb-1.5 block text-xs font-semibold text-[#0F172A]"
            >
              Durasi Sewa
            </label>
            <select
              id="booking-durasi-bulan"
              value={durasiBulan}
              onChange={(e) => setDurasiBulan(Number(e.target.value))}
              className="w-full rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-3.5 py-2 text-sm text-[#0F172A] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
            >
              {[1, 2, 3, 6, 12].map((bulan) => (
                <option key={bulan} value={bulan}>
                  {bulan} Bulan
                </option>
              ))}
            </select>
          </div>

          {/* Catatan */}
          <div>
            <label
              htmlFor="booking-catatan"
              className="mb-1.5 block text-xs font-semibold text-[#0F172A]"
            >
              Catatan untuk Pemilik (Opsional)
            </label>
            <textarea
              id="booking-catatan"
              rows={3}
              placeholder="Contoh: Saya mahasiswa semester 5, perkiraan sampai kos pukul 09.00..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-3.5 py-2 text-sm text-[#0F172A] placeholder:text-[#64748B] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
            />
          </div>

          {/* Rincian Biaya */}
          <div className="rounded-xl bg-[#EEF2F7] p-4 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-[#475569]">
              <span>Tarif sewa per bulan</span>
              <span className="font-medium text-[#0F172A] tabular-nums">
                {formatRupiah(kos.harga)}
              </span>
            </div>
            <div className="flex justify-between text-[#475569]">
              <span>Durasi sewa dipilih</span>
              <span className="font-medium text-[#0F172A] tabular-nums">
                {durasiBulan} bulan
              </span>
            </div>
            <div className="pt-2 flex items-baseline justify-between font-bold text-[#0F172A]">
              <span>Total Estimasi Biaya</span>
              <span className="text-base font-extrabold text-[#0F172A] tabular-nums">
                {formatRupiah(totalBiaya)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl bg-[#EEF2F7] px-4 py-2.5 text-xs font-semibold text-[#0F172A] hover:bg-[#E2E8F0] disabled:opacity-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1E40AF] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSubmitting ? "Mengirim Pengajuan..." : "Konfirmasi Pengajuan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
