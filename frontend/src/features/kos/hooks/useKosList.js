'use client';

import { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { kosService } from '../services/kosService';

const EMPTY_FILTERS = {
  tipe: 'all',
  lokasi: '',
  hargaMin: '',
  hargaMax: '',
  fasilitas: '',
  tersedia: '',
};

const DEBOUNCED_FIELDS = new Set(['lokasi', 'hargaMin', 'hargaMax']);

function buildKosParams(sourceFilters) {
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

  const getInitialValue = (key, fallback = '') => {
    if (searchParams && searchParams.has(key)) {
      return searchParams.get(key);
    }
    return initialFilters[key] !== undefined ? initialFilters[key] : fallback;
  };

  const initialFilterState = {
    tipe: getInitialValue('tipe', 'all'),
    lokasi: getInitialValue('lokasi', ''),
    hargaMin: getInitialValue('hargaMin', ''),
    hargaMax: getInitialValue('hargaMax', ''),
    fasilitas: getInitialValue('fasilitas', ''),
    tersedia: getInitialValue('tersedia', ''),
  };

  const [filters, setFilters] = useState(initialFilterState);
  const [queryFilters, setQueryFilters] = useState(initialFilterState);
  const [kosList, setKosList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const debounceTimerRef = useRef(null);
  const filtersRef = useRef(initialFilterState);
  const lastSyncedQueryRef = useRef(searchParams ? searchParams.toString() : '');

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Sync state if URL search parameters change externally (e.g. browser back/forward)
  useEffect(() => {
    if (!searchParams) return;

    const currentQuery = searchParams.toString();
    if (currentQuery === lastSyncedQueryRef.current) return;
    lastSyncedQueryRef.current = currentQuery;

    const nextFromUrl = {
      tipe: searchParams.get('tipe') || 'all',
      lokasi: searchParams.get('lokasi') || '',
      hargaMin: searchParams.get('hargaMin') || '',
      hargaMax: searchParams.get('hargaMax') || '',
      fasilitas: searchParams.get('fasilitas') || '',
      tersedia: searchParams.get('tersedia') || '',
    };

    queueMicrotask(() => {
      filtersRef.current = nextFromUrl;
      setFilters((prev) => (filtersEqual(prev, nextFromUrl) ? prev : nextFromUrl));
      setQueryFilters((prev) => (filtersEqual(prev, nextFromUrl) ? prev : nextFromUrl));
    });
  }, [searchParams]);

  // Fetch kos based on debounced active query filter state
  useEffect(() => {
    let ignore = false;

    const executeFetch = async () => {
      await Promise.resolve();
      if (ignore) return;
      setIsLoading(true);

      try {
        const params = buildKosParams(queryFilters);
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
  }, [queryFilters]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = buildKosParams(queryFilters);
      const result = await kosService.getKosList(params);
      setKosList(result.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat daftar kos.');
    } finally {
      setIsLoading(false);
    }
  }, [queryFilters]);

  // Helper to synchronize filters to URL query params
  const syncToUrl = useCallback(
    (newFilters) => {
      if (!router || !pathname) return;

      const params = new URLSearchParams();
      if (newFilters.tipe && newFilters.tipe !== 'all') params.set('tipe', newFilters.tipe);
      if (newFilters.lokasi && newFilters.lokasi.trim() !== '') params.set('lokasi', newFilters.lokasi.trim());
      if (newFilters.hargaMin && Number(newFilters.hargaMin) > 0) params.set('hargaMin', String(newFilters.hargaMin));
      if (newFilters.hargaMax && Number(newFilters.hargaMax) > 0) params.set('hargaMax', String(newFilters.hargaMax));
      if (newFilters.fasilitas && newFilters.fasilitas.trim() !== '') params.set('fasilitas', newFilters.fasilitas.trim());
      if (newFilters.tersedia === 'true' || newFilters.tersedia === true) params.set('tersedia', 'true');

      const queryString = params.toString();
      lastSyncedQueryRef.current = queryString;
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

      startTransition(() => {
        router.replace(targetUrl, { scroll: false });
      });
    },
    [pathname, router]
  );

  const updateFilter = useCallback(
    (key, value, immediate = false) => {
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
          setIsLoading(true);
          setQueryFilters(updated);
          syncToUrl(updated);
        }, 300);
      } else {
        setIsLoading(true);
        setQueryFilters(updated);
        syncToUrl(updated);
      }
    },
    [syncToUrl]
  );

  const resetFilters = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    filtersRef.current = EMPTY_FILTERS;
    setIsLoading(true);
    setFilters(EMPTY_FILTERS);
    setQueryFilters(EMPTY_FILTERS);
    syncToUrl(EMPTY_FILTERS);
  }, [syncToUrl]);

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
