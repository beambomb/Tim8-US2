"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useFavorites } from "@/features/kos/hooks/useFavorites";
import { useAuth } from "@/context/AuthContext";

export default function FavoritesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { favorites, isLoading, error, handleRemoveFavorite, refetch } =
    useFavorites();

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka || 0);

  return (
    <div className="min-h-dvh flex flex-col bg-[#F5F7FA] text-[#0F172A]">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Kos Favorit Saya
              </h1>
            </div>

            {isAuthenticated && (
              <button
                type="button"
                onClick={refetch}
                className="self-start sm:self-auto px-4 py-2 rounded-xl text-[13px] font-semibold text-[#1D4ED8] bg-[#EFF6FF] hover:bg-[#DBEAFE] transition-colors cursor-pointer"
              >
                Segarkan Daftar
              </button>
            )}
          </div>

          {/* Unauthorized / Not logged in */}
          {!authLoading && (!isAuthenticated || user?.role !== "PENCARI_KOS") ? (
            <div className="mx-auto max-w-2xl py-12 text-center">
              <div className="rounded-2xl bg-[#FFFFFF] p-8">
                <h2 className="text-xl font-bold text-[#0F172A]">
                  Akses Khusus Mahasiswa Pencari Kos
                </h2>
                <Link
                  href="/auth/login"
                  className="mt-5 inline-block rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E40AF] transition-colors"
                >
                  Login Sekarang
                </Link>
              </div>
            </div>
          ) : authLoading || isLoading ? (
            /* Skeleton Loader */
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-2xl bg-[#FFFFFF]"
                />
              ))}
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 rounded-xl bg-[#FFEDEA] p-4 text-sm text-[#831C1E]">
                  {error}
                </div>
              )}

              {favorites.length === 0 ? (
                <div className="rounded-2xl bg-[#FFFFFF] p-12 text-center">
                  <p className="text-base font-semibold text-[#0F172A]">
                    Belum ada kos di daftar favorit Anda.
                  </p>
                  <p className="mt-1 text-base text-[#475569]">
                    Tandai kos yang Anda sukai dengan menekan tombol simpan
                    favorit untuk menyimpannya di sini.
                  </p>
                  <Link
                    href="/kos"
                    className="mt-5 inline-block rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E40AF] transition-colors"
                  >
                    Jelajahi Katalog Kos
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {favorites.map((fav) => {
                    const isKosDeleted = !fav.kosId || typeof fav.kosId !== "object";
                    const kos = !isKosDeleted ? fav.kosId : {};
                    const kosId = kos._id || null;
                    const thumbnail =
                      kos.fotoUrls?.[0] ||
                      "https://placehold.co/600x400/e2e8f0/475569?text=Foto+Kos";
                    const isAvailable = (kos.jumlahKamarTersedia ?? 0) > 0;

                    return (
                      <article
                        key={fav._id}
                        className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-[#FFFFFF] transition-colors"
                      >
                        <div>
                          {/* Image Box */}
                          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EEF2F7]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={thumbnail}
                              alt={kos.nama || "Kos Favorit"}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />

                            {/* Tombol Hapus Favorit (Optimistic Update) */}
                            <button
                              type="button"
                              onClick={() => handleRemoveFavorite(kosId, fav._id)}
                              title="Hapus dari daftar favorit"
                              className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFFFFF] text-[#E11D48] hover:bg-[#FFEDEA] transition-colors cursor-pointer"
                              aria-label="Hapus favorit"
                            >
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                              </svg>
                            </button>

                            {/* Badges */}
                            <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                              {kos.tipe && (
                                <span className="rounded-md bg-[#FFFFFF] px-2.5 py-1 text-[13px] font-semibold text-[#0F172A]">
                                  Kos {kos.tipe}
                                </span>
                              )}
                              {!isKosDeleted && (
                                <span
                                  className={`rounded-md px-2.5 py-1 text-[13px] font-semibold tabular-nums ${
                                    isAvailable
                                      ? "bg-[#DCFAE5] text-[#04250E]"
                                      : "bg-[#EEF2F7] text-[#475569]"
                                  }`}
                                >
                                  {isAvailable
                                    ? `Sisa ${kos.jumlahKamarTersedia} Kamar`
                                    : "Kamar Penuh"}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="p-4 space-y-2">
                            <h3 className="line-clamp-1 text-base font-bold text-[#0F172A] group-hover:text-[#1D4ED8] transition-colors">
                              {isKosDeleted
                                ? "Properti Kos Tidak Lagi Tersedia"
                                : kos.nama || "Properti Kos"}
                            </h3>
                            <p className="flex items-center gap-1.5 line-clamp-1 text-sm text-[#475569]">
                              <svg
                                className="w-3.5 h-3.5 shrink-0 text-[#475569]"
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
                              <span className="truncate">
                                {isKosDeleted
                                  ? "Listing telah dihapus oleh pemilik"
                                  : kos.lokasi || "-"}
                              </span>
                            </p>

                            {!isKosDeleted && (
                              <div className="pt-2">
                                <span className="text-[13px] text-[#475569] block">
                                  Biaya Sewa
                                </span>
                                <p className="text-base font-extrabold text-[#0F172A] tabular-nums">
                                  {formatRupiah(kos.harga)}{" "}
                                  <span className="text-[13px] font-normal text-[#475569]">
                                    / bulan
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer Card */}
                        <div className="px-4 pb-4 pt-2">
                          {!isKosDeleted && kosId ? (
                            <Link
                              href={`/kos/${kosId}`}
                              className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-[#1D4ED8] py-2.5 text-center text-[13px] font-semibold text-white hover:bg-[#1E40AF] transition-colors"
                            >
                              <span>Lihat Detail & Ajukan Sewa</span>
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                                />
                              </svg>
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRemoveFavorite(null, fav._id)}
                              className="w-full rounded-xl bg-[#EEF2F7] py-2.5 text-center text-[13px] font-semibold text-[#0F172A] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
                            >
                              Hapus dari Daftar Favorit
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
