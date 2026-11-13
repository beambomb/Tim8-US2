'use client';

import Link from 'next/link';
import { useOwnerDashboard } from '@/features/owner/hooks/useOwnerDashboard';
import OwnerMetricsGrid from '@/features/owner/components/OwnerMetricsGrid';

export default function OwnerDashboardPage() {
  const { metrics, recentBookings, kosList, isLoading, error, refetch } =
    useOwnerDashboard();

  return (
    <div className="flex flex-col gap-8">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F5F9]">
            Dashboard Analitik Pemilik
          </h1>
          <p className="mt-1 text-xs text-[#94A3B8]">
            Pantau metrik okupansi, ketersediaan kamar, dan aliran permohonan booking masuk secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={refetch}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#141D30] border border-slate-700/80 transition-colors"
          >
            Segarkan Data
          </button>
          <Link
            href="/owner/kos/tambah"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#10B981] text-[#0A0F1D] hover:bg-[#059669] transition-colors"
          >
            + Tambah Kos
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      <section>
        <OwnerMetricsGrid metrics={metrics} isLoading={isLoading} />
      </section>

      {/* Bottom 2-Column Split: Recent Bookings & Property Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Permohonan Booking Terbaru */}
        <section className="rounded-xl bg-[#141D30] border border-slate-800 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-[#F1F5F9]">
                Permohonan Booking Terbaru
              </h2>
              <span className="text-[11px] text-[#94A3B8]">
                Antrean booking dari mahasiswa pencari kos
              </span>
            </div>
            <Link
              href="/owner/bookings"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Lihat Semua ({metrics.totalBookings})
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-2.5 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 bg-slate-800/60 rounded-lg" />
              ))}
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#94A3B8]">
              Belum ada permohonan booking yang masuk saat ini.
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-800/80">
              {recentBookings.map((b) => {
                const status = (b.status || 'PENDING').toUpperCase();
                const isPending = status === 'PENDING';
                const isApproved = status === 'DISETUJUI';
                const isRejected = status === 'DITOLAK';

                return (
                  <div
                    key={b._id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-[#F1F5F9] truncate">
                        {b.userId?.nama || 'Calon Penyewa'}
                      </span>
                      <span className="text-[11px] text-[#94A3B8] truncate">
                        {b.kosId?.nama || 'Properti Kos'} • {b.durasiBulan || 1} Bulan
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : isPending
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            : isRejected
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Ringkasan Status Properti Kos */}
        <section className="rounded-xl bg-[#141D30] border border-slate-800 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-[#F1F5F9]">
                Daftar Properti Kos Anda
              </h2>
              <span className="text-[11px] text-[#94A3B8]">
                Status verifikasi kurator & ketersediaan kamar
              </span>
            </div>
            <Link
              href="/owner/kos"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Kelola Kos ({kosList.length})
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-2.5 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 bg-slate-800/60 rounded-lg" />
              ))}
            </div>
          ) : kosList.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#94A3B8]">
              Belum ada properti kos yang didaftarkan.{' '}
              <Link href="/owner/kos/tambah" className="text-emerald-400 underline">
                Tambah sekarang
              </Link>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-800/80">
              {kosList.slice(0, 4).map((kos) => {
                const isApproved = kos.statusVerifikasi === 'Approved';
                const isPending =
                  kos.statusVerifikasi === 'Pending' || !kos.statusVerifikasi;

                return (
                  <div
                    key={kos._id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-[#F1F5F9] truncate">
                        {kos.nama}
                      </span>
                      <span className="text-[11px] text-[#94A3B8] truncate">
                        {kos.lokasi} • {kos.jumlahKamarTersedia} / {kos.jumlahKamar} kamar siap
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${
                        isApproved
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : isPending
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {kos.statusVerifikasi || 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
