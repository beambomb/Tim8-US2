import PlaceholderPage from "../../../components/ui/PlaceholderPage";

export const metadata = {
  title: "Daftar Kos Saya - CariKos Owner",
};

export default function OwnerKosListPage() {
  return (
    <PlaceholderPage
      title="Manajemen Inventaris Kos Pemilik"
      route="/owner/kos"
      assignedTo="Anggota 2"
      domain="Portal Pemilik Kos"
      endpoints={[
        "GET /api/owner/kos",
        "DELETE /api/owner/kos/:id",
        "PATCH /api/owner/kos/:id/availability",
      ]}
      description="Tabel/kartu daftar seluruh kos milik pemilik aktif. Memuat foto, spesifikasi, dan badge status verifikasi (Pending / Approved / Rejected). Dilengkapi alert alasan penolakan dari admin, tombol hapus kos, dan quick counter update jumlah kamar tersedia secara instan."
    />
  );
}
