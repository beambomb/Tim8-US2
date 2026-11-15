"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function OwnerCTA() {
  const { user, isAuthenticated, loading } = useAuth();
  const isOwner =
    !loading && isAuthenticated && user?.role === "PEMILIK_KOS";

  const registerOrAddHref = isOwner
    ? "/owner/kos/tambah"
    : "/auth/register?role=PEMILIK_KOS";
  const portalHref = isOwner ? "/owner/dashboard" : "/auth/login";

  return (
    <section
      id="pemilik"
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
    >
      <div
        data-reveal="0"
        className="rounded-2xl bg-[#FFFFFF] p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
      >
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            Punya Kos di Sekitar Kampus?
          </h2>
          <p className="mt-3 text-base text-[#475569] leading-relaxed">
            Daftarkan properti kos Anda di CariKos secara gratis. Kelola kamar kosong, permohonan sewa, dan terima pesan langsung dari mahasiswa setiap awal semester.
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Link
            href={registerOrAddHref}
            className="px-6 py-3 rounded-full font-semibold bg-[#1D4ED8] text-white hover:bg-[#1E40AF] transition-colors text-center text-sm focus-visible:outline-2 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2"
          >
            Daftar Sebagai Pemilik Kos
          </Link>
          <Link
            href={portalHref}
            className="px-5 py-3 rounded-full font-semibold bg-[#EEF2F7] text-[#0F172A] hover:text-[#1D4ED8] hover:bg-[#E2E8F0] transition-colors text-center text-sm focus-visible:outline-2 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2"
          >
            Masuk Portal Pemilik
          </Link>
        </div>
      </div>
    </section>
  );
}
