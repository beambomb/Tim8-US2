"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, homeForRole } from "@/context/AuthContext";

export function useAuthForm(mode = "login") {
  const router = useRouter();
  const { login, register } = useAuth();
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    noHp: "",
    role: "PENCARI_KOS",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((old) => ({ ...old, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const isLogin = mode === "login";
    const cleanNama = formData.nama.trim();
    const cleanEmail = formData.email.trim();
    const cleanNoHp = formData.noHp.trim();
    const password = formData.password;

    if (!isLogin && !cleanNama) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    if (!cleanEmail) {
      setError("Alamat email wajib diisi.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const user = await login(cleanEmail, password);
        router.replace(homeForRole(user.role));
      } else {
        await register({
          nama: cleanNama,
          email: cleanEmail,
          password,
          noHp: cleanNoHp || null,
          role: formData.role,
        });
        setSuccessMessage(
          "Pendaftaran berhasil. Silakan masuk menggunakan akun baru."
        );
        router.push("/auth/login?registered=1");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Terjadi kesalahan. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    error,
    successMessage,
    handleChange,
    handleSubmit,
  };
}
