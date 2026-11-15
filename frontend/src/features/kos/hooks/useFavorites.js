"use client";

import { useState, useEffect, useCallback } from "react";
import { kosService } from "../services/kosService";
import { useAuth } from "@/context/AuthContext";

export function useFavorites() {
  const { isAuthenticated, user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavoritesData = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "PENCARI_KOS") {
      setIsLoading(false);
      return;
    }

    try {
      const res = await kosService.getFavorites();
      setFavorites(res?.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat daftar favorit.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    let ignore = false;

    const execute = async () => {
      if (!isAuthenticated || user?.role !== "PENCARI_KOS") {
        setIsLoading(false);
        return;
      }

      try {
        const res = await kosService.getFavorites();
        if (!ignore) {
          setFavorites(res?.data || []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Gagal memuat daftar favorit.");
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
  }, [isAuthenticated, user]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchFavoritesData();
  }, [fetchFavoritesData]);

  // Optimistic remove dari daftar favorit
  const handleRemoveFavorite = async (kosId, favoriteRecordId) => {
    const previousList = [...favorites];
    setFavorites((prev) =>
      prev.filter(
        (item) =>
          item._id !== favoriteRecordId &&
          (item.kosId?._id || item.kosId) !== kosId
      )
    );

    try {
      await kosService.removeFavorite(kosId);
    } catch (err) {
      setFavorites(previousList);
      alert(err.response?.data?.message || "Gagal menghapus dari favorit.");
    }
  };

  // Toggle favorite helper
  const handleToggleFavorite = async (kosId) => {
    const existing = favorites.find(
      (f) => (f.kosId?._id || f.kosId) === kosId
    );
    if (existing) {
      return handleRemoveFavorite(kosId, existing._id);
    }

    try {
      const res = await kosService.addFavorite(kosId);
      if (res?.data) {
        setFavorites((prev) => [res.data, ...prev]);
      } else {
        refetch();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menambahkan ke favorit.");
    }
  };

  return {
    favorites,
    isLoading,
    error,
    handleRemoveFavorite,
    handleToggleFavorite,
    refetch,
  };
}

export default useFavorites;
