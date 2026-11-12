export default function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-800 bg-neutral-950 text-neutral-400 text-xs py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-neutral-950 flex items-center justify-center font-bold text-sm">
              CK
            </div>
            <span className="text-base font-bold text-white">
              Cari<span className="text-amber-400">Kos</span>
            </span>
          </div>
          <p className="max-w-sm text-neutral-400 leading-relaxed">
            Platform web terpadu pencarian dan pengelolaan kos mahasiswa di sekitar kampus. Memastikan informasi akurat, terverifikasi, dan transparan.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Navigasi</h4>
          <ul className="space-y-2">
            <li>
              <a href="#katalog" className="hover:text-amber-400 transition-colors">
                Katalog Kos
              </a>
            </li>
            <li>
              <a href="#keunggulan" className="hover:text-amber-400 transition-colors">
                Tentang CariKos
              </a>
            </li>
            <li>
              <a href="#pemilik" className="hover:text-amber-400 transition-colors">
                Portal Pemilik Kos
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Informasi Proyek</h4>
          <p className="text-neutral-400 leading-relaxed mb-1">
            Tim 8 - Pengembangan Aplikasi Web
          </p>
          <p className="text-neutral-500">
            Departemen Teknik Elektro & Teknologi Informasi
          </p>
          <p className="text-neutral-500">Fakultas Teknik - Universitas Gadjah Mada</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500">
        <p>© 2026 CariKos. Seluruh hak cipta dilindungi undang-undang.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-neutral-300">
            Syarat & Ketentuan
          </a>
          <a href="#" className="hover:text-neutral-300">
            Kebijakan Privasi
          </a>
        </div>
      </div>
    </footer>
  );
}

