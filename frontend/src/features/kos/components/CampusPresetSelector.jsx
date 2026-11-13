'use client';

export default function CampusPresetSelector({
  presets,
  selectedPreset,
  selectCampusPreset,
  coords,
  radiusKm,
  setRadiusKm,
  detectLocation,
  isLocating,
  locationSource,
}) {
  return (
    <div className="rounded-xl bg-[#141D30] border border-slate-800 p-5 flex flex-col gap-5 text-[#F1F5F9]">
      {/* Header & Geolocation Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-[#F1F5F9]">
            Pilih Titik Acuan Lokasi
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Pilih kampus acuan atau gunakan titik GPS browser Anda
          </p>
        </div>

        <button
          type="button"
          onClick={detectLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-[#10B981] hover:text-[#0A0F1D] border border-emerald-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLocating ? (
            <svg
              className="animate-spin h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          ) : (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.071 7.071l-1.414-1.414M7.343 7.343L5.929 5.929m12.142 0l-1.414 1.414M7.343 16.657l-1.414 1.414"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
          <span>{isLocating ? 'Mendeteksi GPS...' : 'Gunakan GPS Perangkat'}</span>
        </button>
      </div>

      {/* Preset Campus Options */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-[#94A3B8]">
          Preset Kampus Populer
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.entries(presets).map(([key, item]) => {
            const isSelected = selectedPreset === key && locationSource === 'preset';
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectCampusPreset(key)}
                className={`px-3 py-2.5 rounded-lg text-left transition-all border ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-[#0A0F1D] text-[#94A3B8] border-slate-800 hover:border-slate-700 hover:text-[#F1F5F9]'
                }`}
              >
                <div className="text-xs font-semibold">{key}</div>
                <div className="text-[11px] text-[#64748B] truncate mt-0.5">
                  {item.kota}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Coordinate Center Display */}
      <div className="p-3 rounded-lg bg-[#0A0F1D] border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-slate-300">
            Pusat Radius: <strong className="text-[#F1F5F9] font-medium">{coords.label}</strong>
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">
          Lat: {coords.latitude}, Lng: {coords.longitude}
        </span>
      </div>

      {/* Radius Slider */}
      <div className="flex flex-col gap-2 pt-2">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="radius-slider" className="font-medium text-[#94A3B8]">
            Radius Pencarian
          </label>
          <span className="font-semibold text-emerald-400">
            {radiusKm} km ({radiusKm * 1000} meter)
          </span>
        </div>

        <input
          id="radius-slider"
          type="range"
          min="1"
          max="10"
          step="1"
          value={radiusKm}
          onChange={(e) => setRadiusKm(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />

        <div className="flex justify-between text-[11px] text-[#64748B] font-mono">
          <span>1 km</span>
          <span>3 km</span>
          <span>5 km</span>
          <span>7 km</span>
          <span>10 km</span>
        </div>
      </div>
    </div>
  );
}
