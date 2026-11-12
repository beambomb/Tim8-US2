export default function OwnerCTA() {
  return (
    <section
      id="pemilik"
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
    >
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-emerald-950/40">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-widest font-black text-emerald-200">
            Mitra Pemilik Properti
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold mt-1 tracking-tight text-white">
            Punya Kos di Sekitar Kampus?
          </h2>
          <p className="mt-2 text-sm sm:text-base font-medium text-emerald-100/90 leading-relaxed">
            Daftarkan kos Anda secara gratis. Kelola kamar kosong, permohonan sewa, dan terima pesan langsung dari mahasiswa setiap awal semester.
          </p>
        </div>
        <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            type="button"
            className="px-6 py-3.5 rounded-full font-bold bg-[#0A0F1D] text-white hover:bg-[#141D30] transition-transform active:scale-95 text-center text-sm cursor-pointer shadow-lg"
          >
            Daftar Sebagai Pemilik Kos
          </button>
          <button
            type="button"
            className="px-5 py-3.5 rounded-full font-bold bg-white/20 hover:bg-white/30 text-white transition-colors text-center text-sm cursor-pointer border border-white/20"
          >
            Panduan Pemilik
          </button>
        </div>
      </div>
    </section>
  );
}

