"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/features/auth/services/authService";

const AuthContext = createContext(null);

export const homeForRole = (role) =>
  role === "ADMIN"
    ? "/admin/dashboard"
    : role === "PEMILIK_KOS"
      ? "/owner/dashboard"
      : "/kos";

function normalizeUser(u) {
  if (!u) return null;
  const uid = u._id || u.id;
  return { ...u, _id: uid, id: uid };
}

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const clear = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;

    const onUnauthorized = () => {
      if (active) clear();
    };
    window.addEventListener("carikos:unauthorized", onUnauthorized);

    async function bootstrapSession() {
      const saved = localStorage.getItem("token");
      if (!saved) {
        if (active) setLoading(false);
        return;
      }

      try {
        const data = await authService.getMe();
        if (active) {
          if (data?.user) {
            setToken(saved);
            setUser(normalizeUser(data.user));
          } else {
            clear();
          }
        }
      } catch {
        if (active) clear();
      } finally {
        if (active) setLoading(false);
      }
    }

    bootstrapSession();

    return () => {
      active = false;
      window.removeEventListener("carikos:unauthorized", onUnauthorized);
    };
  }, [clear]);

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password });
    if (!data?.token || !data?.user) {
      throw new Error("Respons login tidak valid");
    }
    const normalized = normalizeUser(data.user);
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(normalized);
    return normalized;
  }, []);

  const register = useCallback(async (payload) => {
    return authService.register(payload);
  }, []);

  const logout = useCallback(() => {
    clear();
    router.push("/auth/login");
  }, [clear, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return ctx;
}
