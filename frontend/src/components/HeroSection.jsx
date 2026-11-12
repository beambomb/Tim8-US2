"use client";

import Image from "next/image";
import { quickTags } from "../data/mockKos";

export default function HeroSection({ searchQuery, setSearchQuery, onSearchSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <section className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/kamarKos2.webp"
          alt="Interior Kamar Kos Nyaman dan Rapi"
          fill
          priority
          unoptimized
          className="object-cover object-center transform scale-100 filter brightness-105 contrast-100"
        />
        {/* Soft scrim: lets photo brightness shine through while preserving text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-black/15 to-neutral-950/50" />
      </div>

      {/* Hero Content (Centered Stage) */}
      <div className="relative z-10 max-w-4xl mx-auto w-full text-center flex flex-col items-center gap-6 sm:gap-7">
        {/* Headline */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
            Hunian Nyaman Dekat Kampus
          </h1>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-neutral-100 font-medium leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
            Pilihan kos terverifikasi dengan fasilitas lengkap, lokasi strategis, dan harga ramah mahasiswa
          </p>
        </div>

        {/* Wide Rounded Pill Search Bar */}
        <div className="w-full max-w-3xl mt-2">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center bg-white rounded-full p-1.5 sm:p-2 shadow-2xl shadow-black/60 transition-all duration-300 focus-within:ring-4 focus-within:ring-amber-400/40"
          >
            {/* Map Pin / Location Icon */}
            <div className="pl-4 sm:pl-5 text-neutral-400 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-400"
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

            {/* Text Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama properti / alamat / daerah"
              className="w-full bg-transparent px-3 sm:px-4 py-2 sm:py-3 text-neutral-900 placeholder-neutral-400 text-sm sm:text-base font-medium focus:outline-none"
            />

            {/* Clear button if text entered */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 mr-1 text-neutral-400 hover:text-neutral-700 rounded-full cursor-pointer"
                aria-label="Hapus kata kunci"
              >
                <svg
                  className="w-4 h-4"
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
              </button>
            )}

            {/* Bright Yellow Circular Search Button */}
            <button
              type="submit"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-neutral-950 flex items-center justify-center shrink-0 shadow-md transition-all cursor-pointer"
              aria-label="Cari Kos Sekarang"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5 sm:w-6 sm:h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>
          </form>

          {/* Quick Filter Search Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-neutral-400 font-medium mr-1">
              Pencarian Populer:
            </span>
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchQuery(tag)}
                className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-900/70 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 hover:border-amber-400/40 backdrop-blur-sm transition-all cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
