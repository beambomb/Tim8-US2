export default function OwnerCTA() {
  return (
    <section
      id="pemilik"
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
    >
      <div className="rounded-3xl bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-widest font-black text-neutral-900/70">
            Mitra Pemilik Properti
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold mt-1 tracking-tight text-neutral-950">
            Punya Kos di Sekitar Kampus?
          </h2>
          <p className="mt-2 text-sm sm:text-base font-medium text-neutral-900/90 leading-relaxed">
            Daftarkan kos Anda secara gratis. Kelola kamar kosong, permohonan sewa, dan terima pesan langsung dari mahasiswa setiap awal semester.
          </p>
        </div>
        <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            type="button"
            className="px-6 py-3.5 rounded-full font-bold bg-neutral-950 text-white hover:bg-neutral-900 transition-transform active:scale-95 text-center text-sm cursor-pointer shadow-lg"
          >
            Daftar Sebagai Pemilik Kos
          </button>
          <button
            type="button"
            className="px-5 py-3.5 rounded-full font-bold bg-white/40 hover:bg-white/60 text-neutral-950 transition-colors text-center text-sm cursor-pointer border border-neutral-900/20"
          >
            Panduan Pemilik
          </button>
        </div>
      </div>
    </section>
  );
}

