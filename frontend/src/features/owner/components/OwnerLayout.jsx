'use client';

import { Suspense } from 'react';
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

function OwnerNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="px-3 py-1 flex flex-col gap-1">
      <span className="px-3 pt-2 pb-1 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
        Menu Pengelolaan
      </span>
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/owner/dashboard' && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              isActive
                ? 'bg-[#141D30] text-[#F1F5F9] font-semibold border border-slate-700/60'
                : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#141D30]/50'
            }`}
          >
            <span className={isActive ? 'text-emerald-400' : 'text-[#64748B]'}>
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
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-[#F1F5F9] flex flex-col md:flex-row">
      {/* Sidebar Navigation Shell (230px standard) */}
      <aside className="w-full md:w-60 bg-[#0A0F1D] border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Mark & Portal Title */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
            <Link href="/owner/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                CK
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#F1F5F9] leading-tight">
                  Cari<span className="text-emerald-400">Kos</span>
                </span>
                <span className="text-[10px] text-[#94A3B8] font-medium tracking-wider uppercase">
                  Portal Pemilik
                </span>
              </div>
            </Link>
          </div>

          {/* Quick CTA Button: Tambah Kos */}
          <div className="p-4">
            <Link
              href="/owner/kos/tambah"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-[#10B981] text-[#0A0F1D] hover:bg-[#059669] transition-colors shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Tambah Kos Baru</span>
            </Link>
          </div>

          {/* Navigation Links List inside Suspense */}
          <Suspense fallback={<div className="px-3 py-4 text-xs text-slate-500">Memuat menu...</div>}>
            <OwnerNavLinks />
          </Suspense>
        </div>

        {/* Sidebar Footer: User Info & Back to Public */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-300">
              {user?.nama ? user.nama.charAt(0).toUpperCase() : 'P'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-medium text-[#F1F5F9] truncate">
                {user?.nama || 'Pemilik Kos'}
              </span>
              <span className="text-[11px] text-[#64748B] truncate">
                {user?.email || 'Mitra CariKos'}
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-[#94A3B8] hover:text-emerald-400 px-1 pt-1 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span>Kembali ke Web Publik</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
