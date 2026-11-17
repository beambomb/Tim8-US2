"use client";

import { useState } from "react";
import Link from "next/link";
import KosCard from "./KosCard";
import { featuredKos } from "../data/mockKos";

export default function FeaturedCatalog({
  items = featuredKos,
  favorites,
  toggleFavorite,
}) {
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const filteredList = (items || featuredKos)
    .filter(
      (item) => selectedCategory === "Semua" || item.tipe === selectedCategory
    )
    .slice(0, 9);

  return (
    <section id="katalog" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4" data-reveal="0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
            Jelajahi Kos
          </h2>
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

      {/* Browse Full Catalog CTA */}
      <div className="mt-10 flex justify-center" data-reveal="0">
        <Link
          href="/kos"
          className="w-full sm:w-auto text-center px-6 py-3 rounded-full text-sm font-semibold bg-[#1D4ED8] text-white hover:bg-[#1E40AF] transition-colors"
        >
          Katalog Kos
        </Link>
      </div>
    </section>
  );
}

