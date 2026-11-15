import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FaqSection from "@/components/FaqSection";
import SupportButton from "@/components/SupportButton";
import { useAuth } from "@/context/AuthContext";
import { chatService } from "@/features/chat/services/chatService";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("FaqSection and SupportButton component tests", () => {
  beforeEach(() => {
    mockPush.mockReset();
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  });

  it("FaqSection renders 5 FAQ items with item 1 expanded by default and toggles answers on click", () => {
    render(<FaqSection />);

    const firstButton = screen.getByRole("button", {
      name: /Apakah semua kos di CariKos sudah terverifikasi/i,
    });
    const secondButton = screen.getByRole("button", {
      name: /Bagaimana cara mencari kos dekat kampus tertentu/i,
    });

    expect(firstButton).toHaveAttribute("aria-expanded", "true");
    expect(secondButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText(/tahap pemeriksaan Administrator/i)).toBeInTheDocument();

    fireEvent.click(secondButton);
    expect(firstButton).toHaveAttribute("aria-expanded", "false");
    expect(secondButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/Radius Kampus \/ GPS/i)).toBeInTheDocument();

    fireEvent.click(secondButton);
    expect(secondButton).toHaveAttribute("aria-expanded", "false");
  });

  it("SupportButton shows login link for guest and closes on Escape key", () => {
    render(<SupportButton />);

    const toggleBtn = screen.getByRole("button", { name: "Bantuan & Dukungan" });
    fireEvent.click(toggleBtn);

    const dialog = screen.getByRole("dialog", { name: "Pusat Bantuan CariKos" });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Masuk untuk Chat Admin Support" })).toHaveAttribute(
      "href",
      "/auth/login"
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Pusat Bantuan CariKos" })).not.toBeInTheDocument();
  });

  it("SupportButton shows inbox link for ADMIN and connects PENCARI_KOS/PEMILIK_KOS to Admin chat", async () => {
    useAuth.mockReturnValue({
      user: { _id: "admin-1", role: "ADMIN" },
      isAuthenticated: true,
      loading: false,
    });

    const { rerender } = render(<SupportButton />);
    fireEvent.click(screen.getByRole("button", { name: "Bantuan & Dukungan" }));
    expect(screen.getByRole("link", { name: "Buka Kotak Pesan Masuk" })).toHaveAttribute(
      "href",
      "/chat"
    );

    useAuth.mockReturnValue({
      user: { _id: "p1", role: "PENCARI_KOS" },
      isAuthenticated: true,
      loading: false,
    });
    vi.spyOn(chatService, "getSupportContact").mockResolvedValue({
      success: true,
      data: { id: "admin-42" },
    });

    rerender(<SupportButton />);
    fireEvent.click(screen.getByRole("button", { name: /Chat Admin Support Sekarang/i }));

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/chat/admin-42?topic=support")
    );
  });

  it("SupportButton shows readable error when support contact request fails", async () => {
    useAuth.mockReturnValue({
      user: { _id: "o1", role: "PEMILIK_KOS" },
      isAuthenticated: true,
      loading: false,
    });
    vi.spyOn(chatService, "getSupportContact").mockRejectedValue({
      response: { data: { message: "Akun admin layanan bantuan belum tersedia" } },
    });

    render(<SupportButton />);
    fireEvent.click(screen.getByRole("button", { name: "Bantuan & Dukungan" }));
    fireEvent.click(screen.getByRole("button", { name: /Chat Admin Support Sekarang/i }));

    expect(
      await screen.findByText("Akun admin layanan bantuan belum tersedia")
    ).toBeInTheDocument();
  });
});
