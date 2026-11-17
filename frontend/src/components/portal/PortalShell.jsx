"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useOptionalSocket } from "@/context/SocketContext";

function BrandHeader({ brandHref, portalLabel }) {
  return (
    <Link
      href={brandHref}
      className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
    >
      <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          aria-hidden="true"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-[#0F172A] leading-tight">
          Cari<span className="text-[var(--accent)]">Kos</span>
        </span>
        <span className="text-[11px] text-[#475569] font-medium leading-tight">
          {portalLabel}
        </span>
      </div>
    </Link>
  );
}

function PortalNavLinks({
  navItems,
  navLabel,
  navSectionLabel,
  onNavigate,
}) {
  const pathname = usePathname();
  const socketCtx = useOptionalSocket();
  const unreadMessages = socketCtx?.unreadMessages || 0;

  return (
    <nav aria-label={navLabel} className="px-3 py-4 flex flex-col gap-1">
      {navSectionLabel && (
        <span className="px-3 pb-1 text-xs font-medium text-[#475569]">
          {navSectionLabel}
        </span>
      )}
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname?.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 ${
              isActive
                ? "bg-[#EEF2F7] text-[#0F172A] font-semibold"
                : "text-[#475569] font-normal hover:text-[#0F172A] hover:bg-[#F5F7FA]"
            }`}
          >
            <span className={isActive ? "text-[var(--accent)]" : "text-[#475569]"}>
              {item.icon}
            </span>
            <span className="flex-1">{item.label}</span>
            {item.label === "Pesan" && unreadMessages > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#1D4ED8] text-white text-[11px] font-bold leading-none tabular-nums">
                {unreadMessages > 99 ? "99+" : unreadMessages}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Shared responsive shell (fixed desktop sidebar + mobile top bar & drawer)
 * used across Owner and Admin portals.
 */
export default function PortalShell({
  children,
  portalLabel,
  brandHref = "/",
  navItems = [],
  navLabel = "Navigasi portal",
  navSectionLabel = "Menu pengelolaan",
  allowedRole,
  loadingText = "Memeriksa akses portal...",
  unauthorizedTitle = "Akses Terbatas",
  unauthorizedAuthenticatedText = "Akun Anda tidak memiliki akses ke halaman ini.",
  unauthorizedGuestText = "Silakan masuk terlebih dahulu untuk mengakses portal ini.",
  loginCtaLabel = "Masuk ke Akun",
  redirectOnUnauthorized = false,
  fallbackUserName = "Pengguna",
  fallbackUserSubtext = "CariKos",
}) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const hasAccess = isAuthenticated && (!allowedRole || user?.role === allowedRole);

  useEffect(() => {
    if (!redirectOnUnauthorized || loading) return;
    if (!user) router.replace("/auth/login");
    else if (allowedRole && user.role !== allowedRole) router.replace("/");
  }, [redirectOnUnauthorized, loading, user, allowedRole, router]);

  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileDrawerOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileDrawerOpen]);

  if (loading || (redirectOnUnauthorized && !hasAccess)) {
    return (
      <div className="min-h-dvh bg-[#F5F7FA] text-[#0F172A] grid place-items-center p-6">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] text-sm text-[#475569]">
          <svg
            className="animate-spin h-4 w-4 text-[var(--accent)]"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span>{loadingText}</span>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-dvh bg-[#F5F7FA] text-[#0F172A] grid place-items-center p-6">
        <div className="w-full max-w-md rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] p-7 text-center flex flex-col items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#EEF2F7] text-[var(--accent)] flex items-center justify-center">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-lg font-semibold text-[#0F172A]">
              {unauthorizedTitle}
            </h1>
            <p className="mt-1.5 text-sm text-[#475569]">
              {isAuthenticated
                ? unauthorizedAuthenticatedText
                : unauthorizedGuestText}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-1">
            {!isAuthenticated && (
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
              >
                {loginCtaLabel}
              </Link>
            )}
            <Link
              href="/"
              className="px-4 py-2 rounded-lg text-xs font-medium bg-[#EEF2F7] text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const userName = user?.nama || fallbackUserName;
  const userSubtext = user?.email || fallbackUserSubtext;
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-dvh bg-[#F5F7FA] text-[#0F172A] flex flex-col md:flex-row">
      {/* Mobile Top Bar (< md) */}
      <header className="md:hidden h-14 px-4 bg-[#FFFFFF] border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 z-30">
        <BrandHeader brandHref={brandHref} portalLabel={portalLabel} />
        <button
          type="button"
          onClick={() => setMobileDrawerOpen((prev) => !prev)}
          aria-expanded={mobileDrawerOpen}
          aria-controls="portal-mobile-drawer"
          aria-label={mobileDrawerOpen ? "Tutup menu portal" : "Buka menu portal"}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#0F172A] hover:bg-[#EEF2F7] transition-colors cursor-pointer"
        >
          {mobileDrawerOpen ? (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Drawer Sheet (< md) */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-40">
          <div
            className="fixed inset-0 top-14 bg-[#0F172A]/40"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            id="portal-mobile-drawer"
            className="relative bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 py-4 flex flex-col gap-3 z-10"
          >
            <PortalNavLinks
              navItems={navItems}
              navLabel={navLabel}
              navSectionLabel={navSectionLabel}
              onNavigate={() => setMobileDrawerOpen(false)}
            />

            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#EEF2F7] flex items-center justify-center text-xs font-semibold text-[#0F172A] shrink-0">
                  {userInitial}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-[#0F172A] truncate">
                    {userName}
                  </span>
                  <span className="text-[11px] text-[#475569] truncate">
                    {userSubtext}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#EEF2F7] text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
                >
                  Web Publik
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    logout();
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar Navigation Shell (240px standard) */}
      <aside className="hidden md:flex md:w-60 bg-[#FFFFFF] border-r border-[#E2E8F0] flex-col justify-between shrink-0">
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-[#E2E8F0]">
            <BrandHeader brandHref={brandHref} portalLabel={portalLabel} />
          </div>

          <PortalNavLinks
            navItems={navItems}
            navLabel={navLabel}
            navSectionLabel={navSectionLabel}
          />
        </div>

        {/* Sidebar Footer: User Info & Quick Exit Actions */}
        <div className="p-4 border-t border-[#E2E8F0] flex flex-col gap-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-[#EEF2F7] flex items-center justify-center text-xs font-semibold text-[#0F172A] shrink-0">
              {userInitial}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-medium text-[#0F172A] truncate">
                {userName}
              </span>
              <span className="text-[11px] text-[#475569] truncate">
                {userSubtext}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-[#475569] hover:text-[var(--accent)] px-1 py-1 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>Kembali ke Web Publik</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 text-xs text-[#991B1B] hover:text-[#0F172A] px-1 py-1 text-left transition-colors cursor-pointer"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                />
              </svg>
              <span>Keluar Akun</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
