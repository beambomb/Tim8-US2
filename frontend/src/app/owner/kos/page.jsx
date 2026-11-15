'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import RefreshButton from '@/components/ui/RefreshButton';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">
            Inventaris dan Manajemen Properti Kos
          </h1>
          <p className="mt-1 text-sm text-[#475569]">
            Perbarui kuota kamar secara instan, pantau status kurasi tim verifikator, dan kelola listing properti.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <RefreshButton
            onClick={refetch}
            isLoading={isLoading}
            label="Segarkan daftar kos"
            variant="app"
          />
          <Link
            href="/owner/kos/tambah"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Tambah Kos Baru</span>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-[#FFEDEA] border border-[#FECACA] text-[#831C1E] text-xs">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] pb-3">
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
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#FFFFFF] text-[#0F172A] font-semibold border border-[#E2E8F0]'
                  : 'text-[#475569] font-medium hover:text-[#0F172A] hover:bg-[#EEF2F7]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[11px] tabular-nums ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#1E40AF] font-semibold'
                    : 'bg-[#EEF2F7] text-[#475569]'
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
        <div
          className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] p-6 flex flex-col gap-3"
          aria-busy="true"
          aria-label="Memuat daftar properti kos"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-[#EEF2F7] rounded-lg" />
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
