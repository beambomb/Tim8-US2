export default function ValueProps() {
  return (
    <section
      id="keunggulan"
      className="py-20 px-4 sm:px-6 lg:px-8 border-t border-neutral-800 bg-neutral-900/40"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            Standar Kualitas
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Mengapa Memilih CariKos?
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            Kami menyelesaikan masalah info kos yang terpecah-pecah di media sosial dengan sistem terpusat dan terverifikasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">
              Verifikasi Data Resmi Admin
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Setiap foto, koordinat, dan legalitas kos diperiksa langsung oleh Administrator untuk membasmi kos fiktif dan penipuan sewa.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">
              Pencarian Radius Geospasial Akurat
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Menggunakan formula Haversine untuk menghitung jarak nyata dari gerbang fakultas atau titik Anda tanpa bergantung data perkiraan.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">
              Manajemen Kamar Real-Time
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Ketersediaan kamar terupdate otomatis saat booking disetujui. Tidak ada lagi drama kamar sudah penuh saat datang ke lokasi.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

