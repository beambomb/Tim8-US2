"use client";

import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { Panel, Loading, Alert, Button } from "@/components/admin/UI";
import { useAdminDashboard } from "@/features/admin/hooks/useAdminDashboard";

function ArrowRightIcon() {
  return (
    <svg
      className="w-4 h-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
      />
    </svg>
  );
}

function MetricGroup({ title, items }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-[#0F172A]">{title}</h2>
      <div className="rounded-xl border border-[#E2E8F0] bg-[#E2E8F0] overflow-hidden grid grid-cols-2 lg:grid-cols-4 gap-px">
        {items.map((item) => (
          <div key={item.name} className="bg-[#FFFFFF] p-5">
            <p className="text-sm text-[#475569]">{item.name}</p>
            <p
              className={`mt-2 text-2xl font-bold tabular-nums ${
                item.warning ? "text-[#B45309]" : "text-[#0F172A]"
              }`}
            >
              {item.value ?? 0}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { data, loading, error, refetch } = useAdminDashboard();

  const pendingCount = data?.kos?.pending ?? 0;

  const userMetrics = data
    ? [
        { name: "Total pengguna", value: data.users?.total },
        { name: "Pencari kos", value: data.users?.pencari },
        { name: "Pemilik kos", value: data.users?.pemilik },
        { name: "Administrator", value: data.users?.admin },
      ]
    : [];

  const propertyMetrics = data
    ? [
        { name: "Total properti", value: data.kos?.total },
        {
          name: "Menunggu verifikasi",
          value: pendingCount,
          warning: pendingCount > 0,
        },
        { name: "Disetujui", value: data.kos?.approved },
        { name: "Ditolak", value: data.kos?.rejected },
      ]
    : [];

  return (
    <AdminShell
      title="Dashboard Administrator"
      subtitle="Pantau aktivitas pengguna dan status verifikasi kos secara langsung."
    >
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={refetch} disabled={loading}>
          Muat ulang
        </Button>
      </div>

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : data ? (
        <div className="space-y-6">
          <MetricGroup title="Statistik Pengguna" items={userMetrics} />
          <MetricGroup title="Status Properti" items={propertyMetrics} />

          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/admin/submissions"
              className="group rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 text-[#0F172A] hover:border-[#CBD5E1] transition-colors flex flex-col justify-between focus-visible:outline-2 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2"
            >
              <div>
                <h2 className="text-base font-semibold text-[#0F172A]">
                  Verifikasi pengajuan kos
                </h2>
                <p className="mt-1.5 text-sm text-[#475569] tabular-nums">
                  Tinjau {pendingCount} pengajuan yang menunggu keputusan.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] group-hover:text-[#1E40AF]">
                <span>Buka antrean verifikasi</span>
                <ArrowRightIcon />
              </span>
            </Link>

            <Link
              href="/admin/users"
              className="group rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 text-[#0F172A] hover:border-[#CBD5E1] transition-colors flex flex-col justify-between focus-visible:outline-2 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2"
            >
              <div>
                <h2 className="text-base font-semibold text-[#0F172A]">
                  Kelola akun pengguna
                </h2>
                <p className="mt-1.5 text-sm text-[#475569] tabular-nums">
                  Lihat {data.users?.total ?? 0} akun terdaftar dan atur peran
                  pengguna.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] group-hover:text-[#1E40AF]">
                <span>Buka daftar pengguna</span>
                <ArrowRightIcon />
              </span>
            </Link>
          </div>
        </div>
      ) : (
        !error && (
          <Panel>
            <p className="text-sm text-[#475569]">Data tidak tersedia.</p>
          </Panel>
        )
      )}
    </AdminShell>
  );
}
