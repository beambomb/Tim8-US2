"use client";

import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#0A0F1D]/80 backdrop-blur-md border-b border-[#141D30]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] rounded-lg p-1"
        >
          <div className="w-10 h-10 rounded-xl bg-[#10B981] text-[#0A0F1D] flex items-center justify-center font-black text-xl shadow-lg shadow-[#10B981]/20 group-hover:scale-105 transition-transform">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#F1F5F9] flex items-center gap-1">
            Cari<span className="text-[#10B981]">Kos</span>
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#94A3B8]">
          <a
            href="#katalog"
            className="hover:text-[#10B981] transition-colors"
          >
            Katalog Kos
          </a>
          <a
            href="#keunggulan"
            className="hover:text-[#10B981] transition-colors"
          >
            Keunggulan
          </a>
          <a
            href="#pemilik"
            className="hover:text-[#10B981] transition-colors"
          >
            Pusat Pemilik
          </a>
        </nav>

        {/* Top Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-[#94A3B8] hover:text-[#F1F5F9] border border-slate-700/80 hover:border-[#10B981]/50 hover:bg-[#141D30] transition-all cursor-pointer"
          >
            Daftarkan Kos
          </button>

          {/* Pill Menu Button: Hamburger + User Avatar */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#141D30] text-[#F1F5F9] hover:bg-[#141D30]/80 shadow-md transition-all cursor-pointer border border-slate-700/80"
            aria-label="Menu Pengguna"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 text-[#94A3B8]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
            <div className="w-7 h-7 rounded-full bg-[#0A0F1D] text-[#94A3B8] flex items-center justify-center font-semibold text-xs border border-slate-700/60">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#141D30] focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
        <div className="sm:hidden bg-[#0A0F1D]/95 backdrop-blur-xl border-b border-[#141D30] px-6 py-5 flex flex-col gap-4 text-base font-medium">
          <a
            href="#katalog"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#94A3B8] hover:text-[#10B981] py-1"
          >
            Katalog Kos
          </a>
          <a
            href="#keunggulan"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#94A3B8] hover:text-[#10B981] py-1"
          >
            Keunggulan
          </a>
          <a
            href="#pemilik"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#94A3B8] hover:text-[#10B981] py-1"
          >
            Pusat Pemilik Kos
          </a>
          <div className="pt-3 border-t border-[#141D30] flex flex-col gap-2.5">
            <button
              type="button"
              className="w-full py-2.5 rounded-full bg-[#10B981] text-[#0A0F1D] font-semibold text-center hover:bg-[#059669] transition-colors"
            >
              Masuk / Daftar Akun
            </button>
            <button
              type="button"
              className="w-full py-2 rounded-full border border-slate-700/80 text-[#94A3B8] font-medium text-center hover:bg-[#141D30] hover:text-[#F1F5F9] transition-colors text-sm"
            >
              Daftarkan Properti Kos
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

