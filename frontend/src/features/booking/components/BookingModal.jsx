"use client";

import { useState, useEffect } from "react";

export default function BookingModal({
  isOpen,
  onClose,
  kos,
  onSubmit,
  isSubmitting,
  error,
  onSuccess,
}) {
  const today = new Date().toISOString().split("T")[0];
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100"
      >
        {/* Header Modal */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Ajukan Sewa Kamar
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{kos.nama}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Tutup modal"
          >
            ✕
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
          {/* Tanggal Mulai */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Mulai Masuk Kos
            </label>
            <input
              type="date"
              min={today}
              required
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
            />
          </div>

          {/* Durasi Sewa */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Durasi Sewa
            </label>
            <select
              value={durasiBulan}
              onChange={(e) => setDurasiBulan(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 bg-white"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan untuk Pemilik (Opsional)
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Saya mahasiswa semester 5, perkiraan sampai kos pukul 09.00..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
            />
          </div>

          {/* Rincian Biaya */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Tarif sewa per bulan</span>
              <span className="font-mono">{formatRupiah(kos.harga)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Durasi sewa dipilih</span>
              <span>× {durasiBulan} bulan</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
              <span>Total Estimasi Biaya</span>
              <span className="text-emerald-700 font-mono text-base">
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
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSubmitting ? "Mengirim Pengajuan..." : "Konfirmasi Pengajuan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
