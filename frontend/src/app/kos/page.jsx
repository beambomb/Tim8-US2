'use client';

import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useKosList } from '@/features/kos/hooks/useKosList';
import KosCardReal from '@/features/kos/components/KosCardReal';
import KosFilterSidebar from '@/features/kos/components/KosFilterSidebar';
import KosCatalogSkeleton from '@/features/kos/components/KosCatalogSkeleton';

function KosCatalogContent() {
  const { kosList, isLoading, error, filters, updateFilter, resetFilters } = useKosList();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title & Subtitle */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F1F5F9] tracking-tight">
          Katalog Kos Terverifikasi
        </h1>
        <p className="mt-1.5 text-sm text-[#94A3B8]">
          Temukan hunian kos mahasiswa dengan fasilitas lengkap dan harga sewa transparan.
        </p>
      </div>

      {/* Main Grid: Filter Sidebar (Left) + Content (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <KosFilterSidebar
            filters={filters}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
          />
        </div>

        {/* Kos Cards Grid Area */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Active Filter Count & Status Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-[#94A3B8]">
            <span>
              Menampilkan{' '}
              <strong className="text-[#F1F5F9] font-mono tabular-nums">
                {isLoading ? '...' : kosList.length}
              </strong>{' '}
              kos terdaftar
            </span>

            {filters.tipe !== 'all' || filters.lokasi || filters.fasilitas || filters.tersedia ? (
              <button
                type="button"
                onClick={resetFilters}
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Hapus Semua Filter
              </button>
            ) : null}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Skeleton or Content */}
          {isLoading ? (
            <KosCatalogSkeleton count={6} />
          ) : kosList.length === 0 ? (
            <div className="rounded-xl bg-[#141D30] border border-slate-800 p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[#F1F5F9]">
                Tidak Ada Kos yang Cocok
              </h3>
              <p className="text-xs text-[#94A3B8] max-w-sm">
                Tidak ditemukan kos yang sesuai dengan kriteria filter Anda saat ini. Coba ubah rentang harga atau hapus kata kunci pencarian.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-[#10B981] hover:text-[#0A0F1D] border border-emerald-500/30 transition-colors"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {kosList.map((kos) => (
                <KosCardReal key={kos._id} kos={kos} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KosCatalogPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1D] text-[#F1F5F9] flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <Suspense fallback={<KosCatalogSkeleton count={6} />}>
          <KosCatalogContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
