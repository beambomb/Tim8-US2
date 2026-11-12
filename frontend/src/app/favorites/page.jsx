import PlaceholderPage from "../../components/ui/PlaceholderPage";

export const metadata = {
  title: "Kos Favorit Saya - CariKos",
};

export default function FavoritesPage() {
  return (
    <PlaceholderPage
      title="Daftar Kos Favorit (Wishlist)"
      route="/favorites"
      assignedTo="Anggota 3"
      domain="Detail Properti & Transaksi Booking"
      endpoints={[
        "GET /api/favorites",
        "POST /api/favorites",
        "DELETE /api/favorites/:id",
      ]}
      description="Halaman koleksi kos impian yang disimpan oleh mahasiswa. Menyajikan kartu kos tersimpan, sisa kamar tersedia, harga, tombol hapus dari favorit dengan penanganan optimistic update, serta tautan langsung ke halaman detail kos."
    />
  );
}
