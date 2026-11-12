import PlaceholderPage from "../../../components/ui/PlaceholderPage";

export const metadata = {
  title: "Masuk Akun - CariKos",
};

export default function LoginPage() {
  return (
    <PlaceholderPage
      title="Halaman Masuk (Login)"
      route="/auth/login"
      assignedTo="Anggota 1"
      domain="Autentikasi Pengguna & Sesi"
      endpoints={["POST /api/auth/login", "GET /api/auth/me"]}
      description="Form input email & password, validasi format kredensial, penyimpanan JWT token ke localStorage / cookie, dan redirect otomatis sesuai role pengguna (Admin ke /admin/dashboard, Pemilik ke /owner/dashboard, Pencari ke /kos)."
    />
  );
}
