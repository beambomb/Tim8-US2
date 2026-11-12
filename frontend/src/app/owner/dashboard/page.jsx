import PlaceholderPage from "../../../components/ui/PlaceholderPage";

export const metadata = {
  title: "Dashboard Pemilik - CariKos",
};

export default function OwnerDashboardPage() {
  return (
    <PlaceholderPage
      title="Dashboard Ringkasan Pemilik Kos"
      route="/owner/dashboard"
      assignedTo="Anggota 2"
      domain="Portal Pemilik Kos"
      endpoints={["GET /api/owner/kos", "GET /api/bookings/owner"]}
      description="Pusat ringkasan operasional properti pemilik: metrik jumlah properti aktif, kamar terisi vs kosong, dan antrean booking baru mahasiswa yang memerlukan persetujuan. Dilengkapi tombol cepat tambah kos baru."
    />
  );
}
