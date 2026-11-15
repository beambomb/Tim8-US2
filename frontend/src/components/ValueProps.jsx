export default function ValueProps() {
  return (
    <section
      id="keunggulan"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-[#EEF2F7]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-14" data-reveal="0">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
            Mengapa Memilih CariKos?
          </h2>
          <p className="text-base text-[#475569] mt-2 leading-relaxed">
            Kami menyelesaikan masalah info kos yang terpecah-pecah di media sosial dengan sistem terpusat dan terverifikasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col gap-3" data-reveal="0">
            <div className="w-10 h-1 rounded-full bg-[#1D4ED8]" aria-hidden="true" />
            <h3 className="text-xl font-bold text-[#0F172A]">
              Verifikasi Data Resmi Admin
            </h3>
            <p className="text-base text-[#475569] leading-relaxed">
              Setiap foto, koordinat, dan legalitas kos diperiksa langsung oleh Administrator untuk membasmi kos fiktif dan penipuan sewa.
            </p>
          </div>

          <div className="flex flex-col gap-3" data-reveal="80">
            <div className="w-10 h-1 rounded-full bg-[#1D4ED8]" aria-hidden="true" />
            <h3 className="text-xl font-bold text-[#0F172A]">
              Pencarian Radius Geospasial Akurat
            </h3>
            <p className="text-base text-[#475569] leading-relaxed">
              Menggunakan formula Haversine untuk menghitung jarak nyata dari gerbang fakultas atau titik Anda tanpa bergantung data perkiraan.
            </p>
          </div>

          <div className="flex flex-col gap-3" data-reveal="160">
            <div className="w-10 h-1 rounded-full bg-[#1D4ED8]" aria-hidden="true" />
            <h3 className="text-xl font-bold text-[#0F172A]">
              Manajemen Kamar Real-Time
            </h3>
            <p className="text-base text-[#475569] leading-relaxed">
              Ketersediaan kamar terupdate otomatis saat booking disetujui. Tidak ada lagi drama kamar sudah penuh saat datang ke lokasi.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

