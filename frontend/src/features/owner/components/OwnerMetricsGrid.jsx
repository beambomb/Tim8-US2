'use client';

export default function OwnerMetricsGrid({ metrics, isLoading }) {
  if (isLoading) {
    return (
      <div
        className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
        aria-busy="true"
        aria-label="Memuat metrik dasbor"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`p-5 flex flex-col gap-3 ${
              i < 4 ? 'border-b lg:border-b-0 lg:border-r border-[#E2E8F0]' : ''
            } ${i === 0 || i === 2 ? 'sm:border-r border-[#E2E8F0]' : ''} ${
              i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''
            }`}
          >
            <div className="h-3.5 bg-[#EEF2F7] rounded w-2/3" />
            <div className="h-7 bg-[#E2E8F0] rounded w-1/2" />
            <div className="h-3 bg-[#EEF2F7] rounded w-4/5" />
          </div>
        ))}
      </div>
    );
  }

  const {
    totalKos = 0,
    totalKamar = 0,
    kamarTersedia = 0,
    kamarTerisi = 0,
    okupansi = 0,
    totalBookings = 0,
    bookingPending = 0,
    estimatedIncome = 0,
    statusCounts = { approved: 0, pending: 0, rejected: 0 },
  } = metrics || {};

  const formattedIncome = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(estimatedIncome);

  const metricCells = [
    {
      label: 'Total properti kos',
      value: totalKos.toString(),
      subtext: `${statusCounts.approved} aktif, ${statusCounts.pending} tunggu, ${statusCounts.rejected} ditolak`,
      highlight: false,
    },
    {
      label: 'Tingkat okupansi kamar',
      value: `${okupansi}%`,
      subtext: `${kamarTerisi} terisi dari ${totalKamar} kapasitas`,
      highlight: false,
    },
    {
      label: 'Kamar siap huni',
      value: kamarTersedia.toString(),
      subtext: `Dari total ${totalKamar} kamar terdaftar`,
      highlight: false,
    },
    {
      label: 'Permohonan booking',
      value: totalBookings.toString(),
      subtext: `${bookingPending} menunggu konfirmasi`,
      highlight: bookingPending > 0,
    },
    {
      label: 'Estimasi pendapatan disetujui',
      value: formattedIncome,
      subtext: 'Akumulasi durasi sewa terkonfirmasi',
      highlight: false,
      isMoney: true,
    },
  ];

  return (
    <div className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
      {metricCells.map((cell, idx) => {
        const isLast = idx === metricCells.length - 1;
        const isLeftColumnOnTablet = idx === 0 || idx === 2;
        return (
          <div
            key={cell.label}
            className={`p-5 flex flex-col justify-between gap-2 ${
              !isLast ? 'border-b lg:border-b-0 lg:border-r border-[#E2E8F0]' : ''
            } ${isLeftColumnOnTablet ? 'sm:border-r border-[#E2E8F0]' : ''} ${
              isLast ? 'sm:col-span-2 lg:col-span-1' : ''
            }`}
          >
            <div>
              <span className="text-xs font-medium text-[#475569] block mb-1.5">
                {cell.label}
              </span>
              <div
                className={`text-2xl tracking-tight tabular-nums text-[#0F172A] ${
                  cell.isMoney ? 'font-bold' : 'font-semibold'
                }`}
              >
                {cell.value}
              </div>
            </div>

            <p
              className={`text-[11px] leading-snug ${
                cell.highlight
                  ? 'text-[var(--accent)] font-medium'
                  : 'text-[#475569]'
              }`}
            >
              {cell.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
