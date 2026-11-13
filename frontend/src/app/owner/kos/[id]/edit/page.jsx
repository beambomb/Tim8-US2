'use client';

import { Suspense, use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ownerService } from '@/features/owner/services/ownerService';
import { kosService } from '@/features/kos/services/kosService';
import OwnerKosForm from '@/features/owner/components/OwnerKosForm';

function OwnerEditKosContent({ params }) {
  const unwrappedParams = typeof params?.then === 'function' ? use(params) : params;
  const id = unwrappedParams?.id;

  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    const fetchTargetKos = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // First try to find kos in owner inventory (works for Pending, Approved, and Rejected)
        const ownerRes = await ownerService.getOwnerKos();
        const found = ownerRes.data?.find((item) => item._id === id);

        if (found) {
          if (isMounted) setInitialData(found);
          return;
        }

        // Fallback: try public kos detail if already approved
        const publicRes = await kosService.getKosDetail(id);
        if (publicRes.data && isMounted) {
          setInitialData(publicRes.data);
          return;
        }

        if (isMounted) {
          setError('Data properti kos tidak ditemukan atau Anda tidak memiliki akses kepemilikan.');
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              'Gagal memuat data kos yang akan diedit. Pastikan ID valid.'
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTargetKos();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-32" />
        <div className="h-8 bg-slate-800 rounded w-64" />
        <div className="h-64 bg-[#141D30] rounded-xl border border-slate-800" />
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="flex flex-col gap-4 max-w-md">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error || 'Data kos tidak ditemukan.'}
        </div>
        <Link
          href="/owner/kos"
          className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1"
        >
          &larr; Kembali ke Daftar Kos Saya
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header with Back Link */}
      <div className="flex flex-col gap-2 pb-4 border-b border-slate-800">
        <Link
          href="/owner/kos"
          className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-emerald-400 transition-colors w-fit"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>Kembali ke Inventaris Kos</span>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F5F9]">
              Edit Properti: {initialData.nama}
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Perbarui rincian spesifikasi, harga sewa bulanan, kuota ketersediaan kamar, atau kelola galeri foto.
            </p>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
              initialData.statusVerifikasi === 'Approved'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : initialData.statusVerifikasi === 'Rejected'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
            }`}
          >
            {initialData.statusVerifikasi || 'Pending'}
          </span>
        </div>
      </div>

      {/* Reusable Form in Edit Mode */}
      <OwnerKosForm initialData={initialData} isEdit={true} />
    </div>
  );
}

export default function OwnerEditKosPage({ params }) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 max-w-4xl animate-pulse">
          <div className="h-4 bg-slate-800 rounded w-32" />
          <div className="h-8 bg-slate-800 rounded w-64" />
          <div className="h-64 bg-[#141D30] rounded-xl border border-slate-800" />
        </div>
      }
    >
      <OwnerEditKosContent params={params} />
    </Suspense>
  );
}
