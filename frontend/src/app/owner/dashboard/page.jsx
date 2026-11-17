'use client';

import Link from 'next/link';
import RefreshButton from '@/components/ui/RefreshButton';
import PortalPageHeader from '@/components/portal/PortalPageHeader';
import { Alert, Badge } from '@/components/portal/PortalUI';
import { useOwnerDashboard } from '@/features/owner/hooks/useOwnerDashboard';
import OwnerMetricsGrid from '@/features/owner/components/OwnerMetricsGrid';

function getStatusVariant(status) {
  const s = (status || '').toUpperCase();
  if (s === 'DISETUJUI' || s === 'APPROVED') return 'success';
  if (s === 'DITOLAK' || s === 'REJECTED') return 'danger';
  if (s === 'PENDING') return 'warning';
  return 'neutral';
}

export default function OwnerDashboardPage() {
  const { metrics, recentBookings, kosList, isLoading, error, refetch } =
    useOwnerDashboard();

  return (
    <div className="flex flex-col gap-6">
      <PortalPageHeader
        title="Dashboard Analitik Pemilik"
        actions={
          <>
            <RefreshButton
              onClick={refetch}
              isLoading={isLoading}
              label="Segarkan data dashboard"
              variant="app"
            />
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
          </>
        }
      />

      {/* Error Alert */}
      {error && <Alert>{error}</Alert>}

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

                    <Badge variant={getStatusVariant(status)}>{status}</Badge>
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
              {kosList.slice(0, 4).map((kos) => (
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

                  <Badge variant={getStatusVariant(kos.statusVerifikasi || 'Pending')}>
                    {kos.statusVerifikasi || 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
