import PlaceholderPage from "../../../components/ui/PlaceholderPage";

export const metadata = {
  title: "Detail Kos - CariKos",
};

export default function KosDetailPage() {
  return (
    <PlaceholderPage
      title="Halaman Detail Properti Kos Komprehensif"
      route="/kos/[id]"
      assignedTo="Anggota 3"
      domain="Detail Properti & Transaksi Booking"
      endpoints={["GET /api/kos/:id"]}
      description="Tampilan spesifikasi lengkap kos: galeri foto utama dan thumbnail lightbox, badge tipe kos, harga bulanan, ketersediaan kamar dinamis, daftar fasilitas lengkap, peta koordinat, profil pemilik kos + tombol 'Chat Pemilik', serta tombol utama 'Ajukan Sewa / Booking' yang memicu modal booking."
    />
  );
}
