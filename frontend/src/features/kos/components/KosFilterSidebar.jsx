'use client';

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
  className = '',
}) {
  const handleTypeSelect = (selectedType) => {
    updateFilter('tipe', selectedType);
  };

  const handleFacilityToggle = (facilityName) => {
    // If the facility is already selected, clear it; otherwise set it
    if (filters.fasilitas === facilityName) {
      updateFilter('fasilitas', '');
    } else {
      updateFilter('fasilitas', facilityName);
    }
  };

  const handleAvailableToggle = (e) => {
    updateFilter('tersedia', e.target.checked ? 'true' : '');
  };

  return (
    <aside
      className={`rounded-xl bg-[#141D30] border border-slate-800 p-5 flex flex-col gap-6 text-[#F1F5F9] ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-[#F1F5F9] tracking-wide uppercase">
          Filter Multikriteria
        </h2>
        <button
          type="button"
          onClick={resetFilters}
          className="text-xs font-medium text-[#94A3B8] hover:text-emerald-400 transition-colors"
        >
          Reset Semua
        </button>
      </div>

      {/* 1. Lokasi / Kata Kunci */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="filter-lokasi"
          className="text-xs font-medium text-[#94A3B8]"
        >
          Lokasi atau Nama Area
        </label>
        <div className="relative">
          <input
            id="filter-lokasi"
            type="text"
            placeholder="Contoh: Pogung, Kaliurang, Sleman..."
            value={filters.lokasi || ''}
            onChange={(e) => updateFilter('lokasi', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-slate-700 text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {filters.lokasi && (
            <button
              type="button"
              onClick={() => updateFilter('lokasi', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
            >
              x
            </button>
          )}
        </div>
      </div>

      {/* 2. Tipe Kos */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-[#94A3B8]">Tipe Kos</span>
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
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-center border ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-[#0A0F1D] text-[#94A3B8] border-slate-800 hover:border-slate-700 hover:text-[#F1F5F9]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Rentang Harga Bulanan */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-[#94A3B8]">
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
              placeholder="Min: 500000"
              value={filters.hargaMin || ''}
              onChange={(e) => updateFilter('hargaMin', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-slate-700 text-xs text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="harga-max" className="sr-only">
              Harga Maksimum
            </label>
            <input
              id="harga-max"
              type="number"
              placeholder="Maks: 2500000"
              value={filters.hargaMax || ''}
              onChange={(e) => updateFilter('hargaMax', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-slate-700 text-xs text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Ketersediaan Kamar Langsung */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-[#0A0F1D] border border-slate-800">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-[#F1F5F9]">
            Hanya Kamar Tersedia
          </span>
          <span className="text-[11px] text-[#64748B]">
            Sembunyikan kos dengan kuota penuh
          </span>
        </div>
        <input
          type="checkbox"
          checked={filters.tersedia === 'true'}
          onChange={handleAvailableToggle}
          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
        />
      </div>

      {/* 5. Fasilitas Pilihan */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-[#94A3B8]">
          Fasilitas Unggulan
        </span>
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
          {FACILITY_OPTIONS.map((facility) => {
            const isChecked = filters.fasilitas === facility;
            return (
              <label
                key={facility}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-800/40 cursor-pointer text-xs text-slate-300"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleFacilityToggle(facility)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-[#0A0F1D] text-emerald-500 focus:ring-emerald-500 accent-emerald-500"
                />
                <span className={isChecked ? 'text-emerald-300 font-medium' : ''}>
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
