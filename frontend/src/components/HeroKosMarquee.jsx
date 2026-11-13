"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { featuredKos } from "../data/mockKos";

const AUTO_SCROLL_PX_PER_SEC = 38;
const CARD_STEP_PX = 304; // 288px card + 16px gap

const TIPE_BADGE_STYLES = {
  Putra: "bg-white/95 text-sky-800 border-sky-200 shadow-xs",
  Putri: "bg-white/95 text-rose-700 border-rose-200 shadow-xs",
  Campur: "bg-white/95 text-slate-800 border-slate-200 shadow-xs",
};

function MarqueeKosCard({ kos, slideIndex, totalSlides, isDuplicate = false }) {
  const badgeStyle =
    TIPE_BADGE_STYLES[kos.tipe] || TIPE_BADGE_STYLES.Campur;
  const targetHref = kos.lokasi
    ? `/kos?lokasi=${encodeURIComponent(kos.lokasi)}`
    : "/kos";

  return (
    <div
      role={isDuplicate ? undefined : "group"}
      aria-roledescription={isDuplicate ? undefined : "slide"}
      aria-label={isDuplicate ? undefined : `${slideIndex + 1} dari ${totalSlides}: ${kos.nama}`}
      className="w-[264px] sm:w-[288px] shrink-0"
    >
      <Link
        href={targetHref}
        tabIndex={isDuplicate ? -1 : undefined}
        draggable={false}
        className="group h-full rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#1D4ED8]/60 shadow-xs hover:shadow-md overflow-hidden flex flex-col transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
      >
        <div className="relative h-40 w-full overflow-hidden bg-[#EEF2F7]">
          <Image
            src={kos.gambar || "/images/kamarKos2.webp"}
            alt={isDuplicate ? "" : kos.nama}
            width={320}
            height={200}
            unoptimized
            draggable={false}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Subtle top scrim over kos photo for pill contrast */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent" /* taste-skill-ignore */
          />

          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${badgeStyle}`}
          >
            Kos {kos.tipe}
          </span>

          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium bg-[#0F172A]/80 text-white backdrop-blur-sm tabular-nums">
            Sisa {kos.sisaKamar} kamar
          </span>
        </div>

        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#1D4ED8] transition-colors line-clamp-1">
              {kos.nama}
            </h3>
            <p className="mt-1 text-xs text-[#475569] line-clamp-1">
              {kos.lokasi}
            </p>

            <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-[#475569]">
                <svg
                  aria-hidden="true"
                  className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0"
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

              <span className="inline-flex items-center gap-1 font-semibold text-[#1D4ED8] shrink-0 tabular-nums">
                <svg
                  aria-hidden="true"
                  className="w-3.5 h-3.5 fill-[#1D4ED8]"
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
              <span className="text-base font-extrabold text-[#0F172A] tabular-nums">
                {kos.harga}
              </span>
              <span className="text-xs text-[#64748B]">{kos.periode}</span>
            </div>
            <span className="text-xs font-semibold text-[#1D4ED8] group-hover:translate-x-0.5 transition-transform">
              Lihat
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function HeroKosMarquee({ items = featuredKos }) {
  const viewportRef = useRef(null);
  const pausedRef = useRef(false);
  const draggingRef = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  const suppressClickRef = useRef(false);
  const resumeTimerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || items.length === 0) return undefined;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let rafId = null;
    let lastTime = performance.now();

    const step = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!mediaQuery.matches && !pausedRef.current && !draggingRef.current.active) {
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth > el.clientWidth) {
          el.scrollLeft += AUTO_SCROLL_PX_PER_SEC * dt;
          if (el.scrollLeft >= halfWidth) {
            el.scrollLeft -= halfWidth;
          }
        }
      }

      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);

    const onWindowPointerUp = () => {
      if (!draggingRef.current.active) return;
      draggingRef.current.active = false;
      setIsDragging(false);
      if (suppressClickRef.current) {
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      }
    };

    window.addEventListener("pointerup", onWindowPointerUp);
    window.addEventListener("pointercancel", onWindowPointerUp);

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
      window.removeEventListener("pointerup", onWindowPointerUp);
      window.removeEventListener("pointercancel", onWindowPointerUp);
    };
  }, [items.length]);

  if (!items || items.length === 0) return null;

  const temporarilyPauseForManualScroll = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      if (!viewportRef.current?.matches(":hover") && !viewportRef.current?.matches(":focus-within")) {
        pausedRef.current = false;
      }
    }, 900);
  };

  const handleStep = (direction) => {
    const el = viewportRef.current;
    if (!el) return;

    temporarilyPauseForManualScroll();
    const halfWidth = el.scrollWidth / 2;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = prefersReduced ? "auto" : "smooth";

    if (direction === "prev") {
      if (el.scrollLeft < CARD_STEP_PX && halfWidth > el.clientWidth) {
        el.scrollLeft += halfWidth;
      }
      el.scrollBy({ left: -CARD_STEP_PX, behavior });
      setStatusMessage("Menggeser ke pilihan kos sebelumnya");
    } else {
      if (halfWidth > el.clientWidth && el.scrollLeft + CARD_STEP_PX >= halfWidth) {
        el.scrollLeft -= halfWidth;
      }
      el.scrollBy({ left: CARD_STEP_PX, behavior });
      setStatusMessage("Menggeser ke pilihan kos berikutnya");
    }
  };

  const handlePointerDown = (e) => {
    if (e.pointerType === "touch" || e.button !== 0) return;
    const el = viewportRef.current;
    if (!el) return;

    draggingRef.current = {
      active: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: false,
    };
    suppressClickRef.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current.active) return;
    const el = viewportRef.current;
    if (!el) return;

    const deltaX = e.clientX - draggingRef.current.startX;
    if (Math.abs(deltaX) > 6) {
      draggingRef.current.moved = true;
      suppressClickRef.current = true;
    }

    if (draggingRef.current.moved) {
      const halfWidth = el.scrollWidth / 2;
      let nextScroll = draggingRef.current.startScroll - deltaX;

      if (halfWidth > el.clientWidth) {
        if (nextScroll < 0) {
          draggingRef.current.startScroll += halfWidth;
          nextScroll += halfWidth;
        } else if (nextScroll >= halfWidth) {
          draggingRef.current.startScroll -= halfWidth;
          nextScroll -= halfWidth;
        }
      }
      el.scrollLeft = nextScroll;
    }
  };

  const handlePointerUpOrCancel = () => {
    if (!draggingRef.current.active) return;
    draggingRef.current.active = false;
    setIsDragging(false);
    if (suppressClickRef.current) {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  const handleClickCapture = (e) => {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClickRef.current = false;
    }
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Etalase kos pilihan sekitar kampus"
      className="group/marquee relative w-full"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        draggingRef.current.active = false;
        setIsDragging(false);
        pausedRef.current = false;
      }}
      onFocusCapture={() => {
        pausedRef.current = true;
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          pausedRef.current = false;
        }
      }}
    >
      {/* Left/Right Navigation Controls before the track in DOM order */}
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-1 sm:px-2">
        <button
          type="button"
          onClick={() => handleStep("prev")}
          aria-label="Geser ke kos sebelumnya"
          className="pointer-events-auto w-9 h-9 rounded-full bg-[#FFFFFF]/95 hover:bg-[#FFFFFF] border border-[#CBD5E1] hover:border-[#1D4ED8] text-[#0F172A] hover:text-[#1D4ED8] shadow-md flex items-center justify-center transition-all cursor-pointer touch-manipulation opacity-90 sm:opacity-0 sm:group-hover/marquee:opacity-100 sm:group-focus-within/marquee:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          <svg
            aria-hidden="true"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => handleStep("next")}
          aria-label="Geser ke kos berikutnya"
          className="pointer-events-auto w-9 h-9 rounded-full bg-[#FFFFFF]/95 hover:bg-[#FFFFFF] border border-[#CBD5E1] hover:border-[#1D4ED8] text-[#0F172A] hover:text-[#1D4ED8] shadow-md flex items-center justify-center transition-all cursor-pointer touch-manipulation opacity-90 sm:opacity-0 sm:group-hover/marquee:opacity-100 sm:group-focus-within/marquee:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          <svg
            aria-hidden="true"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <div className="rounded-2xl has-[>.hero-marquee-viewport:focus-visible]:outline-2 has-[>.hero-marquee-viewport:focus-visible]:outline-offset-2 has-[>.hero-marquee-viewport:focus-visible]:outline-[#1D4ED8]">
        <div
          ref={viewportRef}
          tabIndex={0}
          role="group"
          aria-label="Daftar kartu kos"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUpOrCancel}
          onPointerCancel={handlePointerUpOrCancel}
          onClickCapture={handleClickCapture}
          className={`hero-marquee-viewport hero-marquee-mask relative rounded-2xl py-1 select-none focus:outline-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <div className="hero-marquee-track py-1">
            <div className="flex items-stretch gap-4 pr-4 shrink-0">
              {items.map((kos, idx) => (
                <MarqueeKosCard
                  key={kos.id}
                  kos={kos}
                  slideIndex={idx}
                  totalSlides={items.length}
                />
              ))}
            </div>

            <div
              aria-hidden="true"
              className="hero-marquee-duplicate flex items-stretch gap-4 pr-4 shrink-0"
            >
              {items.map((kos, idx) => (
                <MarqueeKosCard
                  key={`dup-${kos.id}`}
                  kos={kos}
                  slideIndex={idx}
                  totalSlides={items.length}
                  isDuplicate
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {statusMessage}
      </p>
    </section>
  );
}
