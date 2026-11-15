'use client';

import { useState } from 'react';
import CampusPickerPanel from './CampusPickerPanel';

const FACILITY_OPTIONS = [
  'WiFi Cepat',
  'AC',
  'Kamar Mandi Dalam',
  'Kasur',
  'Lemari Pakaian',
  'Parkir Motor',
  'Dapur Bersama',
  'CCTV 24 Jam',
];

export default function KosFilterSidebar({
  filters,
  updateFilter,
  resetFilters,
  locationMode = 'all',
  campuses = [],
  popularPresets = [],
  selectedCampusId = 'all',
  radiusKm = 5,
  isLocating = false,
  onSelectCampus,
  onAddCampus,
  onRemoveCampus,
  onRadiusChange,
  onDetectGps,
  className = '',
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleTypeSelect = (selectedType) => {
    updateFilter('tipe', selectedType, true);
  };

  const handleFacilityToggle = (facilityName) => {
    if (filters.fasilitas === facilityName) {
      updateFilter('fasilitas', '', true);
    } else {
      updateFilter('fasilitas', facilityName, true);
    }
  };

  const handleAvailableToggle = (e) => {
    updateFilter('tersedia', e.target.checked ? 'true' : '', true);
  };

  return (
    <aside
      className={`rounded-xl bg-[#FFFFFF] p-5 flex flex-col gap-5 text-[#0F172A] ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[#0F172A]">
          Filter & Lokasi
        </h2>
        <button
          type="button"
          onClick={resetFilters}
          className="text-[13px] font-medium text-[#475569] hover:text-[var(--accent)] transition-colors cursor-pointer"
        >
          Reset Semua
        </button>
      </div>

      {/* 1. Kampus Acuan, GPS & Radius */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-[#475569]">
            Radius Kampus / GPS
          </span>
          <button
            type="button"
            onClick={() => setPickerOpen((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#EFF6FF] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={pickerOpen ? 'M6 18L18 6M6 6l12 12' : 'M12 4.5v15m7.5-7.5h-15'}
              />
            </svg>
            {pickerOpen ? 'Tutup' : 'Tambah Kampus'}
          </button>
        </div>

        {pickerOpen && (
          <CampusPickerPanel
            campuses={campuses}
            popularPresets={popularPresets}
            onSelectNewCampus={onAddCampus}
            onClose={() => setPickerOpen(false)}
          />
        )}

        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => onSelectCampus && onSelectCampus('all')}
            className={`w-full px-3 py-2 rounded-lg text-left text-xs font-semibold transition-colors cursor-pointer ${
              locationMode === 'all'
                ? 'bg-[#EFF6FF] text-[var(--accent)] ring-1 ring-[var(--accent)]'
                : 'bg-[#F5F7FA] text-[#475569] hover:bg-[#EFF6FF]/60 hover:text-[#0F172A]'
            }`}
          >
            Semua Lokasi (Tanpa Batas Radius)
          </button>

          {campuses.map((campus) => {
            const isSelected =
              locationMode === 'preset' && selectedCampusId === campus.id;
            const isDefaultCampus = Boolean(
              campus.isDefault || campus.id === 'UGM'
            );

            return (
              <div key={campus.id} className="flex items-stretch gap-1.5">
                <button
                  type="button"
                  onClick={() => onSelectCampus && onSelectCampus(campus.id)}
                  className={`flex-1 min-w-0 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#EFF6FF] text-[var(--accent)] ring-1 ring-[var(--accent)]'
                      : 'bg-[#F5F7FA] text-[#0F172A] hover:bg-[#EFF6FF]/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold truncate">
                      {campus.shortName || campus.nama}
                    </span>
                    {isDefaultCampus ? (
                      <span className="text-[10px] font-medium text-[#64748B] shrink-0">
                        Default
                      </span>
                    ) : (
                      campus.source === 'nominatim' && (
                        <span className="text-[10px] font-medium text-[#64748B] shrink-0">
                          Custom
                        </span>
                      )
                    )}
                  </div>
                  <div className="text-[11px] text-[#475569] truncate mt-0.5">
                    {campus.kota || campus.nama}
                  </div>
                </button>

                {!isDefaultCampus && onRemoveCampus && (
                  <button
                    type="button"
                    onClick={() => onRemoveCampus(campus.id)}
                    aria-label={`Hapus ${campus.shortName || campus.nama}`}
                    title={`Hapus ${campus.shortName || campus.nama}`}
                    className="px-2.5 rounded-lg bg-[#F5F7FA] text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#991B1B] transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={onDetectGps}
            disabled={isLocating}
            className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60 ${
              locationMode === 'gps'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[#F5F7FA] text-[#0F172A] hover:bg-[#EFF6FF] hover:text-[var(--accent)]'
            }`}
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M12 2a1 1 0 011 1v2.07A7.002 7.002 0 0118.93 11H21a1 1 0 110 2h-2.07A7.002 7.002 0 0113 18.93V21a1 1 0 11-2 0v-2.07A7.002 7.002 0 015.07 13H3a1 1 0 110-2h2.07A7.002 7.002 0 0111 5.07V3a1 1 0 011-1zm0 6a4 4 0 100 8 4 4 0 000-8z"
              />
            </svg>
            {isLocating ? 'Mendeteksi GPS...' : 'Gunakan GPS Perangkat'}
          </button>
        </div>

        {locationMode !== 'all' && (
          <div className="pt-1 flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="catalog-radius-slider"
                className="text-xs font-medium text-[#475569]"
              >
                Radius Maksimal
              </label>
              <span className="text-xs font-semibold text-[var(--accent)] tabular-nums">
                {radiusKm} km
              </span>
            </div>
            <input
              id="catalog-radius-slider"
              type="range"
              min={1}
              max={10}
              step={1}
              value={radiusKm}
              onChange={(e) => onRadiusChange && onRadiusChange(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-[#F5F7FA] accent-[var(--accent)]"
            />
            <div className="flex justify-between text-[11px] font-medium text-[#64748B] tabular-nums">
              <span>1 km</span>
              <span>5 km</span>
              <span>10 km</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Kata Kunci Area / Jalan */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="filter-lokasi"
          className="text-[13px] font-medium text-[#475569]"
        >
          Nama Area atau Jalan
        </label>
        <div className="relative">
          <input
            id="filter-lokasi"
            type="text"
            placeholder="Pogung, Seturan, Sleman"
            value={filters.lokasi || ''}
            onChange={(e) => updateFilter('lokasi', e.target.value)}
            className="w-full px-3 py-2 pr-8 rounded-lg bg-[#F5F7FA] border border-[#CBD5E1] text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          {filters.lokasi && (
            <button
              type="button"
              onClick={() => updateFilter('lokasi', '', true)}
              aria-label="Hapus pencarian lokasi"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
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
          )}
        </div>
      </div>

      {/* 3. Tipe Kos */}
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-[#475569]">Tipe Kos</span>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'all', label: 'Semua Tipe' },
            { id: 'Putra', label: 'Putra' },
            { id: 'Putri', label: 'Putri' },
            { id: 'Campur', label: 'Campur' },
          ].map((item) => {
            const isActive =
              filters.tipe === item.id || (!filters.tipe && item.id === 'all');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTypeSelect(item.id)}
                className={`px-3 py-2 rounded-lg text-[13px] font-medium transition-colors text-center cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent)] text-white font-semibold'
                    : 'bg-[#F5F7FA] text-[#475569] hover:bg-[#EEF2F7] hover:text-[#0F172A]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Rentang Harga Bulanan */}
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-[#475569]">
          Rentang Harga Sewa (Rp/bulan)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="harga-min" className="sr-only">
              Harga Minimum
            </label>
            <input
              id="harga-min"
              type="number"
              min="0"
              placeholder="Min (Rp)"
              value={filters.hargaMin || ''}
              onChange={(e) => updateFilter('hargaMin', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#F5F7FA] border border-[#CBD5E1] text-[13px] text-[#0F172A] tabular-nums placeholder-[#64748B] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
          <div>
            <label htmlFor="harga-max" className="sr-only">
              Harga Maksimum
            </label>
            <input
              id="harga-max"
              type="number"
              min="0"
              placeholder="Maks (Rp)"
              value={filters.hargaMax || ''}
              onChange={(e) => updateFilter('hargaMax', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#F5F7FA] border border-[#CBD5E1] text-[13px] text-[#0F172A] tabular-nums placeholder-[#64748B] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 5. Ketersediaan Kamar Langsung */}
      <label className="flex items-center justify-between p-3 rounded-lg bg-[#F5F7FA] cursor-pointer">
        <div className="flex flex-col pr-2">
          <span className="text-[13px] font-medium text-[#0F172A]">
            Hanya Kamar Tersedia
          </span>
          <span className="text-[13px] text-[#475569]">
            Sembunyikan kos dengan kuota penuh
          </span>
        </div>
        <input
          type="checkbox"
          checked={filters.tersedia === 'true'}
          onChange={handleAvailableToggle}
          className="w-4 h-4 rounded border-[#CBD5E1] bg-white text-[var(--accent)] focus:ring-[var(--accent)] accent-[var(--accent)] cursor-pointer shrink-0"
        />
      </label>

      {/* 6. Fasilitas Pilihan */}
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-[#475569]">
          Fasilitas Unggulan
        </span>
        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
          {FACILITY_OPTIONS.map((facility) => {
            const isChecked = filters.fasilitas === facility;
            return (
              <label
                key={facility}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F5F7FA] cursor-pointer text-[13px] text-[#334155]"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleFacilityToggle(facility)}
                  className="w-3.5 h-3.5 rounded border-[#CBD5E1] bg-white text-[var(--accent)] focus:ring-[var(--accent)] accent-[var(--accent)]"
                />
                <span className={isChecked ? 'text-[var(--accent)] font-medium' : ''}>
                  {facility}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
