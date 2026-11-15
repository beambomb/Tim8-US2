"use client";

import { useState } from "react";
import Link from "next/link";
import KosCard from "./KosCard";
import { featuredKos } from "../data/mockKos";

export default function FeaturedCatalog({ favorites, toggleFavorite }) {
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const filteredList = featuredKos.filter(
    (item) => selectedCategory === "Semua" || item.tipe === selectedCategory
  );

  return (
    <section id="katalog" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4" data-reveal="0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
            Rekomendasi Kos Sekitar Kampus
          </h2>
          <p className="text-base text-[#475569] mt-1.5 max-w-xl">
            Setiap properti telah diperiksa dan diverifikasi oleh Administrator sebelum tampil secara publik.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {["Semua", "Putra", "Putri", "Campur"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#1D4ED8] text-white"
                  : "bg-[#EEF2F7] text-[#334155] hover:text-[#0F172A] hover:bg-[#E2E8F0]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Kos Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredList.map((kos, idx) => (
          <div key={kos.id} data-reveal={String((idx % 3) * 80)}>
            <KosCard
              kos={kos}
              isFavorite={!!favorites[kos.id]}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        ))}
      </div>

      {/* Browse Full Catalog & Nearby CTAs */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3" data-reveal="0">
        <Link
          href="/kos"
          className="w-full sm:w-auto text-center px-6 py-3 rounded-full text-sm font-semibold bg-[#1D4ED8] text-white hover:bg-[#1E40AF] transition-colors"
        >
          Lihat Semua Katalog Kos
        </Link>
        <Link
          href="/kos/nearby"
          className="w-full sm:w-auto text-center px-6 py-3 rounded-full text-sm font-semibold bg-[#EEF2F7] text-[#0F172A] hover:text-[#1D4ED8] hover:bg-[#E2E8F0] transition-colors"
        >
          Cari Kos Terdekat Kampus
        </Link>
      </div>
    </section>
  );
}

