'use client';

import Link from 'next/link';
import OwnerKosForm from '@/features/owner/components/OwnerKosForm';

export default function OwnerAddKosPage() {
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

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F5F9]">
          Pendaftaran Properti Kos Baru
        </h1>
        <p className="text-xs text-[#94A3B8]">
          Isi spesifikasi kos dengan lengkap, tentukan koordinat lokasi, dan sertakan foto asli untuk mempercepat persetujuan verifikasi.
        </p>
      </div>

      {/* Reusable Form in Create Mode */}
      <OwnerKosForm isEdit={false} />
    </div>
  );
}
