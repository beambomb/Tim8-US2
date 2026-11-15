"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { adminService } from "../services/adminService";

function getErrorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}

export function useAdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const detailRequestRef = useRef(0);

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      try {
        const result = await adminService.getSubmissions();
        if (!ignore) {
          setSubmissions(result.data || []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            getErrorMessage(err, "Gagal memuat antrean verifikasi kos.")
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      ignore = true;
    };
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminService.getSubmissions();
      setSubmissions(result.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat antrean verifikasi kos."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openDetail = useCallback(async (id) => {
    const requestId = detailRequestRef.current + 1;
    detailRequestRef.current = requestId;
    setSelected(null);
    setDetailLoading(true);
    setActionError("");
    try {
      const result = await adminService.getSubmissionDetail(id);
      if (detailRequestRef.current === requestId) {
        setSelected(result.data || null);
      }
    } catch (err) {
      if (detailRequestRef.current === requestId) {
        setActionError(
          getErrorMessage(err, "Gagal memuat detail pengajuan kos.")
        );
      }
    } finally {
      if (detailRequestRef.current === requestId) {
        setDetailLoading(false);
      }
    }
  }, []);

  const closeDetail = useCallback(() => {
    detailRequestRef.current += 1;
    setSelected(null);
    setDetailLoading(false);
    setActionError("");
  }, []);

  const approveKos = useCallback(
    async (id) => {
      setActionLoadingId(id);
      setActionError("");
      try {
        await adminService.approveSubmission(id);
        await refetch();
        setSelected(null);
        return { success: true };
      } catch (err) {
        const msg = getErrorMessage(
          err,
          "Gagal menyetujui pengajuan kos."
        );
        setActionError(msg);
        return { success: false, error: msg };
      } finally {
        setActionLoadingId(null);
      }
    },
    [refetch]
  );

  const rejectKos = useCallback(
    async (id, reason) => {
      const trimmedReason = reason?.trim() || "";
      if (!trimmedReason) {
        const msg = "Alasan penolakan wajib diisi.";
        setActionError(msg);
        return { success: false, error: msg };
      }
      setActionLoadingId(id);
      setActionError("");
      try {
        await adminService.rejectSubmission(id, trimmedReason);
        await refetch();
        setSelected(null);
        return { success: true };
      } catch (err) {
        const msg = getErrorMessage(err, "Gagal menolak pengajuan kos.");
        setActionError(msg);
        return { success: false, error: msg };
      } finally {
        setActionLoadingId(null);
      }
    },
    [refetch]
  );

  return {
    submissions,
    isLoading,
    error,
    actionLoadingId,
    selected,
    detailLoading,
    actionError,
    refetch,
    openDetail,
    closeDetail,
    approveKos,
    rejectKos,
  };
}
