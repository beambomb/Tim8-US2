"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturedCatalog from "../components/FeaturedCatalog";
import ValueProps from "../components/ValueProps";
import FaqSection from "../components/FaqSection";
import OwnerCTA from "../components/OwnerCTA";
import Footer from "../components/Footer";
import SupportButton from "../components/SupportButton";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    ) {
      return undefined;
    }

    const targets = [...document.querySelectorAll("[data-reveal]")];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el.dataset.revealed === "1") return;
          el.dataset.revealed = "1";
          const delay = Number(el.dataset.reveal || 0);
          el.animate?.(
            [
              { opacity: 0.01, transform: "translateY(18px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            {
              duration: 620,
              delay,
              easing: "cubic-bezier(.16,1,.3,1)",
              fill: "both",
            }
          );
          observer.unobserve(el);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
    <div className="min-h-dvh bg-[#F5F7FA] text-[#0F172A] flex flex-col font-sans relative selection:bg-[#1D4ED8] selection:text-white">
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
        <FaqSection />
        <OwnerCTA />
      </main>
      <Footer />
      <SupportButton />
    </div>
  );
}
