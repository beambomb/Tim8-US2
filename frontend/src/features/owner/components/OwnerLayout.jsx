'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  {
    label: 'Dashboard Analitik',
    href: '/owner/dashboard',
    icon: (
      <svg
        className="w-4 h-4"
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
    ),
  },
  {
    label: 'Inventaris Kos Saya',
    href: '/owner/kos',
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5"
        />
      </svg>
    ),
  },
  {
    label: 'Permohonan Booking',
    href: '/owner/bookings',
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
      </svg>
    ),
  },
];

function BrandHeader() {
  return (
    <Link href="/owner/dashboard" className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="w-4 h-4"
        >
          <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
          <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-[#0F172A] leading-tight">
          Cari<span className="text-[var(--accent)]">Kos</span>
        </span>
        <span className="text-[11px] text-[#475569] font-medium leading-tight">
          Portal Pemilik
        </span>
      </div>
    </Link>
  );
}

function OwnerNavLinks({ onNavigate }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi pemilik kos" className="px-3 py-1 flex flex-col gap-1">
      <span className="px-3 pt-2 pb-1 text-xs font-medium text-[#475569]">
        Menu pengelolaan
      </span>
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/owner/dashboard' && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? 'bg-[#EEF2F7] text-[#0F172A] font-semibold'
                : 'text-[#475569] font-normal hover:text-[#0F172A] hover:bg-[#F5F7FA]'
            }`}
          >
            <span className={isActive ? 'text-[var(--accent)]' : 'text-[#475569]'}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function OwnerLayout({ children }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileDrawerOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileDrawerOpen]);

  if (loading) {
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
          <span>Memeriksa akses pemilik kos...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'PEMILIK_KOS') {
    return (
      <div className="min-h-dvh bg-[#F5F7FA] text-[#0F172A] grid place-items-center p-6">
        <div className="w-full max-w-md rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] p-7 text-center flex flex-col items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] text-[var(--accent)] flex items-center justify-center">
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
              Akses Terbatas Portal Pemilik Kos
            </h1>
            <p className="mt-1.5 text-sm text-[#475569]">
              {isAuthenticated
                ? 'Halaman ini hanya dapat diakses oleh akun dengan peran Pemilik Kos.'
                : 'Silakan masuk menggunakan akun Pemilik Kos Anda untuk mengelola properti dan booking.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-1">
            {!isAuthenticated && (
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
              >
                Masuk ke Akun Pemilik
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

  return (
    <div className="min-h-dvh bg-[#F5F7FA] text-[#0F172A] flex flex-col md:flex-row">
      {/* Mobile Top Bar (< md) */}
      <header className="md:hidden h-14 px-4 bg-[#FFFFFF] border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 z-30">
        <BrandHeader />
        <button
          type="button"
          onClick={() => setMobileDrawerOpen((prev) => !prev)}
          aria-expanded={mobileDrawerOpen}
          aria-controls="owner-mobile-drawer"
          aria-label={mobileDrawerOpen ? 'Tutup menu pemilik kos' : 'Buka menu pemilik kos'}
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
            id="owner-mobile-drawer"
            className="relative bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 py-4 flex flex-col gap-4 z-10"
          >
            <Link
              href="/owner/kos/tambah"
              onClick={() => setMobileDrawerOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Tambah Kos Baru</span>
            </Link>

            <Suspense fallback={<div className="px-3 py-2 text-xs text-[#475569]">Memuat menu...</div>}>
              <OwnerNavLinks onNavigate={() => setMobileDrawerOpen(false)} />
            </Suspense>

            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#EEF2F7] flex items-center justify-center text-xs font-semibold text-[#0F172A] shrink-0">
                  {user?.nama ? user.nama.charAt(0).toUpperCase() : 'P'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-[#0F172A] truncate">
                    {user?.nama || 'Pemilik Kos'}
                  </span>
                  <span className="text-[11px] text-[#475569] truncate">
                    {user?.email || 'Mitra CariKos'}
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
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#FFEDEA] text-[#831C1E] hover:bg-[#FECACA] transition-colors cursor-pointer"
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
          {/* Brand Mark & Portal Title */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-[#E2E8F0]">
            <BrandHeader />
          </div>

          {/* Quick CTA Button: Tambah Kos */}
          <div className="p-4">
            <Link
              href="/owner/kos/tambah"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Tambah Kos Baru</span>
            </Link>
          </div>

          {/* Navigation Links List inside Suspense */}
          <Suspense fallback={<div className="px-3 py-4 text-xs text-[#475569]">Memuat menu...</div>}>
            <OwnerNavLinks />
          </Suspense>
        </div>

        {/* Sidebar Footer: User Info & Back to Public */}
        <div className="p-4 border-t border-[#E2E8F0] flex flex-col gap-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-[#EEF2F7] flex items-center justify-center text-xs font-semibold text-[#0F172A] shrink-0">
              {user?.nama ? user.nama.charAt(0).toUpperCase() : 'P'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-medium text-[#0F172A] truncate">
                {user?.nama || 'Pemilik Kos'}
              </span>
              <span className="text-[11px] text-[#475569] truncate">
                {user?.email || 'Mitra CariKos'}
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
              className="flex items-center gap-2 text-xs text-[#831C1E] hover:text-[#0F172A] px-1 py-1 text-left transition-colors cursor-pointer"
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
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
