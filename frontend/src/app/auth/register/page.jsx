import PlaceholderPage from "../../../components/ui/PlaceholderPage";

export const metadata = {
  title: "Daftar Akun Baru - CariKos",
};

export default function RegisterPage() {
  return (
    <PlaceholderPage
      title="Halaman Pendaftaran Akun (Register)"
      route="/auth/register"
      assignedTo="Anggota 1"
      domain="Autentikasi Pengguna & Sesi"
      endpoints={["POST /api/auth/register"]}
      description="Form pendaftaran akun baru: input nama lengkap, email, password, nomor HP, dan pemilihan peran akun (Pencari Kos vs Pemilik Kos). Disertai validasi input dan redirect langsung ke halaman login saat berhasil."
    />
  );
}
