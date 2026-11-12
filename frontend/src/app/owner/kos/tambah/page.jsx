import PlaceholderPage from "../../../../components/ui/PlaceholderPage";

export const metadata = {
  title: "Tambah Kos Baru - CariKos Owner",
};

export default function OwnerAddKosPage() {
  return (
    <PlaceholderPage
      title="Formulir Tambah Properti Kos Baru"
      route="/owner/kos/tambah"
      assignedTo="Anggota 2"
      domain="Portal Pemilik Kos"
      endpoints={["POST /api/owner/upload", "POST /api/owner/kos"]}
      description="Form input pendaftaran properti kos: nama kos, harga sewa per bulan, alamat lengkap, tipe kos (Putra/Putri/Campur), koordinat latitude & longitude, fasilitas kamar, kapasitas total kamar. Dilengkapi dropzone upload foto hingga 5 gambar langsung ke Cloudinary."
    />
  );
}
