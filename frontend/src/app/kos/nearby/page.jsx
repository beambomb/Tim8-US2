import PlaceholderPage from "../../../components/ui/PlaceholderPage";

export const metadata = {
  title: "Kos Terdekat Kampus - CariKos",
};

export default function KosNearbyPage() {
  return (
    <PlaceholderPage
      title="Pencarian Kos Terdekat Kampus (Geospasial)"
      route="/kos/nearby"
      assignedTo="Anggota 2"
      domain="Eksplorasi Kos & Pencarian Publik"
      endpoints={["GET /api/kos/nearby"]}
      description="Pencarian kos berbasis radius jarak nyata dari koordinat pengguna atau titik kampus. Memanfaatkan Geolocation API browser atau preset kampus (UGM, UNY, UPN, UII) serta slider radius (1-10 km). Menampilkan kartu kos berurutan dari jarak terdekat dengan kalkulasi formula Haversine."
    />
  );
}
