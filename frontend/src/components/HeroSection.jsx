"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { quickTags } from "../data/mockKos";
import { useAuth } from "../context/AuthContext";
import HeroKosMarquee from "./HeroKosMarquee";

const TYPEWRITER_QUERIES = [
  "Cari kos dekat UGM...",
  "Pogung & Kaliurang...",
  "Kamar mandi dalam Seturan...",
  "Kos Putri nyaman...",
];

const DEFAULT_PLACEHOLDER = "Cari nama properti, kampus, atau daerah...";

function subscribeReducedMotion(callback) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function RoleAdaptiveCTA({ isAuthenticated, user }) {
  if (isAuthenticated && user) {
    if (user.role === "PEMILIK_KOS") {
      return (
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/owner/dashboard"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-xl text-sm font-bold bg-[#1D4ED8] hover:bg-[#1E40AF] active:scale-[0.97] text-white transition-[background-color,transform] shadow-sm touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
          >
            <span>Buka Dashboard Pemilik</span>
            <svg
              aria-hidden="true"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      );
    }

    if (user.role === "ADMIN") {
      return (
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-xl text-sm font-bold bg-[#1D4ED8] hover:bg-[#1E40AF] active:scale-[0.97] text-white transition-[background-color,transform] shadow-sm touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
          >
            <span>Buka Panel Admin</span>
            <svg
              aria-hidden="true"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Link
          href="/kos"
          className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-xl text-sm font-bold bg-[#1D4ED8] hover:bg-[#1E40AF] active:scale-[0.97] text-white transition-[background-color,transform] shadow-sm touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          <span>Jelajahi Katalog</span>
          <svg
            aria-hidden="true"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
        <Link
          href="/bookings"
          className="inline-flex items-center justify-center min-h-[48px] px-5 py-3 rounded-xl text-sm font-semibold bg-[#FFFFFF] hover:bg-[#EEF2F7] active:scale-[0.97] text-[#0F172A] border border-[#CBD5E1] hover:border-[#94A3B8] transition-[background-color,border-color,transform] touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          Booking Saya
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3 pt-1">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/auth/register"
          className="inline-flex items-center justify-center min-h-[48px] px-6 py-3 rounded-xl text-sm font-bold bg-[#1D4ED8] hover:bg-[#1E40AF] active:scale-[0.97] text-white transition-[background-color,transform] shadow-sm touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          Daftar Akun
        </Link>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center min-h-[48px] px-6 py-3 rounded-xl text-sm font-semibold bg-[#FFFFFF] hover:bg-[#EEF2F7] active:scale-[0.97] text-[#0F172A] border border-[#CBD5E1] hover:border-[#94A3B8] transition-[background-color,border-color,transform] touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          Masuk
        </Link>
      </div>

      <p className="text-sm text-[#475569]">
        Pemilik properti kos?{" "}
        <Link
          href="/auth/register?role=PEMILIK_KOS"
          className="inline-flex items-center gap-1 font-semibold text-[#1D4ED8] hover:text-[#1E40AF] underline-offset-4 hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] rounded"
        >
          <span>Bergabung bersama kami</span>
          <svg
            aria-hidden="true"
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      </p>
    </div>
  );
}

export default function HeroSection({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
}) {
  const { user, isAuthenticated } = useAuth();
  const [isFocused, setIsFocused] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const shouldAnimatePlaceholder =
    !isFocused && !searchQuery && !prefersReducedMotion;

  useEffect(() => {
    if (!shouldAnimatePlaceholder) return undefined;

    const currentPhrase = TYPEWRITER_QUERIES[phraseIndex];
    let delay = isDeleting ? 35 : 65;

    if (!isDeleting && charIndex === currentPhrase.length) {
      delay = 1600;
    } else if (isDeleting && charIndex === 0) {
      delay = 320;
    }

    const timer = window.setTimeout(() => {
      if (!isDeleting && charIndex < currentPhrase.length) {
        setCharIndex((prev) => prev + 1);
      } else if (!isDeleting && charIndex === currentPhrase.length) {
        setIsDeleting(true);
      } else if (isDeleting && charIndex > 0) {
        setCharIndex((prev) => prev - 1);
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % TYPEWRITER_QUERIES.length);
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [shouldAnimatePlaceholder, phraseIndex, charIndex, isDeleting]);

  const activePlaceholder = shouldAnimatePlaceholder
    ? TYPEWRITER_QUERIES[phraseIndex].slice(0, charIndex)
    : DEFAULT_PLACEHOLDER;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <section className="relative bg-[#F5F7FA] pt-28 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-x-clip">
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column: Copy, Typewriter Search, Quick Tags, Role-Adaptive CTA */}
        <div className="lg:col-span-7 flex flex-col items-start gap-6">
          <div className="flex flex-col gap-3.5">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-[1.08] max-w-xl text-balance">
              Hunian Nyaman Dekat Kampus
            </h1>
            <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-xl text-pretty">
              Temukan kamar kos terverifikasi admin dengan perhitungan radius
              kampus yang akurat, foto asli, dan status kamar real-time.
            </p>
          </div>

          {/* Typewriter Search Bar */}
          <div className="w-full max-w-2xl">
            <search>
              <form
                action="/kos"
                method="GET"
                onSubmit={handleSubmit}
                className="relative flex items-center bg-[#FFFFFF] ring-1 ring-[#CBD5E1] shadow-sm rounded-2xl p-1.5 sm:p-2 transition-colors focus-within:ring-2 focus-within:ring-[#1D4ED8]"
              >
                <div className="pl-3 sm:pl-4 text-[#1D4ED8] flex items-center pointer-events-none">
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                </div>

                <label htmlFor="hero-search-input" className="sr-only">
                  Cari kos berdasarkan nama properti, kampus, atau daerah
                </label>
                <input
                  id="hero-search-input"
                  name="lokasi"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={activePlaceholder}
                  enterKeyHint="search"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="w-full min-h-[48px] bg-transparent px-3 sm:px-3.5 py-2.5 text-base text-[#0F172A] placeholder-[#64748B] font-medium focus:outline-none"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center mr-1 text-[#64748B] hover:text-[#0F172A] rounded-lg cursor-pointer transition-colors touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
                    aria-label="Hapus kata kunci"
                  >
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-4 sm:px-5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] active:scale-[0.97] text-white font-bold text-sm shrink-0 transition-[background-color,transform] cursor-pointer touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
                  aria-label="Cari Kos Sekarang"
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Cari</span>
                </button>
              </form>
            </search>

            {/* Popular Search Chips + Nearby Link */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-[#475569] mr-1">
                Pencarian Populer:
              </span>
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    if (onSearchSubmit) onSearchSubmit(tag);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#FFFFFF] hover:bg-[#EEF2F7] text-[#475569] hover:text-[#0F172A] border border-[#CBD5E1] hover:border-[#1D4ED8]/50 transition-colors cursor-pointer touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
                >
                  {tag}
                </button>
              ))}
              <Link
                href="/kos/nearby"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#EFF6FF] hover:bg-[#1D4ED8] text-[#1D4ED8] hover:text-white border border-[#BFDBFE] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
              >
                Cari Radius Kampus
              </Link>
            </div>
          </div>

          {/* Role-Adaptive Account CTA Block */}
          <RoleAdaptiveCTA isAuthenticated={isAuthenticated} user={user} />
        </div>

        {/* Right Column: Auto-Scrolling Kos Card Marquee */}
        <div className="lg:col-span-5 min-w-0">
          <HeroKosMarquee />
        </div>
      </div>
    </section>
  );
}
