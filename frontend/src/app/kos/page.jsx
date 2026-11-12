import PlaceholderPage from "../../components/ui/PlaceholderPage";

export const metadata = {
  title: "Katalog & Pencarian Kos - CariKos",
};

export default function KosCatalogPage() {
  return (
    <PlaceholderPage
      title="Katalog & Pencarian Kos Lengkap"
      route="/kos"
      assignedTo="Anggota 2"
      domain="Eksplorasi Kos & Pencarian Publik"
      endpoints={["GET /api/kos"]}
      description="Halaman katalog pencarian seluruh kos yang berstatus Approved. Dilengkapi sidebar filter interaktif: slider rentang harga (hargaMin, hargaMax), checklist tipe (Putra, Putri, Campur), checklist fasilitas, dan toggle kamar tersedia. Hasil disajikan dalam grid kartu kos responsif."
    />
  );
}
