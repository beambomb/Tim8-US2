"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { adminService } from "../services/adminService";

function getErrorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      try {
        const result = await adminService.getUsers();
        if (!ignore) {
          setUsers(result.data || []);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(getErrorMessage(err, "Gagal memuat daftar pengguna."));
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
      const result = await adminService.getUsers();
      setUsers(result.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat daftar pengguna."));
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return users;
    return users.filter((u) =>
      `${u.nama || ""} ${u.email || ""}`
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [users, query]);

  const updateRole = useCallback(async (targetUser, nextRole) => {
    if (!targetUser || nextRole === targetUser.role) {
      return { success: false };
    }
    setBusy(targetUser._id);
    setError("");
    setMessage("");
    try {
      const res = await adminService.updateUserRole(targetUser._id, nextRole);
      setUsers((old) =>
        old.map((item) => (item._id === targetUser._id ? res.data : item))
      );
      setMessage(`Role ${targetUser.nama} berhasil diperbarui.`);
      return { success: true };
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memperbarui role pengguna."));
      return { success: false };
    } finally {
      setBusy("");
    }
  }, []);

  return {
    users,
    filtered,
    query,
    setQuery,
    loading,
    busy,
    error,
    message,
    refetch,
    updateRole,
  };
}
