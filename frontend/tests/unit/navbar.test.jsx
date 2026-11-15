import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

let currentPathname = "/";
const mockLogout = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/components/layout/NavbarNotifications", () => ({
  default: () => <div data-testid="mock-navbar-notifications" />,
}));

describe("Navbar role navigation, account popover, and mobile drawer tests", () => {
  beforeEach(() => {
    currentPathname = "/";
    mockLogout.mockReset();
  });

  it("renders guest controls without center nav links", () => {
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      logout: mockLogout,
    });

    render(<Navbar />);

    expect(screen.queryByRole("navigation", { name: "Utama" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Untuk Pemilik" })).toHaveAttribute("href", "/#pemilik");
    expect(screen.getByRole("link", { name: "Masuk" })).toHaveAttribute("href", "/auth/login");
  });

  it("renders PENCARI_KOS primary links with active aria-current highlighting", () => {
    currentPathname = "/kos";
    useAuth.mockReturnValue({
      user: { nama: "Sari", email: "sari@mail.com", role: "PENCARI_KOS" },
      isAuthenticated: true,
      loading: false,
      logout: mockLogout,
    });

    render(<Navbar />);

    const utamaNav = screen.getByRole("navigation", { name: "Utama" });
    expect(utamaNav).toBeInTheDocument();

    const katalogLink = screen.getByRole("link", { name: "Katalog Kos" });
    expect(katalogLink).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Favorit" })).toHaveAttribute("href", "/favorites");
    expect(screen.getByRole("link", { name: "Booking" })).toHaveAttribute("href", "/bookings");
    expect(screen.getByRole("link", { name: "Pesan" })).toHaveAttribute("href", "/chat");
  });

  it("renders PEMILIK_KOS nav links and opens desktop account popover with role links and logout", () => {
    currentPathname = "/owner/dashboard";
    useAuth.mockReturnValue({
      user: { nama: "Pak Budi", email: "budi@kos.id", role: "PEMILIK_KOS" },
      isAuthenticated: true,
      loading: false,
      logout: mockLogout,
    });

    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Portal Pemilik" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Kos Saya" })).toHaveAttribute("href", "/owner/kos");
    expect(screen.getByRole("link", { name: "Booking" })).toHaveAttribute("href", "/owner/bookings");

    const accountBtn = screen.getByRole("button", { name: /Pak Budi/i });
    fireEvent.click(accountBtn);

    expect(screen.getByText("Pemilik Kos")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tambah Kos Baru" })).toHaveAttribute("href", "/owner/kos/tambah");
    expect(screen.getByRole("link", { name: "Katalog Kos Publik" })).toHaveAttribute("href", "/kos");

    fireEvent.click(screen.getByRole("button", { name: "Keluar Akun" }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("renders ADMIN nav links and closes mobile drawer on Escape key", () => {
    currentPathname = "/admin/submissions";
    useAuth.mockReturnValue({
      user: { nama: "Admin Utama", email: "admin@carikos.id", role: "ADMIN" },
      isAuthenticated: true,
      loading: false,
      logout: mockLogout,
    });

    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Panel Admin" })).toHaveAttribute("href", "/admin/dashboard");
    expect(screen.getByRole("link", { name: "Verifikasi" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Pengguna" })).toHaveAttribute("href", "/admin/users");

    const mobileToggle = screen.getByRole("button", { name: "Buka Menu" });
    fireEvent.click(mobileToggle);
    expect(screen.getByRole("navigation", { name: "Seluler" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("navigation", { name: "Seluler" })).not.toBeInTheDocument();
  });
});
