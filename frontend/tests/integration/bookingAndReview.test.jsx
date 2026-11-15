import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookingModal from "@/features/booking/components/BookingModal";
import ReviewSection from "@/features/review/components/ReviewSection";
import { useAuth } from "@/context/AuthContext";
import { reviewService } from "@/features/review/services/reviewService";

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("BookingModal and ReviewSection UI integration tests", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: { _id: "u-pencari", nama: "Dewi", role: "PENCARI_KOS" },
      isAuthenticated: true,
    });
  });

  it("BookingModal updates cost estimate dynamically, submits trimmed payload, and closes on success", async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue({ success: true });

    render(
      <BookingModal
        isOpen
        onClose={onClose}
        onSuccess={onSuccess}
        onSubmit={onSubmit}
        isSubmitting={false}
        error={null}
        kos={{ nama: "Kos Pogung Asri", harga: 1000000 }}
      />
    );

    expect(screen.getAllByText(/Rp\s*1\.000\.000/)).toHaveLength(2);

    fireEvent.change(screen.getByLabelText("Durasi Sewa"), { target: { value: "6" } });
    expect(screen.getByText(/6 bulan/)).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*6\.000\.000/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Catatan untuk Pemilik/i), {
      target: { value: "  Datang pagi jam 9  " },
    });

    fireEvent.click(screen.getByRole("button", { name: "Konfirmasi Pengajuan" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        durasiBulan: 6,
        catatan: "Datang pagi jam 9",
      })
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("BookingModal shows error banner and closes on Escape key", () => {
    const onClose = vi.fn();
    render(
      <BookingModal
        isOpen
        onClose={onClose}
        onSubmit={vi.fn()}
        isSubmitting={false}
        error="Kamar kos ini sudah penuh"
        kos={{ nama: "Kos Penuh", harga: 800000 }}
      />
    );

    expect(screen.getByText("Kamar kos ini sudah penuh")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ReviewSection loads reviews via useReview, lets PENCARI_KOS pick rating and submit review", async () => {
    vi.spyOn(reviewService, "getReviews").mockResolvedValue({
      data: {
        total: 1,
        averageRating: 4.0,
        reviews: [
          {
            _id: "rev-1",
            rating: 4,
            komentar: "Air lancar dan bersih",
            userId: { _id: "other-user", nama: "Bima" },
          },
        ],
      },
    });
    const submitSpy = vi.spyOn(reviewService, "submitReview").mockResolvedValue({
      data: {
        _id: "rev-2",
        rating: 4,
        komentar: "Sangat nyaman dekat kampus",
        userId: { _id: "u-pencari", nama: "Dewi" },
      },
    });

    render(<ReviewSection kosId="kos-99" />);

    expect(await screen.findByText("Air lancar dan bersih")).toBeInTheDocument();
    expect(screen.getByText("1 ulasan")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Beri rating 4 dari 5 bintang" }));
    fireEvent.change(screen.getByLabelText("Komentar ulasan kos"), {
      target: { value: "Sangat nyaman dekat kampus" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kirim Ulasan" }));

    await waitFor(() =>
      expect(submitSpy).toHaveBeenCalledWith("kos-99", {
        rating: 4,
        komentar: "Sangat nyaman dekat kampus",
      })
    );
    expect(await screen.findByText("Ulasan Anda berhasil dikirim.")).toBeInTheDocument();
  });
});
