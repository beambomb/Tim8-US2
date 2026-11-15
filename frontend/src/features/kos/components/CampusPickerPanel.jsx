'use client';

import { useState, useEffect } from 'react';
import { kosService } from '../services/kosService';

export default function CampusPickerPanel({
  campuses,
  popularPresets,
  onSelectNewCampus,
  onClose,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const pinnedIds = new Set((campuses || []).map((item) => item.id));

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const res = await kosService.searchCampuses(trimmed);
        if (!cancelled) {
          setResults(Array.isArray(res?.data) ? res.data : []);
        }
      } catch {
        if (!cancelled) {
          setSearchError('Gagal mencari lokasi kampus. Coba kata kunci lain.');
        }
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const handleQueryChange = (e) => {
    const nextValue = e.target.value;
    setQuery(nextValue);
    if (nextValue.trim().length < 2) {
      setResults([]);
      setSearching(false);
      setSearchError(null);
    }
  };

  const unpinnedPresets = (popularPresets || []).filter(
    (preset) => !pinnedIds.has(preset.id)
  );

  const isSearchingQuery = query.trim().length >= 2;
  const displayList = isSearchingQuery ? results : unpinnedPresets;

  return (
    <div className="rounded-lg bg-[#F5F7FA] p-3 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor="campus-search-input"
          className="text-xs font-semibold text-[#0F172A]"
        >
          Tambah Kampus Acuan
        </label>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium text-[#475569] hover:text-[#0F172A] cursor-pointer"
        >
          Tutup
        </button>
      </div>

      <input
        id="campus-search-input"
        type="search"
        value={query}
        onChange={handleQueryChange}
        placeholder="Ketik nama kampus bebas..."
        className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:border-[var(--accent)] transition-colors"
      />

      {searching && (
        <p className="text-xs text-[#475569] py-1">Mencari lokasi kampus...</p>
      )}

      {searchError && (
        <p className="text-xs text-[#991B1B] py-1">{searchError}</p>
      )}

      {!searching && !searchError && (
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
          {query.trim().length < 2 && unpinnedPresets.length > 0 && (
            <span className="text-[11px] font-medium text-[#475569]">
              Kampus populer:
            </span>
          )}

          {displayList.length === 0 ? (
            <p className="text-xs text-[#475569] py-1">
              {query.trim().length >= 2
                ? 'Lokasi tidak ditemukan. Coba nama resmi kampus atau kota.'
                : 'Semua kampus populer sudah ditambahkan. Ketik untuk mencari kampus lain.'}
            </p>
          ) : (
            displayList.map((campus) => {
              const alreadyAdded = pinnedIds.has(campus.id);
              return (
                <button
                  key={campus.id}
                  type="button"
                  onClick={() => {
                    onSelectNewCampus(campus);
                    onClose();
                  }}
                  className="w-full px-2.5 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#EFF6FF] text-left transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#0F172A] truncate">
                      {campus.shortName || campus.nama}
                    </p>
                    <p className="text-[11px] text-[#475569] truncate">
                      {campus.nama !== campus.shortName
                        ? `${campus.nama} · ${campus.kota}`
                        : campus.kota}
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-[var(--accent)] shrink-0">
                    {alreadyAdded ? 'Pilih' : '+ Tambah'}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
