'use client';

import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNearbyKos } from '@/features/kos/hooks/useNearbyKos';
import CampusPresetSelector from '@/features/kos/components/CampusPresetSelector';
import KosCardReal from '@/features/kos/components/KosCardReal';
import KosCatalogSkeleton from '@/features/kos/components/KosCatalogSkeleton';

function KosNearbyContent() {
  const {
    kosList,
    total,
    isLoading,
    isLocating,
    error,
    coords,
    radiusKm,
    selectedPreset,
    locationSource,
    presets,
    setRadiusKm,
    selectCampusPreset,
    detectLocation,
    refetch,
  } = useNearbyKos();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Page Title & Heading */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F1F5F9] tracking-tight">
          Pencarian Kos Terdekat Kampus
        </h1>
        <p className="mt-1.5 text-sm text-[#94A3B8]">
          Hitung jarak akurat dengan formula Haversine dari kampus atau koordinat GPS perangkat Anda.
        </p>
      </div>

      {/* Preset & Geolocation Selector Panel */}
      <CampusPresetSelector
        presets={presets}
        selectedPreset={selectedPreset}
        selectCampusPreset={selectCampusPreset}
        coords={coords}
        radiusKm={radiusKm}
        setRadiusKm={setRadiusKm}
        detectLocation={detectLocation}
        isLocating={isLocating}
        locationSource={locationSource}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-[#94A3B8]">
        <div>
          Ditemukan{' '}
          <strong className="text-[#F1F5F9] font-mono tabular-nums">
            {isLoading ? '...' : total}
          </strong>{' '}
          kos dalam radius{' '}
          <strong className="text-emerald-400 font-mono">{radiusKm} km</strong> dari{' '}
          <span className="text-[#F1F5F9] font-medium">{coords.label}</span>
        </div>

        <button
          type="button"
          onClick={refetch}
          className="text-slate-400 hover:text-emerald-400 transition-colors"
        >
          Muat Ulang
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Content Grid or Skeleton */}
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
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-[#F1F5F9]">
            Tidak Ada Kos dalam Radius {radiusKm} km
          </h3>
          <p className="text-xs text-[#94A3B8] max-w-sm">
            Belum ada kos terverifikasi di sekitar radius ini. Coba perlebar slider radius hingga 10 km atau pilih kampus lainnya.
          </p>
          <button
            type="button"
            onClick={() => setRadiusKm(10)}
            className="mt-2 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-[#10B981] hover:text-[#0A0F1D] border border-emerald-500/30 transition-colors"
          >
            Perlebar ke Radius 10 km
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {kosList.map((kos) => (
            <KosCardReal key={kos._id} kos={kos} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function KosNearbyPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1D] text-[#F1F5F9] flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <Suspense fallback={<KosCatalogSkeleton count={6} />}>
          <KosNearbyContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
