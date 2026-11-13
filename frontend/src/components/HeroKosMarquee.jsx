"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { featuredKos } from "../data/mockKos";

const TIPE_BADGE_STYLES = {
  Putra: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  Putri: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Campur: "bg-slate-700/70 text-slate-200 border-slate-600/70",
};

function MarqueeKosCard({ kos, isDuplicate = false }) {
  const badgeStyle =
    TIPE_BADGE_STYLES[kos.tipe] || TIPE_BADGE_STYLES.Campur;
  const targetHref = kos.lokasi
    ? `/kos?lokasi=${encodeURIComponent(kos.lokasi)}`
    : "/kos";

  return (
    <Link
      href={targetHref}
      tabIndex={isDuplicate ? -1 : undefined}
      className="group w-[264px] sm:w-[288px] shrink-0 snap-start rounded-2xl bg-[#141D30] border border-slate-800 hover:border-[#10B981]/60 overflow-hidden flex flex-col transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10B981]"
    >
      <div className="relative h-40 w-full overflow-hidden bg-slate-900">
        <Image
          src={kos.gambar || "/images/kamarKos2.webp"}
          alt={isDuplicate ? "" : kos.nama}
          width={320}
          height={200}
          unoptimized
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Neutral scrim over kos photo for top badge contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#141D30] via-[#141D30]/15 to-transparent" /* taste-skill-ignore */
        />

        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}
        >
          Kos {kos.tipe}
        </span>

        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium bg-[#0A0F1D]/85 text-[#F1F5F9] border border-slate-700/80 tabular-nums">
          Sisa {kos.sisaKamar} kamar
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#F1F5F9] group-hover:text-[#10B981] transition-colors line-clamp-1">
            {kos.nama}
          </h3>
          <p className="mt-1 text-xs text-[#94A3B8] line-clamp-1">
            {kos.lokasi}
          </p>

          <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-[#94A3B8]">
              <svg
                aria-hidden="true"
                className="w-3.5 h-3.5 text-[#10B981] shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
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
              <span className="line-clamp-1">{kos.jarak}</span>
            </span>

            <span className="inline-flex items-center gap-1 font-semibold text-[#10B981] shrink-0 tabular-nums">
              <svg
                aria-hidden="true"
                className="w-3.5 h-3.5 fill-[#10B981]"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {kos.rating}
            </span>
          </div>
        </div>

        <div className="pt-2 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-[#F1F5F9] tabular-nums">
              {kos.harga}
            </span>
            <span className="text-xs text-[#94A3B8]">{kos.periode}</span>
          </div>
          <span className="text-xs font-semibold text-[#10B981] group-hover:translate-x-0.5 transition-transform">
            Lihat
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HeroKosMarquee({ items = featuredKos }) {
  const [isPaused, setIsPaused] = useState(false);

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-[#10B981]"
          />
          <h2 className="text-xs font-semibold tracking-wide text-[#94A3B8]">
            Hunian Pilihan Sekitar Kampus
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            className="hero-marquee-pause-btn items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#141D30] hover:bg-slate-800 text-[#94A3B8] hover:text-[#F1F5F9] border border-slate-700/80 transition-colors cursor-pointer touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10B981]"
          >
            {isPaused ? (
              <>
                <svg
                  aria-hidden="true"
                  className="w-3 h-3 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                <span>Putar</span>
              </>
            ) : (
              <>
                <svg
                  aria-hidden="true"
                  className="w-3 h-3 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                </svg>
                <span>Jeda</span>
              </>
            )}
          </button>

          <Link
            href="/kos"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#10B981] hover:text-emerald-300 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10B981] rounded"
          >
            <span>Semua Katalog</span>
            <svg
              aria-hidden="true"
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </div>

      <div
        className="hero-marquee-viewport relative rounded-2xl p-1 -m-1"
        aria-label="Etalase kos pilihan sekitar kampus"
      >
        {/* Left and right marquee edge fade masks matching #0A0F1D ground */}
        <div
          aria-hidden="true"
          className="hero-marquee-fade pointer-events-none absolute inset-y-0 left-0 z-10 w-8 sm:w-12 bg-gradient-to-r from-[#0A0F1D] to-transparent" /* taste-skill-ignore */
        />
        <div
          aria-hidden="true"
          className="hero-marquee-fade pointer-events-none absolute inset-y-0 right-0 z-10 w-8 sm:w-12 bg-gradient-to-l from-[#0A0F1D] to-transparent" /* taste-skill-ignore */
        />

        <div
          data-paused={isPaused ? "true" : "false"}
          className="hero-marquee-track hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] py-1"
        >
          <div className="flex items-stretch gap-4 pr-4 shrink-0">
            {items.map((kos) => (
              <MarqueeKosCard key={kos.id} kos={kos} />
            ))}
          </div>

          <div
            aria-hidden="true"
            className="hero-marquee-duplicate flex items-stretch gap-4 pr-4 shrink-0"
          >
            {items.map((kos) => (
              <MarqueeKosCard key={`dup-${kos.id}`} kos={kos} isDuplicate />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-[#94A3B8]">
        Arahkan kursor atau pilih kartu untuk meninjau detail kos di katalog.
      </p>
    </div>
  );
}
