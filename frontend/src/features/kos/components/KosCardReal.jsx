'use client';

import Link from 'next/link';

export default function KosCardReal({
  kos,
  showFavoriteButton = false,
  isFavorited = false,
  onToggleFavorite,
}) {
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
    rating,
    ulasanCount,
  } = kos;

  const displayImage = fotoUrls && fotoUrls.length > 0 ? fotoUrls[0] : '/images/kamarKos2.webp';

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(harga);

  const getTypeBadgeClass = (t) => {
    switch (t) {
      case 'Putra':
        return 'bg-[#EFF6FF] text-[#1E40AF]';
      case 'Putri':
        return 'bg-[#FFF1F2] text-[#9F1239]';
      case 'Campur':
      default:
        return 'bg-[#EEF2F7] text-[#334155]';
    }
  };

  const isAvailable = Number(jumlahKamarTersedia) > 0;
  const hasDistance =
    (jarakMeter !== undefined && jarakMeter !== null) ||
    (jarakKm !== undefined && jarakKm !== null);

  const distanceLabel =
    jarakMeter !== undefined && jarakMeter !== null && Number(jarakMeter) < 1000
      ? `${Math.round(Number(jarakMeter))} m`
      : jarakKm !== undefined && jarakKm !== null
      ? `${jarakKm} km`
      : `${(Number(jarakMeter || 0) / 1000).toFixed(2)} km`;

  return (
    <article className="group flex flex-col rounded-xl bg-[#FFFFFF] transition-colors duration-200 overflow-hidden">
      {/* Photo Frame */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EEF2F7]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImage}
          alt={nama}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Availability Pill */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span
            className={`inline-block px-2.5 py-1 rounded-md text-[13px] font-medium ${
              isAvailable
                ? 'bg-[#0F172A] text-white'
                : 'bg-[#FFFFFF] text-[#475569]'
            }`}
          >
            {isAvailable ? `Sisa ${jumlahKamarTersedia} Kamar` : 'Kamar Penuh'}
          </span>
        </div>

        {/* Optional Favorite Wishlist Button (only for authenticated PENCARI_KOS) */}
        {showFavoriteButton && typeof onToggleFavorite === 'function' && (
          <button
            type="button"
            onClick={() => onToggleFavorite(_id)}
            aria-label={isFavorited ? `Hapus ${nama} dari favorit` : `Simpan ${nama} ke favorit`}
            aria-pressed={isFavorited}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-[#FFFFFF] text-[#0F172A] hover:text-[#1D4ED8] flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill={isFavorited ? '#1D4ED8' : 'none'}
              stroke={isFavorited ? '#1D4ED8' : 'currentColor'}
              strokeWidth={1.75}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>
        )}

        {/* Distance Badge (when geospatial data is present) */}
        {hasDistance && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0F172A] text-[13px] text-white font-medium tabular-nums pointer-events-none">
            <svg
              className="w-3.5 h-3.5 text-[#93C5FD]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
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
            <span>{distanceLabel}</span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`px-2.5 py-0.5 rounded-md text-[13px] font-medium ${getTypeBadgeClass(tipe)}`}
            >
              Kos {tipe}
            </span>

            {rating !== undefined && rating !== null && (
              <div className="flex items-center gap-1 text-[13px] font-semibold text-[#1D4ED8] tabular-nums">
                <svg
                  className="w-3.5 h-3.5 fill-[#1D4ED8]"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{rating}</span>
                {ulasanCount !== undefined && (
                  <span className="text-[#475569] font-normal">({ulasanCount})</span>
                )}
              </div>
            )}
          </div>

          <h3 className="text-base font-semibold text-[#0F172A] line-clamp-1 group-hover:text-[#1D4ED8] transition-colors">
            {nama}
          </h3>

          <p className="mt-1 flex items-center gap-1.5 text-sm text-[#475569] line-clamp-1">
            <svg
              className="w-3.5 h-3.5 shrink-0 text-[#475569]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
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
                  className="px-2 py-0.5 rounded text-[13px] font-medium bg-[#EEF2F7] text-[#334155]"
                >
                  {f}
                </span>
              ))}
              {fasilitas.length > 3 && (
                <span className="px-1.5 py-0.5 rounded text-[13px] font-medium text-[#475569]">
                  +{fasilitas.length - 3} lainnya
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <div>
            <span className="text-[13px] text-[#475569] block">Mulai dari</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-[#0F172A] tracking-tight tabular-nums">
                {formattedPrice}
              </span>
              <span className="text-[13px] text-[#475569]">/bln</span>
            </div>
          </div>

          <Link
            href={`/kos/${_id}`}
            className="px-3.5 py-2 rounded-lg text-[13px] font-semibold bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white transition-colors whitespace-nowrap"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </article>
  );
}
