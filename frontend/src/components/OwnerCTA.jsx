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
      <div className="rounded-2xl bg-[#141D30] p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9]">
            Punya Kos di Sekitar Kampus?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            Daftarkan properti kos Anda di CariKos secara gratis. Kelola kamar kosong, permohonan sewa, dan terima pesan langsung dari mahasiswa setiap awal semester.
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link
            href={registerOrAddHref}
            className="px-6 py-3 rounded-full font-semibold bg-[#10B981] text-[#0A0F1D] hover:bg-[#059669] transition-colors text-center text-sm focus-visible:outline-2 focus-visible:outline-[#10B981] focus-visible:outline-offset-2"
          >
            Daftar Sebagai Pemilik Kos
          </Link>
          <Link
            href={portalHref}
            className="px-5 py-3 rounded-full font-semibold bg-[#0A0F1D] text-[#F1F5F9] hover:text-[#10B981] hover:bg-slate-900 transition-colors text-center text-sm focus-visible:outline-2 focus-visible:outline-[#10B981] focus-visible:outline-offset-2"
          >
            Masuk Portal Pemilik
          </Link>
        </div>
      </div>
    </section>
  );
}
