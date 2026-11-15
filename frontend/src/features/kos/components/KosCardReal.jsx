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

  const displayImage =
    fotoUrls && fotoUrls.length > 0 ? fotoUrls[0] : '/images/kamarKos2.webp';

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(harga);

  const getTypeBadgeClass = (t) => {
    switch (t) {
      case 'Putra':
        return 'bg-[#EFF6FF] text-[var(--accent)]';
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

  const compactFacilities =
    fasilitas && fasilitas.length > 0
      ? `${fasilitas.slice(0, 3).join(' · ')}${
          fasilitas.length > 3 ? ` · +${fasilitas.length - 3}` : ''
        }`
      : 'Fasilitas dasar tersedia';

  return (
    <article className="group flex flex-col rounded-xl bg-[#FFFFFF] transition-colors duration-200 overflow-hidden">
      {/* Photo Frame (16:9 compact ratio, single status pill) */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#EEF2F7]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImage}
          alt={nama}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        <div className="absolute top-2.5 left-2.5 pointer-events-none">
          <span
            className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${
              isAvailable
                ? 'bg-[#0F172A] text-white'
                : 'bg-[#FFFFFF] text-[#475569]'
            }`}
          >
            {isAvailable ? `Sisa ${jumlahKamarTersedia}` : 'Penuh'}
          </span>
        </div>

        {showFavoriteButton && typeof onToggleFavorite === 'function' && (
          <button
            type="button"
            onClick={() => onToggleFavorite(_id)}
            aria-label={
              isFavorited
                ? `Hapus ${nama} dari favorit`
                : `Simpan ${nama} ke favorit`
            }
            aria-pressed={isFavorited}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-[#FFFFFF] text-[#0F172A] hover:text-[var(--accent)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill={isFavorited ? 'var(--accent)' : 'none'}
              stroke={isFavorited ? 'var(--accent)' : 'currentColor'}
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
      </div>

      {/* Compact Content Body */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div className="min-w-0 flex flex-col gap-1">
          {/* Metadata Row: Type + Distance + Rating */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${getTypeBadgeClass(tipe)}`}
              >
                {tipe}
              </span>

              {hasDistance && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] tabular-nums truncate">
                  <svg
                    className="w-3.5 h-3.5 shrink-0"
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
                  {distanceLabel}
                </span>
              )}
            </div>

            {rating !== undefined && rating !== null && (
              <div className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)] tabular-nums shrink-0">
                <svg
                  className="w-3.5 h-3.5 fill-[var(--accent)]"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{rating}</span>
                {ulasanCount !== undefined && (
                  <span className="text-[#475569] font-normal">
                    ({ulasanCount})
                  </span>
                )}
              </div>
            )}
          </div>

          <h3 className="text-[15px] font-semibold text-[#0F172A] truncate group-hover:text-[var(--accent)] transition-colors">
            <Link href={`/kos/${_id}`}>{nama}</Link>
          </h3>

          <p className="flex items-center gap-1 text-xs text-[#475569] min-w-0">
            <svg
              className="w-3.5 h-3.5 shrink-0 text-[#64748B]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
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
            <span className="truncate min-w-0">{lokasi}</span>
          </p>

          <p className="text-xs text-[#64748B] truncate pt-0.5">
            {compactFacilities}
          </p>
        </div>

        {/* Compact Single-Row Footer */}
        <div className="pt-1 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="text-[15px] font-bold text-[#0F172A] tracking-tight tabular-nums truncate">
              {formattedPrice}
            </span>
            <span className="text-xs text-[#475569] shrink-0">/bln</span>
          </div>

          <Link
            href={`/kos/${_id}`}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EFF6FF] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Detail
          </Link>
        </div>
      </div>
    </article>
  );
}
