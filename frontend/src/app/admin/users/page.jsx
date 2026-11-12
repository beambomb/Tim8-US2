import PlaceholderPage from "../../../components/ui/PlaceholderPage";

export const metadata = {
  title: "Manajemen Pengguna - CariKos Admin",
};

export default function AdminUsersPage() {
  return (
    <PlaceholderPage
      title="Master Data & Manajemen Pengguna"
      route="/admin/users"
      assignedTo="Anggota 1"
      domain="Portal Administrator"
      endpoints={["GET /api/admin/users", "PATCH /api/admin/users/:id/role"]}
      description="Tabel master data seluruh akun pengguna CariKos: ID, nama lengkap, email, nomor HP, role aktif, dan tanggal registrasi. Memuat fitur pencarian cepat nama/email serta dropdown mutasi role (Pencari Kos, Pemilik Kos, Admin) dengan dialog konfirmasi."
    />
  );
}
