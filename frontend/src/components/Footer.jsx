import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#141D30] bg-[#0A0F1D] text-[#94A3B8] text-xs py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#10B981] text-[#0A0F1D] flex items-center justify-center font-bold text-sm">
              CK
            </div>
            <span className="text-base font-bold text-[#F1F5F9]">
              Cari<span className="text-[#10B981]">Kos</span>
            </span>
          </div>
          <p className="max-w-sm text-[#94A3B8] leading-relaxed">
            Platform web terpadu pencarian dan pengelolaan kos mahasiswa di sekitar kampus. Memastikan informasi akurat, terverifikasi, dan transparan.
          </p>
        </div>
        <div>
          <h4 className="text-[#F1F5F9] font-semibold text-sm mb-3">Navigasi</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/kos" className="hover:text-[#10B981] transition-colors">
                Katalog Kos
              </Link>
            </li>
            <li>
              <Link href="/kos/nearby" className="hover:text-[#10B981] transition-colors">
                Kos Terdekat Kampus
              </Link>
            </li>
            <li>
              <Link href="/owner/dashboard" className="hover:text-[#10B981] transition-colors">
                Portal Pemilik Kos
              </Link>
            </li>
            <li>
              <Link href="/auth/login" className="hover:text-[#10B981] transition-colors">
                Masuk / Daftar Akun
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[#F1F5F9] font-semibold text-sm mb-3">Informasi Proyek</h4>
          <p className="text-[#94A3B8] leading-relaxed mb-1">
            Tim 8 - Pengembangan Aplikasi Web
          </p>
          <p className="text-[#94A3B8]/80">
            Departemen Teknik Elektro & Teknologi Informasi
          </p>
          <p className="text-[#94A3B8]/80">Fakultas Teknik - Universitas Gadjah Mada</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-[#141D30] flex flex-col sm:flex-row items-center justify-between gap-4 text-[#94A3B8]/80">
        <p>© 2026 CariKos. Seluruh hak cipta dilindungi undang-undang.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-[#F1F5F9]">
            Syarat & Ketentuan
          </a>
          <a href="#" className="hover:text-[#F1F5F9]">
            Kebijakan Privasi
          </a>
        </div>
      </div>
    </footer>
  );
}

