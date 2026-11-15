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

  const formatRupiah = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount || 0);

  if (!kosList || kosList.length === 0) {
    return (
      <div className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] p-8 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#EEF2F7] flex items-center justify-center text-[#475569]">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-[#0F172A]">
          Belum ada properti kos
        </h3>
        <p className="text-xs text-[#475569] max-w-sm">
          Anda belum mendaftarkan properti kos pada kategori ini. Tambahkan properti kos untuk mulai menerima pengajuan sewa.
        </p>
        <Link
          href="/owner/kos/tambah"
          className="mt-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
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
              ? 'bg-[#DCFAE5] text-[#04250E] border-[#A7F3D0]'
              : 'bg-[#FFEDEA] text-[#831C1E] border-[#FECACA]'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            aria-label="Tutup notifikasi"
            className="ml-4 p-1 rounded hover:bg-[#0F172A]/10 text-[#0F172A] transition-colors cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Kos Inventory Surface */}
      <div className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] overflow-hidden">
        {/* Mobile Card/List Layout (< md) */}
        <div className="md:hidden divide-y divide-[#E2E8F0]">
          {kosList.map((kos) => {
            const isLoadingRow = actionLoadingId === kos._id;
            const isRejected = kos.statusVerifikasi === 'Rejected';
            const isApproved = kos.statusVerifikasi === 'Approved';
            const isPending = kos.statusVerifikasi === 'Pending' || !kos.statusVerifikasi;
            const isAccordionOpen = expandedReasonId === kos._id;

            return (
              <div
                key={`mobile-${kos._id}`}
                className={`p-4 flex flex-col gap-3 ${
                  isLoadingRow ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                {/* Line 1: Identity & Right-aligned Price */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-[#EEF2F7] border border-[#E2E8F0] overflow-hidden shrink-0">
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
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">
                        {kos.nama}
                      </p>
                      <p className="text-xs text-[#475569] truncate">
                        {kos.lokasi}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-semibold text-[#0F172A] tabular-nums block">
                      {formatRupiah(kos.harga)}
                    </span>
                    <span className="text-[11px] text-[#475569]">/bulan</span>
                  </div>
                </div>

                {/* Line 2: Type + Status + Quota Adjuster */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#EEF2F7] text-[#0F172A]">
                      {kos.tipe}
                    </span>
                    {isApproved && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#DCFAE5] text-[#04250E] border border-[#A7F3D0]">
                        Disetujui
                      </span>
                    )}
                    {isPending && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]">
                        Menunggu Verifikasi
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FFEDEA] text-[#831C1E] border border-[#FECACA]">
                        Ditolak
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="text-xs text-[#475569]">Siap huni:</span>
                    <button
                      type="button"
                      onClick={() => onUpdateRoom(kos, -1)}
                      disabled={Number(kos.jumlahKamarTersedia) <= 0}
                      aria-label={`Kurangi kamar siap huni untuk ${kos.nama}`}
                      className="w-7 h-7 rounded bg-[#EEF2F7] hover:bg-[#E2E8F0] text-[#0F172A] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                      </svg>
                    </button>
                    <span className="text-xs font-semibold text-[#0F172A] min-w-10 text-right">
                      {kos.jumlahKamarTersedia} / {kos.jumlahKamar}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateRoom(kos, 1)}
                      disabled={Number(kos.jumlahKamarTersedia) >= Number(kos.jumlahKamar)}
                      aria-label={`Tambah kamar siap huni untuk ${kos.nama}`}
                      className="w-7 h-7 rounded bg-[#EEF2F7] hover:bg-[#E2E8F0] text-[#0F172A] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Rejection reason toggle & drawer */}
                {isRejected && (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => toggleReasonAccordion(kos._id)}
                      className="text-xs font-medium text-[#831C1E] underline hover:text-[#0F172A] w-fit cursor-pointer"
                    >
                      {isAccordionOpen ? 'Tutup Alasan Penolakan' : 'Lihat Alasan Penolakan'}
                    </button>

                    {isAccordionOpen && (
                      <div className="p-3 rounded-lg bg-[#FFEDEA] border border-[#FECACA] text-[#831C1E] text-xs">
                        <strong className="block mb-1">Catatan Kurator:</strong>
                        <p className="mb-2">
                          {kos.alasanPenolakan ||
                            'Spesifikasi atau foto dokumen properti belum memenuhi kelayakan standar CariKos.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => onSubmitForReview(kos._id)}
                          className="px-2.5 py-1 rounded bg-[#FFFFFF] border border-[#FECACA] text-[#831C1E] hover:bg-[#FECACA]/40 font-medium transition-colors cursor-pointer"
                        >
                          Ajukan Verifikasi Ulang
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions Row */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Link
                    href={`/owner/kos/${kos._id}/edit`}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#EEF2F7] hover:bg-[#E2E8F0] text-[#0F172A] transition-colors"
                  >
                    Edit
                  </Link>

                  {isRejected && (
                    <button
                      type="button"
                      onClick={() => onSubmitForReview(kos._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#EFF6FF] text-[#1E40AF] hover:bg-[#DBEAFE] border border-[#BFDBFE] transition-colors cursor-pointer"
                    >
                      Ajukan
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(kos._id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FFEDEA] text-[#831C1E] hover:bg-[#FECACA] border border-[#FECACA] transition-colors cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table Layout (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F5F7FA] text-[#475569]">
                <th className="py-3 px-4 font-medium">Properti kos</th>
                <th className="py-3 px-4 font-medium">Tipe</th>
                <th className="py-3 px-4 font-medium text-right">Harga / Bulan</th>
                <th className="py-3 px-4 font-medium text-right">Kamar siap huni</th>
                <th className="py-3 px-4 font-medium">Status verifikasi</th>
                <th className="py-3 px-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {kosList.map((kos) => {
                const isLoadingRow = actionLoadingId === kos._id;
                const isRejected = kos.statusVerifikasi === 'Rejected';
                const isApproved = kos.statusVerifikasi === 'Approved';
                const isPending = kos.statusVerifikasi === 'Pending' || !kos.statusVerifikasi;
                const isAccordionOpen = expandedReasonId === kos._id;

                return (
                  <tr
                    key={kos._id}
                    className={`hover:bg-[#F5F7FA] transition-colors ${
                      isLoadingRow ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {/* Property info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#EEF2F7] border border-[#E2E8F0] overflow-hidden shrink-0">
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
                          <span className="font-semibold text-[#0F172A] truncate text-sm">
                            {kos.nama}
                          </span>
                          <span className="text-xs text-[#475569] truncate">
                            {kos.lokasi}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Kos Type */}
                    <td className="py-3.5 px-4 text-[#0F172A]">
                      <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-[#EEF2F7] text-[#0F172A]">
                        {kos.tipe}
                      </span>
                    </td>

                    {/* Rental Price (Right-Aligned Tabular) */}
                    <td className="py-3.5 px-4 text-right font-semibold text-[#0F172A] tabular-nums whitespace-nowrap">
                      {formatRupiah(kos.harga)}
                    </td>

                    {/* Quick Availability Adjuster (Right-Aligned Tabular) */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-2 tabular-nums">
                        <button
                          type="button"
                          onClick={() => onUpdateRoom(kos, -1)}
                          disabled={Number(kos.jumlahKamarTersedia) <= 0}
                          aria-label={`Kurangi kamar siap huni untuk ${kos.nama}`}
                          className="w-7 h-7 rounded bg-[#EEF2F7] hover:bg-[#E2E8F0] text-[#0F172A] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Kurangi kamar tersedia (-1)"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                          </svg>
                        </button>

                        <div className="flex flex-col items-end min-w-14">
                          <span className="font-semibold text-[#0F172A] text-sm">
                            {kos.jumlahKamarTersedia}
                          </span>
                          <span className="text-[11px] text-[#475569]">
                            / {kos.jumlahKamar} total
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onUpdateRoom(kos, 1)}
                          disabled={
                            Number(kos.jumlahKamarTersedia) >= Number(kos.jumlahKamar)
                          }
                          aria-label={`Tambah kamar siap huni untuk ${kos.nama}`}
                          className="w-7 h-7 rounded bg-[#EEF2F7] hover:bg-[#E2E8F0] text-[#0F172A] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Tambah kamar tersedia (+1)"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
                          </svg>
                        </button>
                      </div>
                    </td>

                    {/* Status Badge & Accordion Button */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        {isApproved && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#DCFAE5] text-[#04250E] border border-[#A7F3D0] whitespace-nowrap">
                            Disetujui
                          </span>
                        )}

                        {isPending && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] whitespace-nowrap">
                            Menunggu Verifikasi
                          </span>
                        )}

                        {isRejected && (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FFEDEA] text-[#831C1E] border border-[#FECACA] whitespace-nowrap">
                              Ditolak
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleReasonAccordion(kos._id)}
                              className="text-xs text-[#831C1E] underline hover:text-[#0F172A] whitespace-nowrap cursor-pointer"
                            >
                              {isAccordionOpen ? 'Tutup Alasan' : 'Lihat Alasan'}
                            </button>
                          </div>
                        )}

                        {/* Rejection Reason Accordion Drawer */}
                        {isRejected && isAccordionOpen && (
                          <div className="mt-2 p-3 rounded-lg bg-[#FFEDEA] border border-[#FECACA] text-[#831C1E] text-xs max-w-sm">
                            <strong className="block mb-1">Catatan Kurator:</strong>
                            <p className="mb-2">
                              {kos.alasanPenolakan ||
                                'Spesifikasi atau foto dokumen properti belum memenuhi kelayakan standar CariKos.'}
                            </p>
                            <button
                              type="button"
                              onClick={() => onSubmitForReview(kos._id)}
                              className="px-2.5 py-1 rounded bg-[#FFFFFF] border border-[#FECACA] text-[#831C1E] hover:bg-[#FECACA]/40 font-medium transition-colors cursor-pointer"
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
                        <Link
                          href={`/owner/kos/${kos._id}/edit`}
                          className="px-2.5 py-1 rounded text-xs font-medium bg-[#EEF2F7] hover:bg-[#E2E8F0] text-[#0F172A] transition-colors"
                        >
                          Edit
                        </Link>

                        {/* Submit Verification ONLY for Rejected */}
                        {isRejected && (
                          <button
                            type="button"
                            onClick={() => onSubmitForReview(kos._id)}
                            className="px-2.5 py-1 rounded text-xs font-medium bg-[#EFF6FF] text-[#1E40AF] hover:bg-[#DBEAFE] border border-[#BFDBFE] transition-colors cursor-pointer"
                          >
                            Ajukan
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(kos._id)}
                          className="px-2.5 py-1 rounded text-xs font-medium bg-[#FFEDEA] text-[#831C1E] hover:bg-[#FECACA] border border-[#FECACA] transition-colors cursor-pointer"
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/45"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-kos-dialog-title"
        >
          <div className="w-full max-w-md rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] p-6 flex flex-col gap-4 text-[#0F172A]">
            <h3 id="delete-kos-dialog-title" className="text-base font-semibold">
              Konfirmasi Hapus Properti
            </h3>
            <p className="text-sm text-[#475569]">
              Apakah Anda yakin ingin menghapus properti kos ini secara permanen? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-[#EEF2F7] text-[#0F172A] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => onConfirmDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#C4242A] text-white hover:bg-[#991B1B] transition-colors cursor-pointer"
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
