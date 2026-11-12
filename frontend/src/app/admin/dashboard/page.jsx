import PlaceholderPage from "../../../components/ui/PlaceholderPage";

export const metadata = {
  title: "Dashboard Admin - CariKos",
};

export default function AdminDashboardPage() {
  return (
    <PlaceholderPage
      title="Dashboard Statistik Administrator"
      route="/admin/dashboard"
      assignedTo="Anggota 1"
      domain="Portal Administrator"
      endpoints={["GET /api/admin/stats"]}
      description="Menampilkan metrik analitik sistem: ringkasan total pengguna terdaftar (diklasifikasikan per peran: pencari kos, pemilik kos, dan admin) serta status agregat seluruh kos (total kos, kos pending butuh verifikasi, approved, dan rejected)."
    />
  );
}
