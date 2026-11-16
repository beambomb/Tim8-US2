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
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
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

  const deleteKos = useCallback(async (targetKos) => {
    if (!targetKos?._id) return { success: false };
    setDeletingId(targetKos._id);
    setError("");
    setActionMessage("");
    try {
      await adminService.deleteKos(targetKos._id);
      setKosList((old) => old.filter((item) => item._id !== targetKos._id));
      setSelected((prev) => (prev?._id === targetKos._id ? null : prev));
      setActionMessage(
        `Kos ${targetKos.nama} beserta booking, ulasan, favorit, notifikasi, dan foto terkait berhasil dihapus.`
      );
      return { success: true };
    } catch (err) {
      setError(getErrorMessage(err, "Gagal menghapus properti kos."));
      return { success: false };
    } finally {
      setDeletingId("");
    }
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
    deletingId,
    error,
    actionMessage,
    selected,
    refetch,
    openDetail,
    closeDetail,
    deleteKos,
  };
}
