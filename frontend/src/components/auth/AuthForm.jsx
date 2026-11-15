"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, homeForRole } from "@/context/AuthContext";
import { useAuthForm } from "@/features/auth/hooks/useAuthForm";
import { Alert, Button } from "@/components/admin/UI";

export default function AuthForm({ mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const {
    formData,
    isLoading,
    error,
    successMessage,
    handleChange,
    handleSubmit,
  } = useAuthForm(mode);
  const isLogin = mode === "login";

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      router.replace(homeForRole(user.role));
    }
  }, [authLoading, isAuthenticated, user, router]);

  const renderField = (name, label, type = "text", required = true) => (
    <label className="block text-sm font-medium text-[#0F172A]" key={name}>
      {label}
      <input
        className="mt-2 w-full rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-[#64748B] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-colors"
        name={name}
        type={type}
        value={formData[name]}
        onChange={handleChange}
        required={required}
        minLength={name === "password" ? 6 : undefined}
        aria-describedby={
          name === "password" && !isLogin ? "auth-password-hint" : undefined
        }
        autoComplete={
          name === "password"
            ? isLogin
              ? "current-password"
              : "new-password"
            : name === "email"
              ? "email"
              : name === "nama"
                ? "name"
                : "tel"
        }
        placeholder={label}
      />
      {name === "password" && !isLogin && (
        <span
          id="auth-password-hint"
          className="mt-1.5 block text-xs text-[#475569]"
        >
          Minimal 6 karakter.
        </span>
      )}
    </label>
  );

  return (
    <main className="min-h-dvh flex-1 grid place-items-center px-4 py-12 bg-[#F5F7FA] text-[#0F172A]">
      <div className="w-full max-w-md rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] p-7 sm:p-9">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2"
        >
          <span className="w-9 h-9 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden="true"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
          </span>
          <span className="text-xl font-bold tracking-tight text-[#0F172A]">
            Cari<span className="text-[#1D4ED8]">Kos</span>
          </span>
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] mt-6">
          {isLogin ? "Masuk ke CariKos" : "Buat akun CariKos"}
        </h1>
        <p className="text-sm text-[#475569] mt-2 mb-7">
          {isLogin
            ? "Masuk untuk melanjutkan pencarian dan pengelolaan kos."
            : "Daftar sebagai pencari atau pemilik kos."}
        </p>

        {!authLoading && isAuthenticated && user ? (
          <p role="status" className="text-sm text-[#475569]">
            Sesi aktif ditemukan. Mengalihkan ke halaman utama...
          </p>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && renderField("nama", "Nama lengkap")}
              {renderField("email", "Alamat email", "email")}
              {renderField("password", "Password", "password")}
              {!isLogin && renderField("noHp", "Nomor HP", "tel", false)}
              {!isLogin && (
                <label className="block text-sm font-medium text-[#0F172A]">
                  Daftar sebagai
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-4 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-colors"
                  >
                    <option value="PENCARI_KOS">Pencari Kos</option>
                    <option value="PEMILIK_KOS">Pemilik Kos</option>
                  </select>
                </label>
              )}

              {error && <Alert>{error}</Alert>}
              {successMessage && <Alert type="success">{successMessage}</Alert>}
              {isLogin && params.get("registered") === "1" && (
                <Alert type="success">
                  Akun berhasil dibuat. Silakan login.
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white"
              >
                {isLoading
                  ? "Memproses..."
                  : isLogin
                    ? "Masuk"
                    : "Daftar sekarang"}
              </Button>
            </form>

            <p className="mt-7 text-center text-sm text-[#475569]">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
              <Link
                href={isLogin ? "/auth/register" : "/auth/login"}
                className="text-[#1D4ED8] font-semibold hover:text-[#1E40AF] hover:underline"
              >
                {isLogin ? "Daftar" : "Masuk"}
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
