'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { kosService } from '../services/kosService';

/**
 * Custom Hook for Kos Catalog with Multi-Criteria Filtering
 * and Two-Way URL Query Parameters Synchronization.
 *
 * Backend Supported Filters:
 * - hargaMin: number
 * - hargaMax: number
 * - lokasi: string regex
 * - tipe: string regex ('Putra' | 'Putri' | 'Campur')
 * - fasilitas: string regex
 * - tersedia: 'true' (jumlahKamarTersedia > 0)
 */
export function useKosList(initialFilters = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Read initial filter values from URL search params if present, otherwise fallback to defaults
  const getInitialValue = (key, fallback = '') => {
    if (searchParams && searchParams.has(key)) {
      return searchParams.get(key);
    }
    return initialFilters[key] !== undefined ? initialFilters[key] : fallback;
  };

  const [filters, setFilters] = useState({
    tipe: getInitialValue('tipe', 'all'),
    lokasi: getInitialValue('lokasi', ''),
    hargaMin: getInitialValue('hargaMin', ''),
    hargaMax: getInitialValue('hargaMax', ''),
    fasilitas: getInitialValue('fasilitas', ''),
    tersedia: getInitialValue('tersedia', ''),
  });

  const [kosList, setKosList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state if URL search parameters change externally (e.g. browser back/forward)
  useEffect(() => {
    if (!searchParams) return;

    const urlTipe = searchParams.get('tipe') || 'all';
    const urlLokasi = searchParams.get('lokasi') || '';
    const urlHargaMin = searchParams.get('hargaMin') || '';
    const urlHargaMax = searchParams.get('hargaMax') || '';
    const urlFasilitas = searchParams.get('fasilitas') || '';
    const urlTersedia = searchParams.get('tersedia') || '';

    queueMicrotask(() => {
      setFilters((prev) => {
        if (
          prev.tipe === urlTipe &&
          prev.lokasi === urlLokasi &&
          prev.hargaMin === urlHargaMin &&
          prev.hargaMax === urlHargaMax &&
          prev.fasilitas === urlFasilitas &&
          prev.tersedia === urlTersedia
        ) {
          return prev;
        }
        return {
          tipe: urlTipe,
          lokasi: urlLokasi,
          hargaMin: urlHargaMin,
          hargaMax: urlHargaMax,
          fasilitas: urlFasilitas,
          tersedia: urlTersedia,
        };
      });
    });
  }, [searchParams]);

  // Fetch kos based on active filter state
  useEffect(() => {
    let ignore = false;

    const executeFetch = async () => {
      try {
        const params = {};
        if (filters.tipe && filters.tipe !== 'all') params.tipe = filters.tipe;
        if (filters.lokasi && filters.lokasi.trim() !== '') params.lokasi = filters.lokasi.trim();
        if (filters.hargaMin && Number(filters.hargaMin) > 0) params.hargaMin = Number(filters.hargaMin);
        if (filters.hargaMax && Number(filters.hargaMax) > 0) params.hargaMax = Number(filters.hargaMax);
        if (filters.fasilitas && filters.fasilitas.trim() !== '') params.fasilitas = filters.fasilitas.trim();
        if (filters.tersedia === 'true' || filters.tersedia === true) params.tersedia = 'true';

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
  }, [filters]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.tipe && filters.tipe !== 'all') params.tipe = filters.tipe;
      if (filters.lokasi && filters.lokasi.trim() !== '') params.lokasi = filters.lokasi.trim();
      if (filters.hargaMin && Number(filters.hargaMin) > 0) params.hargaMin = Number(filters.hargaMin);
      if (filters.hargaMax && Number(filters.hargaMax) > 0) params.hargaMax = Number(filters.hargaMax);
      if (filters.fasilitas && filters.fasilitas.trim() !== '') params.fasilitas = filters.fasilitas.trim();
      if (filters.tersedia === 'true' || filters.tersedia === true) params.tersedia = 'true';

      const result = await kosService.getKosList(params);
      setKosList(result.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat daftar kos.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Helper to synchronize local filters to URL query params
  const syncToUrl = (newFilters) => {
    if (!router || !pathname) return;

    const params = new URLSearchParams();
    if (newFilters.tipe && newFilters.tipe !== 'all') params.set('tipe', newFilters.tipe);
    if (newFilters.lokasi && newFilters.lokasi.trim() !== '') params.set('lokasi', newFilters.lokasi.trim());
    if (newFilters.hargaMin && Number(newFilters.hargaMin) > 0) params.set('hargaMin', newFilters.hargaMin);
    if (newFilters.hargaMax && Number(newFilters.hargaMax) > 0) params.set('hargaMax', newFilters.hargaMax);
    if (newFilters.fasilitas && newFilters.fasilitas.trim() !== '') params.set('fasilitas', newFilters.fasilitas.trim());
    if (newFilters.tersedia === 'true' || newFilters.tersedia === true) params.set('tersedia', 'true');

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.replace(targetUrl, { scroll: false });
    });
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => {
      const updated = {
        ...prev,
        [key]: value,
      };
      syncToUrl(updated);
      return updated;
    });
  };

  const resetFilters = () => {
    const emptyFilters = {
      tipe: 'all',
      lokasi: '',
      hargaMin: '',
      hargaMax: '',
      fasilitas: '',
      tersedia: '',
    };
    setFilters(emptyFilters);
    syncToUrl(emptyFilters);
  };

  return {
    kosList,
    isLoading,
    error,
    filters,
    updateFilter,
    resetFilters,
    refetch,
  };
}
