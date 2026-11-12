import PlaceholderPage from "../../../components/ui/PlaceholderPage";

export const metadata = {
  title: "Verifikasi Kos - CariKos Admin",
};

export default function AdminSubmissionsPage() {
  return (
    <PlaceholderPage
      title="Audit & Verifikasi Pengajuan Kos Masuk"
      route="/admin/submissions"
      assignedTo="Anggota 1"
      domain="Portal Administrator"
      endpoints={[
        "GET /api/admin/submissions",
        "GET /api/admin/submissions/:id",
        "PATCH /api/admin/submissions/:id/approve",
        "PATCH /api/admin/submissions/:id/reject",
      ]}
      description="Tabel antrean pengajuan properti kos berstatus Pending. Dilengkapi modal tinjau berkas/foto/alamat, tombol persetujuan (Approve) untuk publikasi langsung, dan tombol penolakan (Reject) yang mewajibkan input alasanPenolakan."
    />
  );
}
