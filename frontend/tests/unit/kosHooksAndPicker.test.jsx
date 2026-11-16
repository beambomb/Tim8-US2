import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, renderHook, act, waitFor } from "@testing-library/react";
import { useFavorites } from "@/features/kos/hooks/useFavorites";
import CampusPickerPanel from "@/features/kos/components/CampusPickerPanel";
import { useAuth } from "@/context/AuthContext";
import { kosService } from "@/features/kos/services/kosService";

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("useFavorites hook and CampusPickerPanel component tests", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { _id: "u-1", role: "PENCARI_KOS" },
    });
  });

  it("useFavorites loads favorites, checks favorited status, and optimistically removes entries", async () => {
    vi.spyOn(kosService, "getFavorites").mockResolvedValue({
      data: [{ _id: "fav-1", kosId: { _id: "kos-1", nama: "Kos Mawar" } }],
    });
    const removeSpy = vi
      .spyOn(kosService, "removeFavorite")
      .mockResolvedValue({ success: true });

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.isKosFavorited("kos-1")).toBe(true);
    expect(result.current.isKosFavorited("kos-999")).toBe(false);

    await act(async () => {
      await result.current.handleRemoveFavorite("kos-1", "fav-1");
    });

    expect(removeSpy).toHaveBeenCalledWith("fav-1");
    expect(result.current.favorites).toHaveLength(0);
  });

  it("CampusPickerPanel renders unpinned presets, searches via kosService, and invokes selection callbacks", async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const searchSpy = vi.spyOn(kosService, "searchCampuses").mockResolvedValue({
      data: [
        {
          id: "itb",
          shortName: "ITB",
          nama: "Institut Teknologi Bandung",
          kota: "Bandung",
          lat: -6.8915,
          lng: 107.6107,
        },
      ],
    });

    render(
      <CampusPickerPanel
        campuses={[{ id: "ugm", shortName: "UGM" }]}
        popularPresets={[
          { id: "ugm", shortName: "UGM", nama: "UGM", kota: "Sleman", lat: -7.77, lng: 110.37 },
          { id: "uny", shortName: "UNY", nama: "Universitas Negeri Yogyakarta", kota: "Sleman", lat: -7.774, lng: 110.386 },
        ]}
        onSelectNewCampus={onSelect}
        onClose={onClose}
      />
    );

    expect(screen.getByText("UNY")).toBeInTheDocument();
    expect(screen.queryByText("UGM")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Cari Kampus Apa Saja/i), {
      target: { value: "ITB" },
    });

    await waitFor(() => {
      expect(searchSpy).toHaveBeenCalledWith("ITB");
      expect(screen.getByText("ITB")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /ITB/i }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "itb" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
