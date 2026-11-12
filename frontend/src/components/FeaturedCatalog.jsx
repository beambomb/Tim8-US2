"use client";

import { useState } from "react";
import KosCard from "./KosCard";
import { featuredKos } from "../data/mockKos";

export default function FeaturedCatalog({ favorites, toggleFavorite }) {
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const filteredList = featuredKos.filter(
    (item) => selectedCategory === "Semua" || item.tipe === selectedCategory
  );

  return (
    <section id="katalog" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            Katalog Pilihan
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Rekomendasi Kos Sekitar Kampus
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl">
            Setiap properti telah diperiksa dan diverifikasi oleh Administrator sebelum tampil secara publik.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {["Semua", "Putra", "Putri", "Campur"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20"
                  : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Kos Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredList.map((kos) => (
          <KosCard
            key={kos.id}
            kos={kos}
            isFavorite={!!favorites[kos.id]}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}

