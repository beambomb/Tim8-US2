"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

function NavIcon({ kind }) {
  if (kind === "dashboard") {
    return (
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
        />
      </svg>
    );
  }

  if (kind === "submissions") {
    return (
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  }

  return (
    <svg
      className="w-4 h-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

const nav = [
  { href: "/admin/dashboard", label: "Ringkasan", icon: "dashboard" },
  { href: "/admin/submissions", label: "Verifikasi Kos", icon: "submissions" },
  { href: "/admin/users", label: "Pengguna", icon: "users" },
];

export default function AdminShell({ children, title, subtitle }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
    else if (!loading && user?.role !== "ADMIN") router.replace("/");
  }, [loading, user, router]);

  if (loading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-dvh bg-[#F5F7FA] grid place-items-center text-sm text-[#475569]">
        Memeriksa akses administrator...
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F5F7FA] text-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 mb-6">
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
            <span className="text-sm font-medium text-[#475569]">/ Admin</span>
          </Link>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#475569]">{user.nama}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-3.5 py-1.5 text-sm font-medium text-[#0F172A] hover:bg-[#EEF2F7] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2"
            >
              Keluar
            </button>
          </div>
        </div>

        <div className="grid gap-7 md:grid-cols-[220px_1fr]">
          <nav
            aria-label="Navigasi administrator"
            className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0"
          >
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2 ${
                    active
                      ? "bg-[#EEF2F7] text-[#0F172A] font-semibold"
                      : "text-[#475569] font-medium hover:bg-[#EEF2F7]/70 hover:text-[#0F172A]"
                  }`}
                >
                  <NavIcon kind={item.icon} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <main className="min-w-0">
            <header className="mb-6">
              <div className="flex items-center gap-2.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="w-5 h-5 text-[#1D4ED8] shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
                <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  {title}
                </h1>
              </div>
              {subtitle && (
                <p className="text-sm text-[#475569] mt-1.5">{subtitle}</p>
              )}
            </header>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
