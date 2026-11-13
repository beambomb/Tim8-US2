'use client';

import Link from 'next/link';

export default function KosCardReal({ kos }) {
  if (!kos) return null;

  const {
    _id,
    nama,
    harga = 0,
    lokasi = '',
    tipe = 'Campur',
    fasilitas = [],
    jumlahKamarTersedia = 0,
    fotoUrls = [],
    jarakKm,
    jarakMeter,
  } = kos;

  const displayImage = fotoUrls && fotoUrls.length > 0 ? fotoUrls[0] : '/images/kamarKos2.webp';

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(harga);

  // Type badge color styling (Slate/Sky or Emerald based on type)
  const getTypeBadgeClass = (t) => {
    switch (t) {
      case 'Putra':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'Putri':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      case 'Campur':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const isAvailable = Number(jumlahKamarTersedia) > 0;

  return (
    <article className="group flex flex-col rounded-xl bg-[#141D30] border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-200 overflow-hidden">
      {/* Photo Frame */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImage}
          alt={nama}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D]/80 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-medium border backdrop-blur-md ${getTypeBadgeClass(
              tipe
            )}`}
          >
            Kos {tipe}
          </span>

          <span
            className={`px-2.5 py-1 rounded-md text-xs font-medium border backdrop-blur-md ${
              isAvailable
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800/90 text-slate-400 border-slate-700/60'
            }`}
          >
            {isAvailable ? `Sisa ${jumlahKamarTersedia} Kamar` : 'Kamar Penuh'}
          </span>
        </div>

        {/* Distance Badge (if geospatial data present) */}
        {(jarakKm !== undefined || jarakMeter !== undefined) && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0A0F1D]/90 border border-slate-700 text-xs text-[#F1F5F9] font-medium backdrop-blur-md">
            <svg
              className="w-3.5 h-3.5 text-[#10B981]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>
              {jarakKm !== undefined
                ? `${jarakKm} km`
                : `${jarakMeter} m`}
            </span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#F1F5F9] line-clamp-1 group-hover:text-[#10B981] transition-colors">
            {nama}
          </h3>

          <p className="mt-1 flex items-center gap-1.5 text-xs text-[#94A3B8] line-clamp-1">
            <svg
              className="w-3.5 h-3.5 shrink-0 text-[#64748B]"
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
            <span>{lokasi}</span>
          </p>

          {/* Facility Chips */}
          {fasilitas && fasilitas.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {fasilitas.slice(0, 3).map((f, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/50"
                >
                  {f}
                </span>
              ))}
              {fasilitas.length > 3 && (
                <span className="px-1.5 py-0.5 rounded text-[11px] font-medium text-[#64748B]">
                  +{fasilitas.length - 3} lainnya
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#94A3B8] block">Mulai dari</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-[#F1F5F9] tracking-tight">
                {formattedPrice}
              </span>
              <span className="text-xs text-[#64748B]">/bln</span>
            </div>
          </div>

          <Link
            href={`/kos/${_id}`}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-[#10B981] hover:text-[#0A0F1D] border border-emerald-500/30 transition-colors"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </article>
  );
}
