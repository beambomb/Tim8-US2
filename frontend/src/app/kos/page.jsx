'use client';

import { Suspense, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RefreshButton from '@/components/ui/RefreshButton';
import { useAuth } from '@/context/AuthContext';
import { useKosList } from '@/features/kos/hooks/useKosList';
import { useFavorites } from '@/features/kos/hooks/useFavorites';
import KosCardReal from '@/features/kos/components/KosCardReal';
import KosFilterSidebar from '@/features/kos/components/KosFilterSidebar';
import KosCatalogSkeleton from '@/features/kos/components/KosCatalogSkeleton';

const SORT_LABELS = {
  recommended: 'Terbaru',
  nearest: 'Diurutkan dari terdekat',
  'price-asc': 'Diurutkan dari termurah',
  'price-desc': 'Diurutkan dari termahal',
  'rooms-desc': 'Diurutkan kamar terbanyak',
};

function KosCatalogContent() {
  const { user, isAuthenticated } = useAuth();
  const {
    kosList,
    total,
    isLoading,
    isLocating,
    error,
    filters,
    updateFilter,
    resetFilters,
    refetch,
    sortBy,
    setSortBy,
    locationMode,
    activeLocation,
    campuses,
    popularPresets,
    selectedCampusId,
    radiusKm,
    setRadiusKm,
    selectCampusPreset,
    clearLocationFilter,
    addCampus,
    removeCampus,
    detectLocation,
  } = useKosList();
  const { favorites, isKosFavorited, handleToggleFavorite } = useFavorites();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const canFavorite = Boolean(isAuthenticated && user?.role === 'PENCARI_KOS');

  const checkFavorited = (kosId) => {
    if (!canFavorite) return false;
    if (typeof isKosFavorited === 'function') {
      return isKosFavorited(kosId);
    }
    return (favorites || []).some(
      (f) => String(f?.kosId?._id || f?.kosId) === String(kosId)
    );
  };

  const hasLocationFilter = locationMode !== 'all';
  const hasActiveFilters = Boolean(
    hasLocationFilter ||
      (filters.tipe && filters.tipe !== 'all') ||
      filters.lokasi ||
      filters.hargaMin ||
      filters.hargaMax ||
      filters.fasilitas ||
      filters.tersedia
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-8">
      {/* Page Title & Mobile Filter Toggle */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Cari Kos Terverifikasi
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setMobileFilterOpen((prev) => !prev)}
          aria-expanded={mobileFilterOpen}
          className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#FFFFFF] text-[13px] font-semibold text-[#0F172A] hover:bg-[#EEF2F7] transition-colors w-fit cursor-pointer"
        >
          <svg
            className="w-4 h-4 text-[#475569]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12"
            />
          </svg>
          <span>{mobileFilterOpen ? 'Sembunyikan Filter' : 'Filter & Radius Kampus'}</span>
        </button>
      </div>

      {/* Main Split Grid: Unified Sidebar (Left) + Kos Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className={`lg:col-span-1 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <KosFilterSidebar
            filters={filters}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
            locationMode={locationMode}
            campuses={campuses}
            popularPresets={popularPresets}
            selectedCampusId={selectedCampusId}
            radiusKm={radiusKm}
            isLocating={isLocating}
            onSelectCampus={selectCampusPreset}
            onAddCampus={addCampus}
            onRemoveCampus={removeCampus}
            onRadiusChange={setRadiusKm}
            onDetectGps={detectLocation}
          />
        </div>

        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Concise Results Summary + Sort + Refresh */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#FFFFFF] text-sm text-[#475569]">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {hasLocationFilter ? (
                <span>
                  <strong className="text-[#0F172A] tabular-nums font-semibold">
                    {isLoading ? '...' : total}
                  </strong>{' '}
                  kos dalam radius{' '}
                  <strong className="text-[var(--accent)] tabular-nums font-semibold">
                    {radiusKm} km
                  </strong>{' '}
                  dari{' '}
                  <span className="text-[#0F172A] font-medium">
                    {activeLocation.label}
                  </span>{' '}
                  · <span>{SORT_LABELS[sortBy] || SORT_LABELS.nearest}</span>
                </span>
              ) : (
                <span>
                  Menampilkan{' '}
                  <strong className="text-[#0F172A] tabular-nums font-semibold">
                    {isLoading ? '...' : total}
                  </strong>{' '}
                  kos terdaftar · <span>{SORT_LABELS[sortBy] || SORT_LABELS.recommended}</span>
                </span>
              )}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                aria-label="Urutkan hasil pencarian kos"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#F5F7FA] border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
              >
                {hasLocationFilter && (
                  <option value="nearest">Urutkan: Terdekat</option>
                )}
                <option value="recommended">Urutkan: Terbaru</option>
                <option value="price-asc">Urutkan: Harga Termurah</option>
                <option value="price-desc">Urutkan: Harga Tertinggi</option>
                <option value="rooms-desc">Urutkan: Kamar Tersedia</option>
              </select>

              <RefreshButton
                onClick={refetch}
                isLoading={isLoading}
                label="Muat ulang daftar kos"
                variant="public"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-[#FFEDEA] text-[#831C1E] text-sm">
              {error}
            </div>
          )}

          {/* Skeleton or Content */}
          {isLoading ? (
            <KosCatalogSkeleton count={6} />
          ) : kosList.length === 0 ? (
            <div className="rounded-xl bg-[#FFFFFF] p-12 text-center flex flex-col items-center justify-center gap-3">
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
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-[#0F172A]">
                Tidak Ada Kos yang Cocok
              </h2>
              <p className="text-base text-[#475569] max-w-sm">
                {hasLocationFilter
                  ? `Belum ada kos cocok dalam radius ${radiusKm} km dari ${activeLocation.label}. Coba perlebar radius, tampilkan semua lokasi, atau ubah filter.`
                  : 'Tidak ditemukan kos yang sesuai dengan kriteria filter Anda saat ini. Coba ubah rentang harga atau hapus kata kunci pencarian.'}
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                {hasLocationFilter && radiusKm < 10 && (
                  <button
                    type="button"
                    onClick={() => setRadiusKm(10, true)}
                    className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#EFF6FF] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors cursor-pointer"
                  >
                    Perlebar ke 10 km
                  </button>
                )}
                {hasLocationFilter && (
                  <button
                    type="button"
                    onClick={clearLocationFilter}
                    className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#F5F7FA] text-[#0F172A] hover:bg-[#EEF2F7] transition-colors cursor-pointer"
                  >
                    Tampilkan Semua Lokasi
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#F5F7FA] text-[#475569] hover:text-[#0F172A] hover:bg-[#EEF2F7] transition-colors cursor-pointer"
                >
                  Reset Semua Filter
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {kosList.map((kos) => (
                <KosCardReal
                  key={kos._id}
                  kos={kos}
                  showFavoriteButton={canFavorite}
                  isFavorited={checkFavorited(kos._id)}
                  onToggleFavorite={canFavorite ? handleToggleFavorite : undefined}
                />
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
    <div className="min-h-dvh bg-[#F5F7FA] text-[#0F172A] flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 pt-16 pb-14">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-8">
              <KosCatalogSkeleton count={6} />
            </div>
          }
        >
          <KosCatalogContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
