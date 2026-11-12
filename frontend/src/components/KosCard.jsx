"use client";

import Image from "next/image";

export default function KosCard({ kos, isFavorite, onToggleFavorite }) {
  return (
    <article className="group rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50">
      {/* Kos Image & Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-800">
        <Image
          src={kos.gambar || "/images/kamarKos2.webp"}
          alt={kos.nama}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />

        {/* Top-Left: Rooms Left Badge (Clean neutral styling) */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-950/75 border border-white/10 text-neutral-300 backdrop-blur-md">
            Sisa {kos.sisaKamar} Kamar
          </span>
        </div>

        {/* Top-Right: Favorite Toggle Button */}
        <button
          type="button"
          onClick={() => onToggleFavorite(kos.id)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-neutral-950/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:text-amber-400 hover:scale-110 transition-all cursor-pointer"
          aria-label="Simpan ke favorit"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isFavorite ? "#F59E0B" : "none"}
            stroke="currentColor"
            strokeWidth={isFavorite ? 0 : 2}
            className="w-5 h-5 transition-colors"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>

        {/* Distance Pill Bottom Left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-neutral-200 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md">
          <svg
            className="w-3.5 h-3.5 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          <span>{kos.jarak}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          {/* Label Kos (Putra / Putri / Campur) & Rating row above the main name */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-neutral-800 text-neutral-200 border border-neutral-700/60">
              Kos {kos.tipe}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
              <svg
                className="w-4 h-4 fill-amber-400"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{kos.rating}</span>
              <span className="text-neutral-500 font-normal">
                ({kos.ulasanCount})
              </span>
            </div>
          </div>

          {/* Main Kos Name */}
          <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
            {kos.nama}
          </h3>

          <p className="text-xs text-neutral-400 flex items-center gap-1.5 line-clamp-1 mt-1.5">
            {kos.lokasi}
          </p>

          {/* Facility Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {kos.fasilitas.map((f, i) => (
              <span
                key={i}
                className="text-[11px] font-medium bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Card Bottom / Price & Action */}
        <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 block font-normal">
              Harga Sewa
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-white">
                {kos.harga}
              </span>
              <span className="text-xs text-neutral-400">
                {kos.periode}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-amber-400 text-neutral-950 transition-colors cursor-pointer"
          >
            Lihat Kamar
          </button>
        </div>
      </div>
    </article>
  );
}
