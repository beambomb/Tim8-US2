'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

export const CAMPUS_PRESETS = Object.fromEntries(
  POPULAR_CAMPUS_PRESETS.map((item) => [item.id, item])
);

function getDistanceMeters(kos) {
  if (kos?.jarakMeter !== undefined && kos?.jarakMeter !== null) {
    return Number(kos.jarakMeter);
  }
  if (kos?.jarakKm !== undefined && kos?.jarakKm !== null) {
    return Number(kos.jarakKm) * 1000;
  }
  return Number.POSITIVE_INFINITY;
}

/**
 * Custom Hook for Geospatial Nearby Kos Search
 * Starts with UGM by default, supports user-saved custom campuses & instant result comparison.
 */
export function useNearbyKos() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [campuses, setCampuses] = useState([DEFAULT_CAMPUS]);
  const [selectedPreset, setSelectedPreset] = useState(DEFAULT_CAMPUS.id);
  const [coords, setCoords] = useState({
    latitude: DEFAULT_CAMPUS.latitude,
    longitude: DEFAULT_CAMPUS.longitude,
    label: DEFAULT_CAMPUS.shortName,
    fullLabel: DEFAULT_CAMPUS.nama,
  });
  const [radiusKm, setRadiusKmState] = useState(5);
  const [debouncedRadiusKm, setDebouncedRadiusKm] = useState(5);
  const [sortBy, setSortBy] = useState('nearest');
  const [tipeFilter, setTipeFilter] = useState('all');
  const [kosList, setKosList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState(null);
  const [locationSource, setLocationSource] = useState('preset'); // 'preset' | 'gps'

  const radiusDebounceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (radiusDebounceRef.current) {
        clearTimeout(radiusDebounceRef.current);
      }
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

  // Update radius immediately for slider feedback, debounce query trigger by 300ms
  const setRadiusKm = useCallback((nextRadius, immediate = false) => {
    const numericRadius = Number(nextRadius);
    setRadiusKmState(numericRadius);

    if (radiusDebounceRef.current) {
      clearTimeout(radiusDebounceRef.current);
    }

    if (immediate) {
      setIsLoading(true);
      setDebouncedRadiusKm(numericRadius);
    } else {
      radiusDebounceRef.current = setTimeout(() => {
        setIsLoading(true);
        setDebouncedRadiusKm(numericRadius);
      }, 300);
    }
  }, []);

  // Fetch nearby kos from API whenever coordinates or debounced radius changes
  useEffect(() => {
    if (coords.latitude === undefined || coords.longitude === undefined) return;

    let ignore = false;
    const execute = async () => {
      await Promise.resolve();
      if (ignore) return;
      setIsLoading(true);

      try {
        const result = await kosService.getNearbyKos(
          coords.latitude,
          coords.longitude,
          debouncedRadiusKm
        );
        if (!ignore) {
          setKosList(result.data || []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
              'Gagal mengambil daftar kos terdekat di sekitar lokasi yang dipilih.'
          );
          setKosList([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    execute();
    return () => {
      ignore = true;
    };
  }, [coords.latitude, coords.longitude, debouncedRadiusKm]);

  const refetch = useCallback(async () => {
    if (coords.latitude === undefined || coords.longitude === undefined) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await kosService.getNearbyKos(
        coords.latitude,
        coords.longitude,
        debouncedRadiusKm
      );
      setKosList(result.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Gagal mengambil daftar kos terdekat di sekitar lokasi yang dipilih.'
      );
      setKosList([]);
    } finally {
      setIsLoading(false);
    }
  }, [coords.latitude, coords.longitude, debouncedRadiusKm]);

  const selectCampusPreset = useCallback(
    (campusId) => {
      const target =
        campuses.find((item) => item.id === campusId) || CAMPUS_PRESETS[campusId];
      if (!target) return;

      setIsLoading(true);
      setSelectedPreset(target.id);
      setLocationSource('preset');
      setCoords({
        latitude: Number(target.latitude),
        longitude: Number(target.longitude),
        label: target.shortName || target.nama,
        fullLabel: target.nama,
      });
    },
    [campuses]
  );

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

      setIsLoading(true);
      setSelectedPreset(normalized.id);
      setLocationSource('preset');
      setCoords({
        latitude: normalized.latitude,
        longitude: normalized.longitude,
        label: normalized.shortName,
        fullLabel: normalized.nama,
      });

      if (isAuthenticated && normalized.id !== DEFAULT_CAMPUS.id) {
        try {
          const res = await authService.saveCampus(normalized);
          if (Array.isArray(res?.savedCampuses)) {
            setCampuses(mergeWithDefaultCampus(res.savedCampuses));
          }
        } catch {
          // Abaikan error penyimpanan server; pilihan tetap aktif di sesi saat ini
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

      if (selectedPreset === campusId) {
        setIsLoading(true);
        setSelectedPreset(DEFAULT_CAMPUS.id);
        setLocationSource('preset');
        setCoords({
          latitude: DEFAULT_CAMPUS.latitude,
          longitude: DEFAULT_CAMPUS.longitude,
          label: DEFAULT_CAMPUS.shortName,
          fullLabel: DEFAULT_CAMPUS.nama,
        });
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
    [isAuthenticated, selectedPreset]
  );

  // Handler for browser GPS geolocation
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
        setIsLoading(true);
        const { latitude, longitude } = position.coords;
        setSelectedPreset('gps');
        setLocationSource('gps');
        setCoords({
          latitude: Number(latitude.toFixed(6)),
          longitude: Number(longitude.toFixed(6)),
          label: 'Lokasi Anda',
          fullLabel: 'Lokasi GPS Perangkat',
        });
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

  const visibleKosList = useMemo(() => {
    const filtered =
      tipeFilter === 'all'
        ? kosList
        : kosList.filter(
            (item) => (item.tipe || '').toLowerCase() === tipeFilter.toLowerCase()
          );

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortBy === 'price-asc') {
        return Number(a.harga || 0) - Number(b.harga || 0);
      }
      if (sortBy === 'price-desc') {
        return Number(b.harga || 0) - Number(a.harga || 0);
      }
      if (sortBy === 'rooms-desc') {
        return Number(b.jumlahKamarTersedia || 0) - Number(a.jumlahKamarTersedia || 0);
      }
      return getDistanceMeters(a) - getDistanceMeters(b);
    });

    return sorted;
  }, [kosList, sortBy, tipeFilter]);

  return {
    kosList: visibleKosList,
    rawTotal: kosList.length,
    total: visibleKosList.length,
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
    popularPresets: POPULAR_CAMPUS_PRESETS,
    setRadiusKm,
    selectCampusPreset,
    addCampus,
    removeCampus,
    detectLocation,
    refetch,
  };
}
