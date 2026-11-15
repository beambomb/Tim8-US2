"use client";

import { useState, useEffect, useCallback } from "react";
import { adminService } from "../services/adminService";

function getErrorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}

export function useAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      try {
        const result = await adminService.getStats();
        if (!ignore) {
          setData(result.data ?? null);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(getErrorMessage(err, "Gagal memuat statistik dashboard."));
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
      const result = await adminService.getStats();
      setData(result.data ?? null);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat statistik dashboard."));
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
