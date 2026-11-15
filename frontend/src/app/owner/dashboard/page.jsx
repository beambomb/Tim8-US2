'use client';

import Link from 'next/link';
import { useOwnerDashboard } from '@/features/owner/hooks/useOwnerDashboard';
import OwnerMetricsGrid from '@/features/owner/components/OwnerMetricsGrid';

export default function OwnerDashboardPage() {
  const { metrics, recentBookings, kosList, isLoading, error, refetch } =
    useOwnerDashboard();

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">
            Dashboard Analitik Pemilik
          </h1>
          <p className="mt-1 text-sm text-[#475569]">
            Pantau okupansi kamar, status verifikasi properti, dan permohonan booking masuk.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={refetch}
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#0F172A] bg-[#FFFFFF] border border-[#CBD5E1] hover:bg-[#EEF2F7] transition-colors cursor-pointer"
          >
            Segarkan Data
          </button>
          <Link
            href="/owner/kos/tambah"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Tambah Kos</span>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-[#FFEDEA] border border-[#FECACA] text-[#831C1E] text-xs">
          {error}
        </div>
      )}

      {/* Metrics Strip */}
      <section aria-label="Ringkasan metrik pemilik kos">
        <OwnerMetricsGrid metrics={metrics} isLoading={isLoading} />
      </section>

      {/* Bottom 2-Column Split: Recent Bookings & Property Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Permohonan Booking Terbaru */}
        <section className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <h2 className="text-base font-semibold text-[#0F172A]">
                Permohonan booking terbaru
              </h2>
              <span className="text-xs text-[#475569]">
                Antrean pengajuan sewa dari pencari kos
              </span>
            </div>
            <Link
              href="/owner/bookings"
              className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium tabular-nums shrink-0"
            >
              Lihat Semua ({metrics.totalBookings})
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-2.5" aria-busy="true">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 bg-[#EEF2F7] rounded-lg" />
              ))}
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#475569] rounded-lg border border-dashed border-[#E2E8F0]">
              Belum ada permohonan booking yang masuk saat ini.
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[#E2E8F0]">
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
                      <span className="font-semibold text-[#0F172A] truncate text-sm">
                        {b.userId?.nama || 'Calon Penyewa'}
                      </span>
                      <span className="text-xs text-[#475569] truncate">
                        {b.kosId?.nama || 'Properti Kos'} · {b.durasiBulan || 1} Bulan
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                          isApproved
                            ? 'bg-[#DCFAE5] text-[#04250E] border-[#A7F3D0]'
                            : isPending
                            ? 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]'
                            : isRejected
                            ? 'bg-[#FFEDEA] text-[#831C1E] border-[#FECACA]'
                            : 'bg-[#EEF2F7] text-[#475569] border-[#E2E8F0]'
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
        <section className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <h2 className="text-base font-semibold text-[#0F172A]">
                Daftar properti kos Anda
              </h2>
              <span className="text-xs text-[#475569]">
                Status verifikasi kurator dan ketersediaan kamar
              </span>
            </div>
            <Link
              href="/owner/kos"
              className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium tabular-nums shrink-0"
            >
              Kelola Kos ({kosList.length})
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-2.5" aria-busy="true">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 bg-[#EEF2F7] rounded-lg" />
              ))}
            </div>
          ) : kosList.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#475569] rounded-lg border border-dashed border-[#E2E8F0]">
              Belum ada properti kos yang didaftarkan.{' '}
              <Link href="/owner/kos/tambah" className="text-[var(--accent)] font-medium underline">
                Tambah sekarang
              </Link>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[#E2E8F0]">
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
                      <span className="font-semibold text-[#0F172A] truncate text-sm">
                        {kos.nama}
                      </span>
                      <span className="text-xs text-[#475569] truncate tabular-nums">
                        {kos.lokasi} · {kos.jumlahKamarTersedia} / {kos.jumlahKamar} kamar siap
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border shrink-0 ${
                        isApproved
                          ? 'bg-[#DCFAE5] text-[#04250E] border-[#A7F3D0]'
                          : isPending
                          ? 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]'
                          : 'bg-[#FFEDEA] text-[#831C1E] border-[#FECACA]'
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
