import PlaceholderPage from "../../../components/ui/PlaceholderPage";

export const metadata = {
  title: "Permohonan Booking Masuk - CariKos Owner",
};

export default function OwnerBookingsPage() {
  return (
    <PlaceholderPage
      title="Manajemen Permohonan Booking Masuk (Pemilik)"
      route="/owner/bookings"
      assignedTo="Anggota 3"
      domain="Detail Properti & Transaksi Booking"
      endpoints={[
        "GET /api/bookings/owner",
        "PATCH /api/bookings/:id/approve",
        "PATCH /api/bookings/:id/reject",
      ]}
      description="Daftar antrean permohonan sewa dari mahasiswa yang masuk ke seluruh kos milik pemilik. Memuat profil pemesan (nama, no HP), tanggal mulai sewa, durasi bulan, catatan, tombol Setujui (mengurangi stok kamar secara atomik), dan tombol Tolak permohonan sewa."
    />
  );
}
