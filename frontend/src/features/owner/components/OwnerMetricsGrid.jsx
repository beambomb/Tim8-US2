'use client';

export default function OwnerMetricsGrid({ metrics, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-[#141D30] border border-slate-800 p-5 flex flex-col gap-3"
          >
            <div className="h-3.5 bg-slate-800 rounded w-1/2" />
            <div className="h-7 bg-slate-700/60 rounded w-3/4" />
            <div className="h-3 bg-slate-800/80 rounded w-2/3" />
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

  const metricCards = [
    {
      label: 'Total Properti Kos',
      value: totalKos.toString(),
      subtext: `${statusCounts.approved} aktif, ${statusCounts.pending} verifikasi, ${statusCounts.rejected} ditolak`,
      accent: 'emerald',
    },
    {
      label: 'Tingkat Okupansi Kamar',
      value: `${okupansi}%`,
      subtext: `${kamarTerisi} terisi dari ${totalKamar} total kapasitas`,
      accent: 'emerald',
    },
    {
      label: 'Kamar Siap Huni',
      value: kamarTersedia.toString(),
      subtext: `Dari total ${totalKamar} kamar terdaftar`,
      accent: 'sky',
    },
    {
      label: 'Permohonan Booking',
      value: totalBookings.toString(),
      subtext: `${bookingPending} booking menunggu konfirmasi`,
      accent: bookingPending > 0 ? 'sky' : 'neutral',
    },
    {
      label: 'Estimasi Pendapatan Terkonfirmasi',
      value: formattedIncome,
      subtext: 'Berdasarkan durasi sewa booking disetujui',
      accent: 'emerald',
      fullWidthOnMobile: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {metricCards.map((card, idx) => (
        <div
          key={idx}
          className={`rounded-xl bg-[#141D30] border border-slate-800 p-5 flex flex-col justify-between ${
            card.fullWidthOnMobile ? 'sm:col-span-2 lg:col-span-1' : ''
          }`}
        >
          <div>
            <span className="text-xs font-medium text-[#94A3B8] block mb-2">
              {card.label}
            </span>
            <div className="text-2xl font-bold text-[#F1F5F9] tracking-tight tabular-nums font-mono">
              {card.value}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-[#64748B] flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                card.accent === 'emerald'
                  ? 'bg-emerald-400'
                  : card.accent === 'sky'
                  ? 'bg-sky-400'
                  : 'bg-slate-500'
              }`}
            />
            <span className="truncate">{card.subtext}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
