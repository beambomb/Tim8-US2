'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useOwnerKos } from '@/features/owner/hooks/useOwnerKos';
import OwnerKosTable from '@/features/owner/components/OwnerKosTable';

export default function OwnerKosManagementPage() {
  const {
    kosList,
    isLoading,
    error,
    actionLoadingId,
    refetch,
    handleDelete,
    handleSubmitVerification,
    handleUpdateAvailability,
  } = useOwnerKos();

  const [activeTab, setActiveTab] = useState('ALL');

  // Filter list based on selected tab
  const filteredKos = useMemo(() => {
    if (activeTab === 'ALL') return kosList;
    if (activeTab === 'Approved') return kosList.filter((k) => k.statusVerifikasi === 'Approved');
    if (activeTab === 'Pending')
      return kosList.filter((k) => k.statusVerifikasi === 'Pending' || !k.statusVerifikasi);
    if (activeTab === 'Rejected') return kosList.filter((k) => k.statusVerifikasi === 'Rejected');
    return kosList;
  }, [kosList, activeTab]);

  const counts = useMemo(() => {
    const approved = kosList.filter((k) => k.statusVerifikasi === 'Approved').length;
    const pending = kosList.filter(
      (k) => k.statusVerifikasi === 'Pending' || !k.statusVerifikasi
    ).length;
    const rejected = kosList.filter((k) => k.statusVerifikasi === 'Rejected').length;
    return { all: kosList.length, approved, pending, rejected };
  }, [kosList]);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F5F9]">
            Inventaris & Manajemen Properti Kos
          </h1>
          <p className="mt-1 text-xs text-[#94A3B8]">
            Perbarui kuota kamar secara instan, pantau status kurasi tim verifikator, dan kelola listing properti.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={refetch}
            className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#141D30] border border-slate-700/80 transition-colors"
          >
            Segarkan
          </button>
          <Link
            href="/owner/kos/tambah"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#10B981] text-[#0A0F1D] hover:bg-[#059669] transition-colors shadow-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Tambah Kos Baru</span>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'ALL', label: 'Semua Kos', count: counts.all },
          { id: 'Approved', label: 'Disetujui', count: counts.approved },
          { id: 'Pending', label: 'Menunggu Verifikasi', count: counts.pending },
          { id: 'Rejected', label: 'Ditolak', count: counts.rejected },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#141D30] text-[#F1F5F9] font-semibold border border-slate-700'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#141D30]/40'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Table / List */}
      {isLoading ? (
        <div className="rounded-xl bg-[#141D30] border border-slate-800 p-8 flex flex-col gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-800/60 rounded-lg" />
          ))}
        </div>
      ) : (
        <OwnerKosTable
          kosList={filteredKos}
          handleUpdateAvailability={handleUpdateAvailability}
          handleSubmitVerification={handleSubmitVerification}
          handleDelete={handleDelete}
          actionLoadingId={actionLoadingId}
        />
      )}
    </div>
  );
}
