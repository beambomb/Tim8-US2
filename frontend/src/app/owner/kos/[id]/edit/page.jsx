import PlaceholderPage from "../../../../../components/ui/PlaceholderPage";

export const metadata = {
  title: "Edit Kos - CariKos Owner",
};

export default function OwnerEditKosPage() {
  return (
    <PlaceholderPage
      title="Formulir Edit Data Properti Kos"
      route="/owner/kos/[id]/edit"
      assignedTo="Anggota 2"
      domain="Portal Pemilik Kos"
      endpoints={["PUT /api/owner/kos/:id", "POST /api/owner/upload"]}
      description="Formulir pembaruan data spesifikasi properti kos yang sudah terdaftar. Mengambil data awal kos, memungkinkan pemilik mengedit deskripsi, harga, fasilitas, menambah/menghapus foto, dan menyimpan pembaruan ke backend."
    />
  );
}
