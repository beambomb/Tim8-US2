"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturedCatalog from "../components/FeaturedCatalog";
import ValueProps from "../components/ValueProps";
import OwnerCTA from "../components/OwnerCTA";
import Footer from "../components/Footer";
import SupportButton from "../components/SupportButton";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSearchSubmit = (query) => {
    const trimmed = (query || "").trim();
    router.push(trimmed ? `/kos?lokasi=${encodeURIComponent(trimmed)}` : "/kos");
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-[#F1F5F9] flex flex-col font-sans relative selection:bg-[#10B981] selection:text-[#0A0F1D]">
      <Navbar />
      <main className="flex-1 overflow-x-clip">
        <HeroSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
        />
        <FeaturedCatalog
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
        <ValueProps />
        <OwnerCTA />
      </main>
      <Footer />
      <SupportButton />
    </div>
  );
}
