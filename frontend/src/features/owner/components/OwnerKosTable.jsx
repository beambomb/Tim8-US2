'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function OwnerKosTable({
  kosList,
  handleUpdateAvailability,
  handleSubmitVerification,
  handleDelete,
  actionLoadingId,
}) {
  const [expandedReasonId, setExpandedReasonId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const toggleReasonAccordion = (id) => {
    setExpandedReasonId((prev) => (prev === id ? null : id));
  };

  const onUpdateRoom = async (kos, delta) => {
    const current = Number(kos.jumlahKamarTersedia) || 0;
    const maxCapacity = Number(kos.jumlahKamar) || current;
    const nextVal = current + delta;
    if (nextVal < 0 || nextVal > maxCapacity) return;

    const res = await handleUpdateAvailability(kos._id, nextVal);
    if (!res.success) {
      setActionMessage({ type: 'error', text: res.error });
    }
  };

  const onSubmitForReview = async (id) => {
    const res = await handleSubmitVerification(id);
    if (res.success) {
      setActionMessage({ type: 'success', text: res.message });
    } else {
      setActionMessage({ type: 'error', text: res.error });
    }
  };

  const onConfirmDelete = async (id) => {
    const res = await handleDelete(id);
    setDeleteConfirmId(null);
    if (res.success) {
      setActionMessage({ type: 'success', text: res.message });
    } else {
      setActionMessage({ type: 'error', text: res.error });
    }
  };

  if (!kosList || kosList.length === 0) {
    return (
      <div className="rounded-xl bg-[#141D30] border border-slate-800 p-8 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-[#F1F5F9]">Belum Ada Properti Kos</h3>
        <p className="text-xs text-[#94A3B8] max-w-sm">
          Anda belum mendaftarkan properti kos. Klik tombol di bawah untuk mulai mempublikasikan kos Anda.
        </p>
        <Link
          href="/owner/kos/tambah"
          className="mt-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#10B981] text-[#0A0F1D] hover:bg-[#059669] transition-colors"
        >
          Daftarkan Kos Pertama
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toast Notification Alert */}
      {actionMessage && (
        <div
          className={`px-4 py-3 rounded-lg text-xs flex items-center justify-between border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-[#F1F5F9] font-bold ml-4"
          >
            x
          </button>
        </div>
      )}

      {/* Kos Table Container */}
      <div className="rounded-xl bg-[#141D30] border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0A0F1D]/50 text-[#94A3B8]">
                <th className="py-3 px-4 font-medium">Properti Kos</th>
                <th className="py-3 px-4 font-medium">Tipe</th>
                <th className="py-3 px-4 font-medium">Harga / Bulan</th>
                <th className="py-3 px-4 font-medium text-center">Kamar Siap Huni</th>
                <th className="py-3 px-4 font-medium">Status Verifikasi</th>
                <th className="py-3 px-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {kosList.map((kos) => {
                const isLoadingRow = actionLoadingId === kos._id;
                const isRejected = kos.statusVerifikasi === 'Rejected';
                const isApproved = kos.statusVerifikasi === 'Approved';
                const isPending = kos.statusVerifikasi === 'Pending' || !kos.statusVerifikasi;
                const isAccordionOpen = expandedReasonId === kos._id;

                const formattedPrice = new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                }).format(kos.harga || 0);

                return (
                  <tr
                    key={kos._id}
                    className={`hover:bg-[#0A0F1D]/30 transition-colors ${
                      isLoadingRow ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {/* Property info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              kos.fotoUrls && kos.fotoUrls.length > 0
                                ? kos.fotoUrls[0]
                                : '/images/kamarKos2.webp'
                            }
                            alt={kos.nama}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-[#F1F5F9] truncate">
                            {kos.nama}
                          </span>
                          <span className="text-[11px] text-[#94A3B8] truncate">
                            {kos.lokasi}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Kos Type */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                        {kos.tipe}
                      </span>
                    </td>

                    {/* Rental Price */}
                    <td className="py-3.5 px-4 font-mono font-medium text-[#F1F5F9] tabular-nums">
                      {formattedPrice}
                    </td>

                    {/* Quick Availability Adjuster */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onUpdateRoom(kos, -1)}
                          disabled={Number(kos.jumlahKamarTersedia) <= 0}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed font-mono text-sm transition-colors"
                          title="Kurangi kamar tersedia (-1)"
                        >
                          -
                        </button>

                        <div className="flex flex-col items-center min-w-16">
                          <span className="font-mono font-bold text-emerald-400 text-sm tabular-nums">
                            {kos.jumlahKamarTersedia}
                          </span>
                          <span className="text-[10px] text-[#64748B]">
                            / {kos.jumlahKamar} total
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onUpdateRoom(kos, 1)}
                          disabled={
                            Number(kos.jumlahKamarTersedia) >= Number(kos.jumlahKamar)
                          }
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed font-mono text-sm transition-colors"
                          title="Tambah kamar tersedia (+1)"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Status Badge & Accordion Button */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        {isApproved && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Disetujui
                          </span>
                        )}

                        {isPending && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/30">
                            Menunggu Verifikasi
                          </span>
                        )}

                        {isRejected && (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              Ditolak
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleReasonAccordion(kos._id)}
                              className="text-[11px] text-rose-300 underline hover:text-rose-200"
                            >
                              {isAccordionOpen ? 'Tutup Alasan' : 'Lihat Alasan'}
                            </button>
                          </div>
                        )}

                        {/* Rejection Reason Accordion Drawer */}
                        {isRejected && isAccordionOpen && (
                          <div className="mt-2 p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-200 text-[11px] max-w-sm">
                            <strong className="block text-rose-300 mb-1">Catatan Kurator:</strong>
                            <p className="mb-2">
                              {kos.alasanPenolakan ||
                                'Spesifikasi atau foto dokumen properti belum memenuhi kelayakan standar CariKos.'}
                            </p>
                            <button
                              type="button"
                              onClick={() => onSubmitForReview(kos._id)}
                              className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-medium transition-colors"
                            >
                              Ajukan Verifikasi Ulang
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Link */}
                        <Link
                          href={`/owner/kos/${kos._id}/edit`}
                          className="px-2.5 py-1 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                        >
                          Edit
                        </Link>

                        {/* Submit Verification for Pending/Rejected */}
                        {!isApproved && (
                          <button
                            type="button"
                            onClick={() => onSubmitForReview(kos._id)}
                            className="px-2.5 py-1 rounded text-[11px] font-medium bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors"
                          >
                            Ajukan
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(kos._id)}
                          className="px-2.5 py-1 rounded text-[11px] font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-[#141D30] border border-slate-700 p-6 flex flex-col gap-4 text-[#F1F5F9]">
            <h3 className="text-base font-semibold">Konfirmasi Hapus Properti</h3>
            <p className="text-xs text-[#94A3B8]">
              Apakah Anda yakin ingin menghapus properti kos ini secara permanen? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => onConfirmDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 transition-colors"
              >
                Ya, Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
