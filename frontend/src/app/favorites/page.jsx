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
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Kos Favorit Saya
              </h1>
              <p className="mt-1 text-sm text-[#475569]">
                Daftar kos pilihan yang telah Anda simpan untuk kemudahan akses dan pemesanan.
              </p>
            </div>

            {isAuthenticated && (
              <button
                type="button"
                onClick={refetch}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#1D4ED8] bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE] transition-colors"
              >
                Segarkan Daftar
              </button>
            )}
          </div>

          {/* Unauthorized / Not logged in */}
          {!authLoading && (!isAuthenticated || user?.role !== "PENCARI_KOS") ? (
            <div className="mx-auto max-w-2xl py-12 text-center">
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900">
                  Akses Khusus Mahasiswa Pencari Kos
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Silakan login sebagai <strong>Pencari Kos</strong> untuk mengelola daftar kos favorit Anda.
                </p>
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-2xl bg-slate-200 border border-slate-300/40"
                />
              ))}
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {favorites.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                  <p className="text-base font-semibold text-slate-700">
                    Belum ada kos di daftar favorit Anda.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Tandai kos yang Anda sukai dengan menekan tombol hati untuk menyimpannya di sini.
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
                    const kos = fav.kosId || {};
                    const kosId = kos._id || fav.kosId;
                    const thumbnail =
                      kos.fotoUrls?.[0] ||
                      "https://placehold.co/600x400/e2e8f0/475569?text=Foto+Kos";
                    const isAvailable = (kos.jumlahKamarTersedia ?? 0) > 0;

                    return (
                      <article
                        key={fav._id}
                        className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-[#1D4ED8]/40 hover:shadow-md transition-all duration-200"
                      >
                        <div>
                          {/* Image Box */}
                          <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
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
                              className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow-sm hover:bg-rose-50 hover:scale-110 transition-all cursor-pointer"
                              aria-label="Hapus favorit"
                            >
                              <span className="text-base">❤️</span>
                            </button>

                            {/* Badges */}
                            <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                              {kos.tipe && (
                                <span className="rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 border border-slate-200 shadow-xs backdrop-blur-xs">
                                  Kos {kos.tipe}
                                </span>
                              )}
                              <span
                                className={`rounded-md px-2.5 py-1 text-xs font-semibold border backdrop-blur-xs ${
                                  isAvailable
                                    ? "bg-[#0F172A]/80 text-white border-white/20"
                                    : "bg-white/90 text-slate-500 border-slate-200"
                                }`}
                              >
                                {isAvailable
                                  ? `Sisa ${kos.jumlahKamarTersedia} Kamar`
                                  : "Kamar Penuh"}
                              </span>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="p-4 space-y-2">
                            <h3 className="line-clamp-1 text-base font-bold text-slate-900 group-hover:text-[#1D4ED8] transition-colors">
                              {kos.nama || "Properti Kos"}
                            </h3>
                            <p className="line-clamp-1 text-xs text-slate-500">
                              📍 {kos.lokasi || "-"}
                            </p>

                            <div className="pt-2">
                              <span className="text-[11px] text-slate-400 block">
                                Biaya Sewa
                              </span>
                              <p className="text-base font-extrabold text-emerald-700 font-mono">
                                {formatRupiah(kos.harga)}{" "}
                                <span className="text-xs font-normal text-slate-500">
                                  / bulan
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Footer Card */}
                        <div className="border-t border-slate-100 p-4 pt-3">
                          <Link
                            href={`/kos/${kosId}`}
                            className="block w-full rounded-xl bg-[#1D4ED8] py-2 text-center text-xs font-semibold text-white hover:bg-[#1E40AF] transition-colors shadow-xs"
                          >
                            Lihat Detail & Ajukan Sewa →
                          </Link>
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
