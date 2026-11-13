"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const PUBLIC_NAV_LINKS = [
  { label: "Katalog Kos", href: "/kos" },
  { label: "Kos Terdekat", href: "/kos/nearby" },
  { label: "Keunggulan", href: "/#keunggulan" },
];

function getRoleAccountLinks(role) {
  if (role === "PEMILIK_KOS") {
    return [
      { label: "Dashboard Pemilik", href: "/owner/dashboard" },
      { label: "Inventaris Kos Saya", href: "/owner/kos" },
      { label: "Tambah Kos Baru", href: "/owner/kos/tambah" },
      { label: "Kotak Pesan", href: "/chat" },
    ];
  }

  if (role === "ADMIN") {
    return [
      { label: "Dashboard Admin", href: "/admin/dashboard" },
      { label: "Verifikasi Pengajuan", href: "/admin/submissions" },
      { label: "Kotak Pesan", href: "/chat" },
    ];
  }

  return [
    { label: "Kos Favorit Saya", href: "/favorites" },
    { label: "Riwayat Booking", href: "/bookings" },
    { label: "Kotak Pesan", href: "/chat" },
  ];
}

const FOCUS_OUTLINE_CLASS =
  "focus-visible:outline-2 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2";

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const accountButtonRef = useRef(null);
  const mobileButtonRef = useRef(null);

  useEffect(() => {
    if (!accountMenuOpen && !mobileMenuOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (accountMenuOpen) {
          setAccountMenuOpen(false);
          accountButtonRef.current?.focus();
        }
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          mobileButtonRef.current?.focus();
        }
      }
    };

    const handlePointerDown = (event) => {
      if (
        accountMenuOpen &&
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
  }, [accountMenuOpen, mobileMenuOpen]);

  const showAuthenticatedUI = !loading && isAuthenticated && Boolean(user);

  const centerNavLinks = [...PUBLIC_NAV_LINKS];
  if (showAuthenticatedUI && user.role === "PEMILIK_KOS") {
    centerNavLinks.push({ label: "Portal Pemilik", href: "/owner/dashboard" });
  } else if (showAuthenticatedUI && user.role === "ADMIN") {
    centerNavLinks.push({ label: "Panel Admin", href: "/admin/dashboard" });
  }

  const accountLinks = showAuthenticatedUI
    ? getRoleAccountLinks(user.role)
    : [];

  const isActiveRoute = (href) => {
    if (!pathname || href.startsWith("/#")) {
      return false;
    }
    if (href === "/kos" || href === "/owner/kos") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const userInitial = user?.nama ? user.nama.charAt(0).toUpperCase() : "U";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className={`flex items-center gap-2.5 group rounded-lg p-1 shrink-0 ${FOCUS_OUTLINE_CLASS}`}
        >
          <div className="w-10 h-10 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center font-black text-xl group-hover:bg-[#1E40AF] transition-colors">
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
          <span className="text-xl font-bold tracking-tight text-[#0F172A]">
            Cari<span className="text-[#1D4ED8]">Kos</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Utama" className="hidden sm:block">
          <ul className="flex items-center gap-4 md:gap-7 text-xs md:text-sm font-medium">
            {centerNavLinks.map((item) => {
              const active = isActiveRoute(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex items-center min-h-[28px] py-1.5 border-b-2 whitespace-nowrap transition-colors ${FOCUS_OUTLINE_CLASS} ${
                      active
                        ? "text-[#1D4ED8] border-[#1D4ED8] font-semibold"
                        : "text-[#475569] border-transparent hover:text-[#0F172A]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          {showAuthenticatedUI ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                ref={accountButtonRef}
                type="button"
                aria-expanded={accountMenuOpen}
                aria-controls="desktop-account-popover"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                className={`flex items-center gap-2.5 min-h-[36px] px-2.5 py-1.5 rounded-full bg-[#EEF2F7] text-[#0F172A] hover:bg-[#E2E8F0] border border-[#CBD5E1] transition-colors cursor-pointer ${FOCUS_OUTLINE_CLASS}`}
              >
                <span className="w-7 h-7 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-xs">
                  {userInitial}
                </span>
                <span className="text-xs font-medium max-w-[120px] truncate pr-1">
                  {user.nama || "Akun Saya"}
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-[#475569] transition-transform ${
                    accountMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {accountMenuOpen && (
                <div
                  id="desktop-account-popover"
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xl shadow-slate-900/10 py-2 text-xs z-50" // taste-skill-ignore: floating menu overlay
                >
                  <div className="px-3 py-2 mx-1.5 mb-1 rounded-lg bg-[#F5F7FA]">
                    <p className="font-semibold text-[#0F172A] truncate">
                      {user.nama || "Pengguna CariKos"}
                    </p>
                    <p className="text-[11px] text-[#475569] truncate">
                      {user.email}
                    </p>
                  </div>

                  <nav aria-label="Akun" className="py-1">
                    <ul className="flex flex-col">
                      {accountLinks.map((item) => {
                        const active = isActiveRoute(item.href);
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              aria-current={active ? "page" : undefined}
                              onClick={() => setAccountMenuOpen(false)}
                              className={`block px-3.5 py-2 border-l-2 transition-colors ${FOCUS_OUTLINE_CLASS} ${
                                active
                                  ? "text-[#1D4ED8] border-[#1D4ED8] bg-[#EFF6FF] font-semibold"
                                  : "text-[#475569] border-transparent hover:bg-[#F5F7FA] hover:text-[#0F172A]"
                              }`}
                            >
                              {item.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  <div className="mt-1 pt-1 px-1.5 border-t border-[#E2E8F0]">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        logout();
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer font-medium ${FOCUS_OUTLINE_CLASS}`}
                    >
                      Keluar Akun
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/#pemilik"
                className={`inline-flex items-center min-h-[28px] text-xs md:text-sm font-medium text-[#475569] hover:text-[#0F172A] whitespace-nowrap transition-colors rounded-sm py-1 ${FOCUS_OUTLINE_CLASS}`}
              >
                Untuk Pemilik
              </Link>
              <Link
                href="/auth/login"
                className={`inline-flex items-center min-h-[36px] px-4 py-2 rounded-full text-xs font-semibold bg-[#1D4ED8] text-white hover:bg-[#1E40AF] whitespace-nowrap transition-colors ${FOCUS_OUTLINE_CLASS}`}
              >
                Masuk
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button (< sm only) */}
        <div className="flex sm:hidden">
          <button
            ref={mobileButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
            className={`p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-[#475569] hover:text-[#0F172A] hover:bg-[#EEF2F7] ${FOCUS_OUTLINE_CLASS}`}
            aria-label={mobileMenuOpen ? "Tutup Menu" : "Buka Menu"}
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

      {/* Mobile Dropdown Drawer (< sm only) */}
      {mobileMenuOpen && (
        <nav
          id="mobile-nav-menu"
          aria-label="Seluler"
          className="sm:hidden bg-[#FFFFFF] border-b border-[#E2E8F0] px-6 py-5 flex flex-col gap-4 text-base font-medium shadow-lg"
        >
          <ul className="flex flex-col gap-2">
            {centerNavLinks.map((item) => {
              const active = isActiveRoute(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-1.5 border-l-2 pl-3 transition-colors ${FOCUS_OUTLINE_CLASS} ${
                      active
                        ? "text-[#1D4ED8] border-[#1D4ED8] font-semibold"
                        : "text-[#475569] border-transparent hover:text-[#0F172A]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}

            {!showAuthenticatedUI && (
              <li>
                <Link
                  href="/#pemilik"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-1.5 border-l-2 border-transparent pl-3 text-[#475569] hover:text-[#0F172A] transition-colors ${FOCUS_OUTLINE_CLASS}`}
                >
                  Untuk Pemilik
                </Link>
              </li>
            )}
          </ul>

          <div className="pt-2 flex flex-col gap-2.5">
            {showAuthenticatedUI ? (
              <>
                <div className="px-3 py-2 rounded-lg bg-[#F5F7FA] text-xs text-[#475569]">
                  Masuk sebagai{" "}
                  <strong className="text-[#0F172A]">
                    {user.nama || user.email}
                  </strong>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {accountLinks.map((item) => {
                    const active = isActiveRoute(item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block py-1.5 border-l-2 pl-3 text-sm transition-colors ${FOCUS_OUTLINE_CLASS} ${
                            active
                              ? "text-[#1D4ED8] border-[#1D4ED8] font-semibold"
                              : "text-[#475569] border-transparent hover:text-[#0F172A]"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className={`mt-1 w-full py-2.5 rounded-full bg-rose-50 text-rose-600 font-semibold text-center hover:bg-rose-100 transition-colors text-sm ${FOCUS_OUTLINE_CLASS}`}
                >
                  Keluar Akun
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full py-2.5 rounded-full bg-[#EEF2F7] border border-[#CBD5E1] text-[#0F172A] font-medium text-center hover:bg-[#E2E8F0] transition-colors text-sm ${FOCUS_OUTLINE_CLASS}`}
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full py-2.5 rounded-full bg-[#1D4ED8] text-white font-semibold text-center hover:bg-[#1E40AF] transition-colors text-sm ${FOCUS_OUTLINE_CLASS}`}
                >
                  Daftar Akun
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
