"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
const AuthContext = createContext(null);
export const homeForRole = role => role === "ADMIN" ? "/admin/dashboard" : role === "PEMILIK_KOS" ? "/owner/dashboard" : "/kos";
export function AuthProvider({children}) {
  const [user,setUser] = useState(null);
  const [token,setToken] = useState(null);
  const [loading,setLoading] = useState(true);
  const clear = useCallback(() => {localStorage.removeItem("token");setToken(null);setUser(null);},[]);
  useEffect(() => {
    let active = true;
    const onUnauthorized = () => {if(active) clear();};
    window.addEventListener("carikos:unauthorized",onUnauthorized);
    (async () => {
      const saved = localStorage.getItem("token");
      if (!saved) {if(active)setLoading(false);return;}
      try {const {data} = await api.get("/auth/me");if(active){setToken(saved);setUser(data.user);}}
      catch {if(active)clear();}
      finally {if(active)setLoading(false);}
    })();
    return () => {active=false;window.removeEventListener("carikos:unauthorized",onUnauthorized);};
  },[clear]);
  const login = async (email,password) => {
    const {data} = await api.post("/auth/login",{email,password});
    if (!data.token || !data.user) throw new Error("Respons login tidak valid");
    localStorage.setItem("token",data.token);setToken(data.token);setUser(data.user);return data.user;
  };
  const register = async payload => (await api.post("/auth/register",payload)).data;
  const logout = () => {clear();window.location.assign("/auth/login");};
  return <AuthContext.Provider value={{user,token,loading,isAuthenticated:!!user,login,register,logout}}>{children}</AuthContext.Provider>;
}
export function useAuth(){const ctx=useContext(AuthContext);if(!ctx)throw new Error("useAuth harus digunakan di dalam AuthProvider");return ctx;}
