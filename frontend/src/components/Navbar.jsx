"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    if (!accountMenuOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    };

    const handlePointerDown = (event) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [accountMenuOpen]);

  const navLinks = [
    { label: "Katalog Kos", href: "/kos" },
    { label: "Kos Terdekat", href: "/kos/nearby" },
    { label: "Pusat Pemilik", href: "/owner/dashboard" },
  ];

  const isActiveRoute = (href) => {
    if (href === "/kos") {
      return pathname === "/kos";
    }
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const userInitial = user?.nama ? user.nama.charAt(0).toUpperCase() : "U";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#0A0F1D]/85 backdrop-blur-md border-b border-[#141D30]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] rounded-lg p-1 shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-[#10B981] text-[#0A0F1D] flex items-center justify-center font-black text-xl shadow-lg shadow-[#10B981]/20 group-hover:scale-105 transition-transform">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="w-6 h-6"
            >
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#F1F5F9] flex items-center gap-1">
            Cari<span className="text-[#10B981]">Kos</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Navigasi Utama" className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navLinks.map((item) => {
            const active = isActiveRoute(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`py-1.5 border-b-2 transition-colors ${
                  active
                    ? "text-[#10B981] border-[#10B981] font-semibold"
                    : "text-[#94A3B8] border-transparent hover:text-[#F1F5F9]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Top Right Auth & Account Actions (Desktop, tanpa ikon strip 3) */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          {!loading && isAuthenticated && user ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                aria-expanded={accountMenuOpen}
                aria-controls="desktop-account-popover"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-full bg-[#141D30] text-[#F1F5F9] hover:border-[#10B981]/50 transition-all cursor-pointer border border-slate-700/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
              >
                <span className="w-7 h-7 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center font-bold text-xs border border-[#10B981]/30">
                  {userInitial}
                </span>
                <span className="text-xs font-medium max-w-[120px] truncate pr-1">
                  {user.nama || "Akun Saya"}
                </span>
              </button>

              {accountMenuOpen && (
                <div
                  id="desktop-account-popover"
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-[#141D30] border border-slate-700/80 shadow-2xl shadow-black/60 py-2 text-xs z-50"
                >
                  <div className="px-3.5 py-2 border-b border-slate-800">
                    <p className="font-semibold text-[#F1F5F9] truncate">
                      {user.nama || "Pengguna CariKos"}
                    </p>
                    <p className="text-[11px] text-[#94A3B8] truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1 flex flex-col">
                    {user.role === "PEMILIK_KOS" && (
                      <>
                        <Link
                          href="/owner/dashboard"
                          onClick={() => setAccountMenuOpen(false)}
                          className="px-3.5 py-2 text-[#F1F5F9] hover:bg-slate-800/70 hover:text-[#10B981] transition-colors"
                        >
                          Dashboard Pemilik
                        </Link>
                        <Link
                          href="/owner/kos"
                          onClick={() => setAccountMenuOpen(false)}
                          className="px-3.5 py-2 text-[#94A3B8] hover:bg-slate-800/70 hover:text-[#F1F5F9] transition-colors"
                        >
                          Inventaris Kos Saya
                        </Link>
                        <Link
                          href="/owner/kos/tambah"
                          onClick={() => setAccountMenuOpen(false)}
                          className="px-3.5 py-2 text-[#94A3B8] hover:bg-slate-800/70 hover:text-[#F1F5F9] transition-colors"
                        >
                          Tambah Kos Baru
                        </Link>
                      </>
                    )}

                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setAccountMenuOpen(false)}
                        className="px-3.5 py-2 text-[#F1F5F9] hover:bg-slate-800/70 hover:text-[#10B981] transition-colors"
                      >
                        Dashboard Admin
                      </Link>
                    )}

                    {user.role === "PENCARI_KOS" && (
                      <>
                        <Link
                          href="/favorites"
                          onClick={() => setAccountMenuOpen(false)}
                          className="px-3.5 py-2 text-[#94A3B8] hover:bg-slate-800/70 hover:text-[#F1F5F9] transition-colors"
                        >
                          Kos Favorit Saya
                        </Link>
                        <Link
                          href="/bookings"
                          onClick={() => setAccountMenuOpen(false)}
                          className="px-3.5 py-2 text-[#94A3B8] hover:bg-slate-800/70 hover:text-[#F1F5F9] transition-colors"
                        >
                          Riwayat Booking
                        </Link>
                      </>
                    )}

                    <Link
                      href="/chat"
                      onClick={() => setAccountMenuOpen(false)}
                      className="px-3.5 py-2 text-[#94A3B8] hover:bg-slate-800/70 hover:text-[#F1F5F9] transition-colors"
                    >
                      Kotak Pesan
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3.5 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer font-medium"
                    >
                      Keluar Akun
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#F1F5F9] hover:text-[#10B981] border border-slate-700/80 hover:border-[#10B981]/50 bg-[#141D30]/70 transition-all"
              >
                Masuk
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[#10B981] text-[#0A0F1D] hover:bg-[#059669] transition-colors shadow-sm"
              >
                Daftar Akun
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button (< sm only) */}
        <div className="flex sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
            className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#141D30] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="sm:hidden bg-[#0A0F1D]/95 backdrop-blur-xl border-b border-[#141D30] px-6 py-5 flex flex-col gap-3 text-base font-medium"
        >
          {navLinks.map((item) => {
            const active = isActiveRoute(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1.5 border-l-2 pl-3 transition-colors ${
                  active
                    ? "text-[#10B981] border-[#10B981] font-semibold"
                    : "text-[#94A3B8] border-transparent hover:text-[#F1F5F9]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-[#141D30] flex flex-col gap-2.5">
            {isAuthenticated && user ? (
              <>
                <div className="px-2 py-1 text-xs text-[#94A3B8]">
                  Masuk sebagai <strong className="text-[#F1F5F9]">{user.nama || user.email}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2.5 rounded-full border border-rose-500/40 text-rose-400 font-semibold text-center hover:bg-rose-500/10 transition-colors text-sm"
                >
                  Keluar Akun
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-full border border-slate-700/80 text-[#F1F5F9] font-medium text-center hover:bg-[#141D30] transition-colors text-sm"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-full bg-[#10B981] text-[#0A0F1D] font-semibold text-center hover:bg-[#059669] transition-colors text-sm"
                >
                  Daftar Akun
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
