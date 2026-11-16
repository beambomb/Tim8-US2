"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { adminService } from "../services/adminService";

function getErrorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}

/**
 * Manage fetching, filtering, and inspecting all registered kos properties for admin.
 */
export function useAdminKos() {
  const [kosList, setKosList] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [tipeFilter, setTipeFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      try {
        const result = await adminService.getAllKos();
        if (!ignore) {
          setKosList(result.data || []);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(getErrorMessage(err, "Gagal memuat daftar seluruh kos."));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      ignore = true;
    };
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await adminService.getAllKos();
      setKosList(result.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat daftar seluruh kos."));
    } finally {
      setLoading(false);
    }
  }, []);

  const counts = useMemo(() => {
    return kosList.reduce(
      (acc, item) => {
        acc.ALL += 1;
        if (item.statusVerifikasi === "Approved") acc.Approved += 1;
        else if (item.statusVerifikasi === "Pending") acc.Pending += 1;
        else if (item.statusVerifikasi === "Rejected") acc.Rejected += 1;
        return acc;
      },
      { ALL: 0, Approved: 0, Pending: 0, Rejected: 0 }
    );
  }, [kosList]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return kosList.filter((item) => {
      if (statusFilter !== "ALL" && item.statusVerifikasi !== statusFilter) {
        return false;
      }
      if (tipeFilter !== "ALL" && item.tipe !== tipeFilter) {
        return false;
      }
      if (!normalizedQuery) return true;

      const haystack = `${item.nama || ""} ${item.lokasi || ""} ${
        item.ownerId?.nama || ""
      } ${item.ownerId?.email || ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [kosList, query, statusFilter, tipeFilter]);

  const openDetail = useCallback((kos) => {
    setSelected(kos || null);
  }, []);

  const closeDetail = useCallback(() => {
    setSelected(null);
  }, []);

  return {
    kosList,
    filtered,
    counts,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    tipeFilter,
    setTipeFilter,
    loading,
    error,
    selected,
    refetch,
    openDetail,
    closeDetail,
  };
}
