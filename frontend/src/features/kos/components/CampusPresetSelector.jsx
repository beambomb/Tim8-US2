'use client';

import { useState } from 'react';
import CampusPickerPanel from './CampusPickerPanel';

const TIPE_KOS_OPTIONS = [
  { label: 'Semua Tipe', value: 'all' },
  { label: 'Putra', value: 'Putra' },
  { label: 'Putri', value: 'Putri' },
  { label: 'Campur', value: 'Campur' },
];

export default function CampusPresetSelector({
  campuses,
  popularPresets,
  selectedPreset,
  locationSource,
  radiusKm,
  isLocating,
  tipeFilter,
  onSelectPreset,
  onAddCampus,
  onRemoveCampus,
  onRadiusChange,
  onDetectGps,
  onTipeChange,
  className = '',
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <aside
      className={`rounded-xl bg-[#FFFFFF] p-5 flex flex-col gap-5 text-[#0F172A] ${className}`}
    >
      {/* Titik Lokasi Kampus + Tombol Tambah Kampus */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#0F172A]">
            Titik Lokasi Kampus
          </h2>
          <button
            type="button"
            onClick={() => setPickerOpen((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#EFF6FF] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors cursor-pointer"
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

        {/* Daftar Kampus Tersemat (Default: UGM) */}
        <div className="flex flex-col gap-2">
          {(campuses || []).map((campus) => {
            const isSelected =
              locationSource === 'preset' && selectedPreset === campus.id;
            const isDefaultCampus = Boolean(campus.isDefault || campus.id === 'UGM');
            return (
              <div key={campus.id} className="flex items-stretch gap-1.5">
                <button
                  type="button"
                  onClick={() => onSelectPreset(campus.id)}
                  className={`flex-1 min-w-0 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
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
        </div>

        <button
          type="button"
          onClick={onDetectGps}
          disabled={isLocating}
          className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60 ${
            locationSource === 'gps'
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

      {/* Radius Pencarian */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="nearby-radius-slider"
            className="text-sm font-semibold text-[#0F172A]"
          >
            Radius Pencarian
          </label>
          <span className="text-xs font-semibold text-[var(--accent)] tabular-nums">
            {radiusKm} km
          </span>
        </div>

        <input
          id="nearby-radius-slider"
          type="range"
          min={1}
          max={10}
          step={1}
          value={radiusKm}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-[#F5F7FA] accent-[var(--accent)]"
        />

        <div className="flex justify-between text-[11px] font-medium text-[#64748B] tabular-nums">
          <span>1 km</span>
          <span>5 km</span>
          <span>10 km</span>
        </div>
      </div>

      {/* Filter Cepat Tipe Kos */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-[#0F172A]">
          Tipe Kos
        </span>
        <div className="grid grid-cols-2 gap-2">
          {TIPE_KOS_OPTIONS.map((opt) => {
            const isActive = (tipeFilter || '') === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => onTipeChange(opt.value)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[#F5F7FA] text-[#475569] hover:text-[#0F172A] hover:bg-[#EFF6FF]/60'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
