import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, renderHook, waitFor, act } from "@testing-library/react";
import BookingModal from "@/features/booking/components/BookingModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useKosDetail } from "@/features/kos/hooks/useKosDetail";
import { useAuth } from "@/context/AuthContext";
import { kosService } from "@/features/kos/services/kosService";
import { bookingService } from "@/features/booking/services/bookingService";

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("Complex frontend edge-case tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuth.mockReturnValue({
      user: { _id: "u-1", role: "PENCARI_KOS" },
      isAuthenticated: true,
    });
  });

  it("BookingModal supports long-term durations (> 60 months) and preset year chips", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ success: true });
    render(
      <BookingModal
        isOpen
        onClose={vi.fn()}
        onSubmit={onSubmit}
        isSubmitting={false}
        error={null}
        kos={{ nama: "Kos Keluarga", harga: 1000000 }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "4 Thn" }));
    expect(screen.getByLabelText("Durasi Sewa")).toHaveValue(48);
    expect(screen.getByText(/48 bulan/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Durasi Sewa"), { target: { value: "72" } });
    expect(screen.getByText(/72 bulan/)).toBeInTheDocument();
    expect(screen.getByText(/6 tahun/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Konfirmasi Pengajuan" }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ durasiBulan: 72 }))
    );
  });

  it("ConfirmModal locks Escape & backdrop dismissal while isLoading is true", () => {
    const onCancel = vi.fn();
    const { rerender } = render(
      <ConfirmModal
        isOpen
        title="Hapus Data"
        message="Yakin?"
        variant="danger"
        isLoading={false}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);

    rerender(
      <ConfirmModal
        isOpen
        title="Hapus Data"
        message="Yakin?"
        variant="danger"
        isLoading={true}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Memproses..." })).toBeDisabled();
  });

  it("useKosDetail detects existing active booking (DISETUJUI/PENDING) for current kos", async () => {
    vi.spyOn(kosService, "getKosDetail").mockResolvedValue({
      data: { _id: "kos-99", nama: "Kos Melati", harga: 900000, jumlahKamarTersedia: 3 },
    });
    vi.spyOn(kosService, "getReviews").mockResolvedValue({ data: [] });
    vi.spyOn(kosService, "getFavorites").mockResolvedValue({ data: [] });
    vi.spyOn(bookingService, "getMyBookings").mockResolvedValue({
      data: [
        { _id: "b-old", kosId: { _id: "kos-99" }, status: "DITOLAK" },
        { _id: "b-active", kosId: { _id: "kos-99" }, status: "DISETUJUI" },
      ],
    });

    const { result } = renderHook(() => useKosDetail("kos-99"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() => expect(result.current.activeKosBooking?._id).toBe("b-active"));
  });
});
