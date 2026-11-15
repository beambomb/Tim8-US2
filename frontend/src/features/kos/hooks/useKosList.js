'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/features/auth/services/authService';
import { kosService } from '../services/kosService';
import {
  DEFAULT_CAMPUS,
  POPULAR_CAMPUS_PRESETS,
  mergeWithDefaultCampus,
  loadGuestCampuses,
  saveGuestCampuses,
} from '../utils/campusStorage';

const EMPTY_FILTERS = {
  tipe: 'all',
  lokasi: '',
  hargaMin: '',
  hargaMax: '',
  fasilitas: '',
  tersedia: '',
};

const DEBOUNCED_FIELDS = new Set(['lokasi', 'hargaMin', 'hargaMax']);

function getDistanceMeters(kos) {
  if (kos?.jarakMeter !== undefined && kos?.jarakMeter !== null) {
    return Number(kos.jarakMeter);
  }
  if (kos?.jarakKm !== undefined && kos?.jarakKm !== null) {
    return Number(kos.jarakKm) * 1000;
  }
  return Number.POSITIVE_INFINITY;
}

function buildApiParams(sourceFilters, locationState) {
  const params = {};
  if (sourceFilters.tipe && sourceFilters.tipe !== 'all') {
    params.tipe = sourceFilters.tipe;
  }
  if (sourceFilters.lokasi && sourceFilters.lokasi.trim() !== '') {
    params.lokasi = sourceFilters.lokasi.trim();
  }
  if (sourceFilters.hargaMin && Number(sourceFilters.hargaMin) > 0) {
    params.hargaMin = Number(sourceFilters.hargaMin);
  }
  if (sourceFilters.hargaMax && Number(sourceFilters.hargaMax) > 0) {
    params.hargaMax = Number(sourceFilters.hargaMax);
  }
  if (sourceFilters.fasilitas && sourceFilters.fasilitas.trim() !== '') {
    params.fasilitas = sourceFilters.fasilitas.trim();
  }
  if (sourceFilters.tersedia === 'true' || sourceFilters.tersedia === true) {
    params.tersedia = 'true';
  }

  if (
    locationState &&
    locationState.mode !== 'all' &&
    Number.isFinite(locationState.latitude) &&
    Number.isFinite(locationState.longitude)
  ) {
    params.lat = locationState.latitude;
    params.lng = locationState.longitude;
    params.radius = Math.round(Number(locationState.radiusKm || 5) * 1000);
  }

  return params;
}

function filtersEqual(a, b) {
  return (
    a.tipe === b.tipe &&
    a.lokasi === b.lokasi &&
    a.hargaMin === b.hargaMin &&
    a.hargaMax === b.hargaMax &&
    a.fasilitas === b.fasilitas &&
    a.tersedia === b.tersedia
  );
}

/**
 * Unified Kos Catalog & Geospatial Nearby Hook.
 * Combines multi-criteria filtering with campus pinning, Nominatim search, GPS radius, and sorting.
 */
export function useKosList(initialOptions = {}) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialCampusParam =
    searchParams?.get('campus') ||
    (searchParams?.get('mode') === 'nearby' ? DEFAULT_CAMPUS.id : '') ||
    initialOptions.campus ||
    '';
  const initialRadiusParam = Number(
    searchParams?.get('radius') || initialOptions.radiusKm || 5
  );
  const safeInitialRadius =
    Number.isFinite(initialRadiusParam) && initialRadiusParam >= 1 && initialRadiusParam <= 10
      ? initialRadiusParam
      : 5;

  const getInitialFilter = (key, fallback = '') => {
    if (searchParams && searchParams.has(key)) {
      return searchParams.get(key) || fallback;
    }
    return initialOptions[key] !== undefined ? initialOptions[key] : fallback;
  };

  const initialFilterState = {
    tipe: getInitialFilter('tipe', 'all'),
    lokasi: getInitialFilter('lokasi', ''),
    hargaMin: getInitialFilter('hargaMin', ''),
    hargaMax: getInitialFilter('hargaMax', ''),
    fasilitas: getInitialFilter('fasilitas', ''),
    tersedia: getInitialFilter('tersedia', ''),
  };

  const [filters, setFilters] = useState(initialFilterState);
  const [queryFilters, setQueryFilters] = useState(initialFilterState);

  const [campuses, setCampuses] = useState([DEFAULT_CAMPUS]);
  const [locationMode, setLocationMode] = useState(
    initialCampusParam ? 'preset' : 'all'
  );
  const [selectedCampusId, setSelectedCampusId] = useState(
    initialCampusParam || 'all'
  );
  const [gpsCoords, setGpsCoords] = useState(null);
  const [radiusKm, setRadiusKmState] = useState(safeInitialRadius);
  const [debouncedRadiusKm, setDebouncedRadiusKm] = useState(safeInitialRadius);

  const [sortBy, setSortBy] = useState(
    searchParams?.get('sort') || (initialCampusParam ? 'nearest' : 'recommended')
  );
  const [isLocating, setIsLocating] = useState(false);
  const [kosList, setKosList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const debounceTimerRef = useRef(null);
  const radiusDebounceRef = useRef(null);
  const filtersRef = useRef(initialFilterState);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (radiusDebounceRef.current) clearTimeout(radiusDebounceRef.current);
    };
  }, []);

  // Hydrate saved campuses from user profile or guest localStorage
  useEffect(() => {
    if (authLoading) return;
    queueMicrotask(() => {
      if (isAuthenticated && Array.isArray(user?.savedCampuses)) {
        setCampuses(mergeWithDefaultCampus(user.savedCampuses));
      } else {
        setCampuses(mergeWithDefaultCampus(loadGuestCampuses()));
      }
    });
  }, [authLoading, isAuthenticated, user?.savedCampuses]);

  // Keep state aligned when navigating via header/quick links on /kos
  const urlSearchString = searchParams ? searchParams.toString() : '';
  useEffect(() => {
    if (!searchParams) return;

    const nextFromUrl = {
      tipe: searchParams.get('tipe') || 'all',
      lokasi: searchParams.get('lokasi') || '',
      hargaMin: searchParams.get('hargaMin') || '',
      hargaMax: searchParams.get('hargaMax') || '',
      fasilitas: searchParams.get('fasilitas') || '',
      tersedia: searchParams.get('tersedia') || '',
    };

    const campusParam =
      searchParams.get('campus') ||
      (searchParams.get('mode') === 'nearby' ? DEFAULT_CAMPUS.id : '');

    queueMicrotask(() => {
      if (!filtersEqual(filtersRef.current, nextFromUrl)) {
        filtersRef.current = nextFromUrl;
        setFilters(nextFromUrl);
        setQueryFilters(nextFromUrl);
      }

      if (campusParam) {
        setLocationMode('preset');
        setSelectedCampusId(campusParam);
        setSortBy((prev) => (prev === 'recommended' ? 'nearest' : prev));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearchString]);

  const activeCampus = useMemo(() => {
    if (locationMode !== 'preset') return null;
    return (
      campuses.find((item) => item.id === selectedCampusId) ||
      POPULAR_CAMPUS_PRESETS.find((item) => item.id === selectedCampusId) ||
      DEFAULT_CAMPUS
    );
  }, [campuses, locationMode, selectedCampusId]);

  const activeLocationState = useMemo(() => {
    if (locationMode === 'gps' && gpsCoords) {
      return {
        mode: 'gps',
        latitude: gpsCoords.latitude,
        longitude: gpsCoords.longitude,
        label: 'Lokasi Anda',
        radiusKm: debouncedRadiusKm,
      };
    }

    if (locationMode === 'preset' && activeCampus) {
      return {
        mode: 'preset',
        latitude: Number(activeCampus.latitude),
        longitude: Number(activeCampus.longitude),
        label: activeCampus.shortName || activeCampus.nama,
        radiusKm: debouncedRadiusKm,
      };
    }

    return {
      mode: 'all',
      latitude: null,
      longitude: null,
      label: 'Semua Lokasi',
      radiusKm: debouncedRadiusKm,
    };
  }, [locationMode, gpsCoords, activeCampus, debouncedRadiusKm]);

  // Sync URL query params cleanly post-commit without calling startTransition during render
  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;

    const params = new URLSearchParams();
    if (queryFilters.tipe && queryFilters.tipe !== 'all') params.set('tipe', queryFilters.tipe);
    if (queryFilters.lokasi && queryFilters.lokasi.trim() !== '') params.set('lokasi', queryFilters.lokasi.trim());
    if (queryFilters.hargaMin && Number(queryFilters.hargaMin) > 0) params.set('hargaMin', String(queryFilters.hargaMin));
    if (queryFilters.hargaMax && Number(queryFilters.hargaMax) > 0) params.set('hargaMax', String(queryFilters.hargaMax));
    if (queryFilters.fasilitas && queryFilters.fasilitas.trim() !== '') params.set('fasilitas', queryFilters.fasilitas.trim());
    if (queryFilters.tersedia === 'true' || queryFilters.tersedia === true) params.set('tersedia', 'true');

    if (locationMode === 'preset' && selectedCampusId && selectedCampusId !== 'all') {
      params.set('campus', selectedCampusId);
      params.set('radius', String(debouncedRadiusKm));
    }
    if (sortBy && sortBy !== 'recommended') {
      params.set('sort', sortBy);
    }

    const nextQuery = params.toString();
    const targetUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    const currentUrl = window.location.pathname + window.location.search;

    if (targetUrl !== currentUrl) {
      window.history.replaceState(null, '', targetUrl);
    }
  }, [pathname, queryFilters, locationMode, selectedCampusId, debouncedRadiusKm, sortBy]);

  // Fetch kos list whenever active filters or active coordinates/radius change
  useEffect(() => {
    let ignore = false;

    const executeFetch = async () => {
      await Promise.resolve();
      if (ignore) return;
      setIsLoading(true);

      try {
        const params = buildApiParams(queryFilters, activeLocationState);
        const result = await kosService.getKosList(params);
        if (!ignore) {
          setKosList(result.data || []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || 'Gagal memuat daftar kos.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    executeFetch();
    return () => {
      ignore = true;
    };
  }, [queryFilters, activeLocationState]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = buildApiParams(queryFilters, activeLocationState);
      const result = await kosService.getKosList(params);
      setKosList(result.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat daftar kos.');
    } finally {
      setIsLoading(false);
    }
  }, [queryFilters, activeLocationState]);

  const updateFilter = useCallback((key, value, immediate = false) => {
    const updated = {
      ...filtersRef.current,
      [key]: value,
    };
    filtersRef.current = updated;
    setFilters(updated);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const shouldDebounce = DEBOUNCED_FIELDS.has(key) && !immediate;
    if (shouldDebounce) {
      debounceTimerRef.current = setTimeout(() => {
        setQueryFilters(updated);
      }, 300);
    } else {
      setQueryFilters(updated);
    }
  }, []);

  const clearLocationFilter = useCallback(() => {
    setLocationMode('all');
    setSelectedCampusId('all');
    setGpsCoords(null);
    setSortBy((prev) => (prev === 'nearest' ? 'recommended' : prev));
  }, []);

  const selectCampusPreset = useCallback((campusId) => {
    if (campusId === 'all') {
      clearLocationFilter();
      return;
    }
    setLocationMode('preset');
    setSelectedCampusId(campusId);
    setSortBy((prev) => (prev === 'recommended' ? 'nearest' : prev));
  }, [clearLocationFilter]);

  const addCampus = useCallback(
    async (campus) => {
      if (!campus?.id) return;

      const normalized = {
        id: String(campus.id),
        shortName: String(campus.shortName || campus.nama),
        nama: String(campus.nama || campus.shortName),
        kota: String(campus.kota || ''),
        latitude: Number(campus.latitude),
        longitude: Number(campus.longitude),
        source: campus.source || 'nominatim',
      };

      setCampuses((prev) => {
        const next = mergeWithDefaultCampus([...prev, normalized]);
        if (!isAuthenticated) {
          saveGuestCampuses(next);
        }
        return next;
      });

      setLocationMode('preset');
      setSelectedCampusId(normalized.id);
      setSortBy((prev) => (prev === 'recommended' ? 'nearest' : prev));

      if (isAuthenticated && normalized.id !== DEFAULT_CAMPUS.id) {
        try {
          const res = await authService.saveCampus(normalized);
          if (Array.isArray(res?.savedCampuses)) {
            setCampuses(mergeWithDefaultCampus(res.savedCampuses));
          }
        } catch {
          // Pilihan tetap aktif di sesi saat ini
        }
      }
    },
    [isAuthenticated]
  );

  const removeCampus = useCallback(
    async (campusId) => {
      if (!campusId || campusId === DEFAULT_CAMPUS.id) return;

      setCampuses((prev) => {
        const next = prev.filter((item) => item.id !== campusId);
        if (!isAuthenticated) {
          saveGuestCampuses(next);
        }
        return next;
      });

      if (selectedCampusId === campusId) {
        setLocationMode('preset');
        setSelectedCampusId(DEFAULT_CAMPUS.id);
      }

      if (isAuthenticated) {
        try {
          const res = await authService.removeCampus(campusId);
          if (Array.isArray(res?.savedCampuses)) {
            setCampuses(mergeWithDefaultCampus(res.savedCampuses));
          }
        } catch {
          // Abaikan error penghapusan server
        }
      }
    },
    [isAuthenticated, selectedCampusId]
  );

  const setRadiusKm = useCallback((nextRadius, immediate = false) => {
    const numericRadius = Number(nextRadius);
    setRadiusKmState(numericRadius);

    if (radiusDebounceRef.current) {
      clearTimeout(radiusDebounceRef.current);
    }

    if (immediate) {
      setDebouncedRadiusKm(numericRadius);
    } else {
      radiusDebounceRef.current = setTimeout(() => {
        setDebouncedRadiusKm(numericRadius);
      }, 300);
    }
  }, []);

  const detectLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Browser Anda tidak mendukung layanan geolokasi GPS.');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        setGpsCoords({
          latitude: Number(latitude.toFixed(6)),
          longitude: Number(longitude.toFixed(6)),
        });
        setLocationMode('gps');
        setSelectedCampusId('gps');
        setSortBy('nearest');
      },
      (geoError) => {
        setIsLocating(false);
        let msg = 'Gagal mendeteksi lokasi otomatis.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          msg = 'Izin akses lokasi ditolak oleh browser. Silakan pilih kampus dari daftar.';
        } else if (geoError.code === geoError.TIMEOUT) {
          msg = 'Waktu deteksi lokasi habis. Silakan coba lagi atau pilih kampus.';
        }
        setError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, []);

  const resetFilters = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (radiusDebounceRef.current) clearTimeout(radiusDebounceRef.current);
    filtersRef.current = EMPTY_FILTERS;
    setFilters(EMPTY_FILTERS);
    setQueryFilters(EMPTY_FILTERS);
    setLocationMode('all');
    setSelectedCampusId('all');
    setGpsCoords(null);
    setRadiusKmState(5);
    setDebouncedRadiusKm(5);
    setSortBy('recommended');
  }, []);

  const visibleKosList = useMemo(() => {
    const sorted = [...kosList];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => Number(a.harga || 0) - Number(b.harga || 0));
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => Number(b.harga || 0) - Number(a.harga || 0));
    } else if (sortBy === 'rooms-desc') {
      sorted.sort(
        (a, b) => Number(b.jumlahKamarTersedia || 0) - Number(a.jumlahKamarTersedia || 0)
      );
    } else if (sortBy === 'nearest' && activeLocationState.mode !== 'all') {
      sorted.sort((a, b) => getDistanceMeters(a) - getDistanceMeters(b));
    }
    return sorted;
  }, [kosList, sortBy, activeLocationState.mode]);

  return {
    kosList: visibleKosList,
    total: visibleKosList.length,
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
    activeLocation: activeLocationState,
    campuses,
    popularPresets: POPULAR_CAMPUS_PRESETS,
    selectedCampusId,
    radiusKm,
    setRadiusKm,
    selectCampusPreset,
    clearLocationFilter,
    addCampus,
    removeCampus,
    detectLocation,
  };
}
