"use client";

import Link from "next/link";

export default function PlaceholderPage({
  title,
  route,
  assignedTo,
  domain,
  endpoints = [],
  description = "",
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 selection:bg-amber-400 selection:text-neutral-950">
      <div className="max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Accent Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-neutral-800 pb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Halaman Dalam Pengerjaan
            </span>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-800 text-neutral-200 border border-neutral-700">
            Penanggung Jawab: {assignedTo}
          </span>
        </div>

        {/* Title & Route */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          {title}
        </h1>
        <p className="font-mono text-xs sm:text-sm text-neutral-400 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 inline-block mb-4">
          Rute: {route}
        </p>

        {/* Domain & Description */}
        <div className="space-y-4 text-sm text-neutral-300 mb-6 leading-relaxed">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
              Domain Modul
            </span>
            <p className="font-medium text-neutral-200">{domain}</p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
              Rencana Fitur & Tugas
            </span>
            <p className="text-neutral-400 text-xs sm:text-sm">{description}</p>
          </div>

          {/* Endpoints */}
          {endpoints.length > 0 && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1.5">
                Endpoint API Terkait
              </span>
              <div className="flex flex-wrap gap-1.5">
                {endpoints.map((ep, i) => (
                  <span
                    key={i}
                    className="font-mono text-[11px] bg-neutral-950 text-amber-300/90 px-2.5 py-1 rounded border border-neutral-800"
                  >
                    {ep}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="pt-6 border-t border-neutral-800 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-semibold text-neutral-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1.5"
          >
            ← Kembali ke Beranda
          </Link>
          <span className="text-[11px] text-neutral-400">
            CariKos Platform Web
          </span>
        </div>
      </div>
    </div>
  );
}
