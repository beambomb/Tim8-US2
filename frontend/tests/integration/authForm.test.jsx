import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthForm from "@/components/auth/AuthForm";
import { AuthProvider } from "@/context/AuthContext";
import { authService } from "@/features/auth/services/authService";

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockQueryParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => mockQueryParams,
}));

function renderWithAuth(ui) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

describe("AuthForm UI integration tests", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockQueryParams = new URLSearchParams();
    vi.spyOn(authService, "getMe").mockResolvedValue(null);
  });

  it("shows registration success banner from query param, submits login, and redirects to PEMILIK_KOS home", async () => {
    mockQueryParams = new URLSearchParams("registered=1");
    vi.spyOn(authService, "login").mockResolvedValue({
      token: "owner-jwt",
      user: { _id: "o1", nama: "Ibu Kos", role: "PEMILIK_KOS" },
    });

    renderWithAuth(<AuthForm mode="login" />);

    expect(screen.getByText("Akun berhasil dibuat. Silakan login.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Alamat email"), {
      target: { name: "email", value: "owner@carikos.id" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { name: "password", value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Masuk" }));

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith("/owner/dashboard")
    );
    expect(localStorage.getItem("token")).toBe("owner-jwt");
  });

  it("displays API error alert when login fails with wrong credentials", async () => {
    vi.spyOn(authService, "login").mockRejectedValue({
      response: { data: { message: "Kredensial tidak valid" } },
    });

    renderWithAuth(<AuthForm mode="login" />);

    fireEvent.change(screen.getByLabelText("Alamat email"), {
      target: { name: "email", value: "salah@carikos.id" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { name: "password", value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Masuk" }));

    expect(await screen.findByText("Kredensial tidak valid")).toBeInTheDocument();
  });

  it("submits registration form with selected PEMILIK_KOS role and redirects to login", async () => {
    const registerSpy = vi.spyOn(authService, "register").mockResolvedValue({
      message: "Registrasi berhasil",
    });

    renderWithAuth(<AuthForm mode="register" />);

    fireEvent.change(screen.getByLabelText("Nama lengkap"), {
      target: { name: "nama", value: "Budi Santoso" },
    });
    fireEvent.change(screen.getByLabelText("Alamat email"), {
      target: { name: "email", value: "budi@kos.id" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { name: "password", value: "secret123" },
    });
    fireEvent.change(screen.getByLabelText("Nomor HP"), {
      target: { name: "noHp", value: "08123456789" },
    });
    fireEvent.change(screen.getByLabelText("Daftar sebagai"), {
      target: { name: "role", value: "PEMILIK_KOS" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Daftar sekarang" }));

    await waitFor(() =>
      expect(registerSpy).toHaveBeenCalledWith({
        nama: "Budi Santoso",
        email: "budi@kos.id",
        password: "secret123",
        noHp: "08123456789",
        role: "PEMILIK_KOS",
      })
    );
    expect(mockPush).toHaveBeenCalledWith("/auth/login?registered=1");
  });
});
