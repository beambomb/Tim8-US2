'use client';

import { useState, useEffect, useCallback } from 'react';
import { kosService } from '../services/kosService';

export const CAMPUS_PRESETS = {
  UGM: {
    id: 'UGM',
    nama: 'UGM (Universitas Gadjah Mada)',
    kota: 'Sleman / Yogyakarta',
    latitude: -7.7713,
    longitude: 110.3775,
  },
  UNY: {
    id: 'UNY',
    nama: 'UNY (Universitas Negeri Yogyakarta)',
    kota: 'Yogyakarta',
    latitude: -7.7749,
    longitude: 110.3867,
  },
  UPN: {
    id: 'UPN',
    nama: 'UPN "Veteran" Yogyakarta',
    kota: 'Sleman',
    latitude: -7.7618,
    longitude: 110.4087,
  },
  UII: {
    id: 'UII',
    nama: 'UII Kampus Terpadu',
    kota: 'Kaliurang, Sleman',
    latitude: -7.6878,
    longitude: 110.4137,
  },
  ITB: {
    id: 'ITB',
    nama: 'ITB (Institut Teknologi Bandung)',
    kota: 'Bandung',
    latitude: -6.8915,
    longitude: 107.6107,
  },
  UI: {
    id: 'UI',
    nama: 'UI (Universitas Indonesia)',
    kota: 'Depok',
    latitude: -6.3653,
    longitude: 106.8286,
  },
};

/**
 * Custom Hook for Geospatial Nearby Kos Search
 * Interacts with GET /api/kos/nearby
 */
export function useNearbyKos() {
  const [selectedPreset, setSelectedPreset] = useState('UGM');
  const [coords, setCoords] = useState({
    latitude: CAMPUS_PRESETS.UGM.latitude,
    longitude: CAMPUS_PRESETS.UGM.longitude,
    label: CAMPUS_PRESETS.UGM.nama,
  });
  const [radiusKm, setRadiusKm] = useState(5);
  const [kosList, setKosList] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState(null);
  const [locationSource, setLocationSource] = useState('preset'); // 'preset' | 'gps'

  // Fetch nearby kos from API
  useEffect(() => {
    if (!coords.latitude || !coords.longitude) return;

    let ignore = false;
    const execute = async () => {
      try {
        const result = await kosService.getNearbyKos(
          coords.latitude,
          coords.longitude,
          radiusKm
        );
        if (!ignore) {
          setKosList(result.data || []);
          setTotal(result.total || (result.data ? result.data.length : 0));
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
  }, [coords.latitude, coords.longitude, radiusKm]);

  const refetch = useCallback(async () => {
    if (!coords.latitude || !coords.longitude) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await kosService.getNearbyKos(
        coords.latitude,
        coords.longitude,
        radiusKm
      );
      setKosList(result.data || []);
      setTotal(result.total || (result.data ? result.data.length : 0));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Gagal mengambil daftar kos terdekat di sekitar lokasi yang dipilih.'
      );
      setKosList([]);
    } finally {
      setIsLoading(false);
    }
  }, [coords.latitude, coords.longitude, radiusKm]);

  // Handler for university preset selection
  const selectCampusPreset = (presetKey) => {
    const preset = CAMPUS_PRESETS[presetKey];
    if (preset) {
      setSelectedPreset(presetKey);
      setLocationSource('preset');
      setCoords({
        latitude: preset.latitude,
        longitude: preset.longitude,
        label: preset.nama,
      });
    }
  };

  // Handler for browser GPS geolocation
  const detectLocation = () => {
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
        setSelectedPreset('custom');
        setLocationSource('gps');
        setCoords({
          latitude: Number(latitude.toFixed(6)),
          longitude: Number(longitude.toFixed(6)),
          label: 'Koordinat GPS Anda Saat Ini',
        });
      },
      (geoError) => {
        setIsLocating(false);
        let msg = 'Gagal mendeteksi lokasi otomatis.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          msg = 'Izin akses lokasi ditolak oleh browser. Silakan pilih kampus dari daftar preset.';
        } else if (geoError.code === geoError.TIMEOUT) {
          msg = 'Waktu deteksi lokasi habis. Silakan coba lagi atau gunakan preset kampus.';
        }
        setError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  return {
    kosList,
    total,
    isLoading,
    isLocating,
    error,
    coords,
    radiusKm,
    selectedPreset,
    locationSource,
    presets: CAMPUS_PRESETS,
    setRadiusKm,
    selectCampusPreset,
    detectLocation,
    refetch,
  };
}
