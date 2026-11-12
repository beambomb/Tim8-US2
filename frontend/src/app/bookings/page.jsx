import PlaceholderPage from "../../components/ui/PlaceholderPage";

export const metadata = {
  title: "Riwayat Booking Saya - CariKos",
};

export default function MyBookingsPage() {
  return (
    <PlaceholderPage
      title="Riwayat & Status Booking Mahasiswa"
      route="/bookings"
      assignedTo="Anggota 3"
      domain="Detail Properti & Transaksi Booking"
      endpoints={["GET /api/bookings/my", "PATCH /api/bookings/:id/cancel"]}
      description="Halaman pelacakan seluruh pengajuan sewa kamar mahasiswa. Memuat tab filter status: Semua, PENDING, DISETUJUI, DITOLAK, DIBATALKAN. Menyajikan kartu rincian kos yang dipesan, tanggal mulai, durasi sewa, total estimasi, dan tombol 'Batalkan Booking' untuk status PENDING."
    />
  );
}
