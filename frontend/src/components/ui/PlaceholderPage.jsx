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
    <div className="min-h-dvh bg-[#F5F7FA] text-[#0F172A] flex flex-col items-center justify-center p-6">
      <main className="max-w-2xl w-full bg-[#FFFFFF] rounded-2xl p-8 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FFFBEB] px-3 py-1 text-xs font-semibold text-[#92400E]">
            Halaman dalam pengerjaan
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2F7] text-[#475569]">
            Penanggung jawab: {assignedTo}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight mb-3">
          {title}
        </h1>
        <p className="text-sm font-medium text-[#475569] bg-[#F5F7FA] px-3.5 py-2 rounded-lg inline-block mb-6">
          Rute: {route}
        </p>

        <div className="space-y-5 text-sm text-[#475569] mb-8 leading-relaxed">
          <div>
            <p className="text-xs font-semibold text-[#475569] mb-1">
              Domain modul
            </p>
            <p className="font-medium text-[#0F172A]">{domain}</p>
          </div>

          {description && (
            <div>
              <p className="text-xs font-semibold text-[#475569] mb-1">
                Rencana fitur dan tugas
              </p>
              <p className="text-[#475569] text-sm">{description}</p>
            </div>
          )}

          {endpoints.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#475569] mb-2">
                Endpoint API terkait
              </p>
              <div className="flex flex-wrap gap-2">
                {endpoints.map((ep, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium bg-[#EEF2F7] text-[#0F172A] px-2.5 py-1 rounded-md"
                  >
                    {ep}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-semibold text-[#1D4ED8] hover:text-[#1E40AF] transition-colors inline-flex items-center gap-1.5"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            <span>Kembali ke Beranda</span>
          </Link>
          <span className="text-xs text-[#64748B]">CariKos Platform Web</span>
        </div>
      </main>
    </div>
  );
}
