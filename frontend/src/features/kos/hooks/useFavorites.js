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
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    try {
      const res = await kosService.getFavorites();
      setFavorites(Array.isArray(res?.data) ? res.data : []);
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
        if (!ignore) {
          setFavorites([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await kosService.getFavorites();
        if (!ignore) {
          setFavorites(Array.isArray(res?.data) ? res.data : []);
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

  const isKosFavorited = useCallback(
    (kosId) =>
      Boolean(kosId) &&
      favorites.some(
        (f) => String(f.kosId?._id || f.kosId) === String(kosId)
      ),
    [favorites]
  );

  // Optimistic remove dari daftar favorit
  const handleRemoveFavorite = useCallback(
    async (kosId, favoriteRecordId) => {
      const previousList = [...favorites];
      setFavorites((prev) =>
        prev.filter((item) => {
          if (favoriteRecordId && item._id === favoriteRecordId) return false;
          const itemKosId = item.kosId?._id || item.kosId;
          if (kosId && itemKosId && String(itemKosId) === String(kosId)) {
            return false;
          }
          return true;
        })
      );

      try {
        await kosService.removeFavorite(favoriteRecordId || kosId);
      } catch (err) {
        setFavorites(previousList);
        alert(err.response?.data?.message || "Gagal menghapus dari favorit.");
      }
    },
    [favorites]
  );

  // Toggle favorite helper
  const handleToggleFavorite = useCallback(
    async (kosId) => {
      if (!isAuthenticated || user?.role !== "PENCARI_KOS" || !kosId) {
        return false;
      }

      const existing = favorites.find(
        (f) => String(f.kosId?._id || f.kosId) === String(kosId)
      );
      if (existing) {
        await handleRemoveFavorite(kosId, existing._id);
        return false;
      }

      try {
        await kosService.addFavorite(kosId);
        await fetchFavoritesData();
        return true;
      } catch (err) {
        alert(err.response?.data?.message || "Gagal menambahkan ke favorit.");
        return false;
      }
    },
    [isAuthenticated, user, favorites, handleRemoveFavorite, fetchFavoritesData]
  );

  return {
    favorites,
    isLoading,
    error,
    isKosFavorited,
    handleRemoveFavorite,
    handleToggleFavorite,
    refetch,
  };
}

export default useFavorites;
