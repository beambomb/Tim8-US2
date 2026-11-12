"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturedCatalog from "../components/FeaturedCatalog";
import ValueProps from "../components/ValueProps";
import OwnerCTA from "../components/OwnerCTA";
import Footer from "../components/Footer";
import SupportButton from "../components/SupportButton";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSearchSubmit = (query) => {
    const catalogElement = document.getElementById("katalog");
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans relative selection:bg-amber-400 selection:text-neutral-950">
      <Navbar />
      <main className="flex-1">
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
