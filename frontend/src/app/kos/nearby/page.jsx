'use client';

import { Suspense, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RefreshButton from '@/components/ui/RefreshButton';
import { useAuth } from '@/context/AuthContext';
import { useNearbyKos } from '@/features/kos/hooks/useNearbyKos';
import { useFavorites } from '@/features/kos/hooks/useFavorites';
import CampusPresetSelector from '@/features/kos/components/CampusPresetSelector';
import KosCardReal from '@/features/kos/components/KosCardReal';
import KosCatalogSkeleton from '@/features/kos/components/KosCatalogSkeleton';

const SORT_OPTIONS = [
  { value: 'nearest', label: 'Urutkan: Terdekat' },
  { value: 'price-asc', label: 'Urutkan: Harga Termurah' },
  { value: 'price-desc', label: 'Urutkan: Harga Tertinggi' },
  { value: 'rooms-desc', label: 'Urutkan: Kamar Tersedia' },
];

const SORT_SUMMARY = {
  nearest: 'Diurutkan dari terdekat',
  'price-asc': 'Diurutkan dari termurah',
  'price-desc': 'Diurutkan dari termahal',
  'rooms-desc': 'Diurutkan kamar terbanyak',
};

function KosNearbyContent() {
  const { user, isAuthenticated } = useAuth();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const {
    kosList,
    total,
    isLoading,
    isLocating,
    error,
    coords,
    radiusKm,
    sortBy,
    setSortBy,
    tipeFilter,
    setTipeFilter,
    selectedPreset,
    locationSource,
    campuses,
    popularPresets,
    setRadiusKm,
    selectCampusPreset,
    addCampus,
    removeCampus,
    detectLocation,
    refetch,
  } = useNearbyKos();
  const { favorites, isKosFavorited, handleToggleFavorite } = useFavorites();

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-8 flex flex-col gap-6">
      {/* Page Title & Mobile Filter Toggle */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Pencarian Kos Terdekat Kampus
        </h1>

        <button
          type="button"
          onClick={() => setMobileFilterOpen((prev) => !prev)}
          className="lg:hidden px-3.5 py-2 rounded-lg bg-[#FFFFFF] border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] flex items-center gap-1.5 cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
          </svg>
          {mobileFilterOpen ? 'Tutup Panel Lokasi' : 'Atur Kampus & Radius'}
        </button>
      </div>

      {/* Main Split Grid: Left Kampus Sidebar + Right Results Above the Fold */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div
          className={`lg:col-span-1 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}
        >
          <CampusPresetSelector
            campuses={campuses}
            popularPresets={popularPresets}
            selectedPreset={selectedPreset}
            locationSource={locationSource}
            radiusKm={radiusKm}
            isLocating={isLocating}
            tipeFilter={tipeFilter}
            onSelectPreset={selectCampusPreset}
            onAddCampus={addCampus}
            onRemoveCampus={removeCampus}
            onRadiusChange={setRadiusKm}
            onDetectGps={detectLocation}
            onTipeChange={setTipeFilter}
          />
        </div>

        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Concise Single-Line Results Header + Sort Comparison Control */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#FFFFFF] text-sm text-[#475569]">
            <p className="leading-snug">
              <strong className="text-[#0F172A] tabular-nums font-semibold">
                {isLoading ? '...' : total}
              </strong>{' '}
              kos dalam radius{' '}
              <strong className="text-[var(--accent)] tabular-nums font-semibold">
                {radiusKm} km
              </strong>{' '}
              dari{' '}
              <span className="text-[#0F172A] font-medium">
                {coords.label}
              </span>{' '}
              · <span>{SORT_SUMMARY[sortBy] || SORT_SUMMARY.nearest}</span>
            </p>

            <div className="flex items-center gap-2 shrink-0">
              <select
                aria-label="Urutkan hasil kos terdekat"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#F5F7FA] border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <RefreshButton
                onClick={refetch}
                isLoading={isLoading}
                label="Muat ulang kos terdekat"
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

          {/* Content Grid or Skeleton */}
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
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-[#0F172A]">
                Tidak Ada Kos dalam Radius {radiusKm} km
              </h2>
              <p className="text-base text-[#475569] max-w-sm">
                Belum ada kos yang cocok di sekitar titik lokasi ini. Coba reset filter tipe kos, perlebar radius hingga 10 km, atau pilih kampus lainnya.
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                {tipeFilter && (
                  <button
                    type="button"
                    onClick={() => setTipeFilter('')}
                    className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#F5F7FA] text-[#0F172A] hover:bg-[#EEF2F7] transition-colors cursor-pointer"
                  >
                    Tampilkan Semua Tipe
                  </button>
                )}
                {radiusKm < 10 && (
                  <button
                    type="button"
                    onClick={() => setRadiusKm(10)}
                    className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#EFF6FF] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors cursor-pointer"
                  >
                    Perlebar ke Radius 10 km
                  </button>
                )}
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

export default function KosNearbyPage() {
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
          <KosNearbyContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
