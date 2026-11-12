'use client';

import { useState, useEffect, useCallback } from 'react';
import { kosService } from '../services/kosService';

export function useKosList(initialFilters = {}) {
  const [kosList, setKosList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    tipe: initialFilters.tipe || 'all',
    search: initialFilters.search || '',
    minHarga: initialFilters.minHarga || '',
    maxHarga: initialFilters.maxHarga || '',
  });

  const fetchKos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.tipe && filters.tipe !== 'all') params.tipe = filters.tipe;
      if (filters.search) params.search = filters.search;
      if (filters.minHarga) params.minHarga = filters.minHarga;
      if (filters.maxHarga) params.maxHarga = filters.maxHarga;

      const result = await kosService.getKosList(params);
      setKosList(result.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat daftar kos.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchKos();
  }, [fetchKos]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      tipe: 'all',
      search: '',
      minHarga: '',
      maxHarga: '',
    });
  };

  return {
    kosList,
    isLoading,
    error,
    filters,
    updateFilter,
    resetFilters,
    refetch: fetchKos,
  };
}
