'use client';

import { Suspense, use } from 'react';
import Link from 'next/link';
import { useOwnerKosForm } from '@/features/owner/hooks/useOwnerKosForm';
import OwnerKosForm from '@/features/owner/components/OwnerKosForm';

function EditKosSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl" aria-busy="true" aria-label="Memuat formulir edit kos">
      <div className="h-4 bg-[#E2E8F0] rounded w-36" />
      <div className="h-8 bg-[#E2E8F0] rounded w-72" />
      <div className="h-64 bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] p-6 flex flex-col gap-4">
        <div className="h-5 bg-[#EEF2F7] rounded w-48" />
        <div className="h-10 bg-[#EEF2F7] rounded w-full" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-[#EEF2F7] rounded" />
          <div className="h-10 bg-[#EEF2F7] rounded" />
        </div>
      </div>
    </div>
  );
}

function OwnerEditKosContent({ params }) {
  const unwrappedParams = typeof params?.then === 'function' ? use(params) : params;
  const id = unwrappedParams?.id;

  const formController = useOwnerKosForm({
    kosId: id,
    isEdit: true,
  });

  const { initialData, isFetchingInitial, fetchError } = formController;

  if (isFetchingInitial) {
    return <EditKosSkeleton />;
  }

  if (fetchError || !initialData) {
    return (
      <div className="flex flex-col gap-4 max-w-md">
        <div className="p-4 rounded-xl bg-[#FFEDEA] border border-[#FECACA] text-[#831C1E] text-xs">
          {fetchError || 'Data kos tidak ditemukan.'}
        </div>
        <Link
          href="/owner/kos"
          className="text-xs font-medium text-[var(--accent)] hover:underline inline-flex items-center gap-1.5 w-fit"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>Kembali ke Daftar Kos Saya</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header with Back Link */}
      <div className="flex flex-col gap-2 pb-4 border-b border-[#E2E8F0]">
        <Link
          href="/owner/kos"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#475569] hover:text-[var(--accent)] transition-colors w-fit"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>Kembali ke Inventaris Kos</span>
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">
              Edit Properti: {initialData.nama}
            </h1>
            <p className="mt-1 text-sm text-[#475569]">
              Perbarui rincian spesifikasi, harga sewa bulanan, kuota ketersediaan kamar, atau kelola galeri foto.
            </p>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${
              initialData.statusVerifikasi === 'Approved'
                ? 'bg-[#DCFAE5] text-[#04250E] border-[#A7F3D0]'
                : initialData.statusVerifikasi === 'Rejected'
                ? 'bg-[#FFEDEA] text-[#831C1E] border-[#FECACA]'
                : 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]'
            }`}
          >
            {initialData.statusVerifikasi || 'Pending'}
          </span>
        </div>
      </div>

      {/* Reusable Form in Edit Mode */}
      <OwnerKosForm
        kosId={id}
        initialData={initialData}
        isEdit={true}
        controller={formController}
      />
    </div>
  );
}

export default function OwnerEditKosPage({ params }) {
  return (
    <Suspense fallback={<EditKosSkeleton />}>
      <OwnerEditKosContent params={params} />
    </Suspense>
  );
}
