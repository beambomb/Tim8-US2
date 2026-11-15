import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import KosCardReal from "@/features/kos/components/KosCardReal";
import KosFilterSidebar from "@/features/kos/components/KosFilterSidebar";

describe("KosCardReal and KosFilterSidebar component tests", () => {
  it("KosCardReal formats metadata, compact distance, facility overflow, and toggles favorite", () => {
    const onToggleFavorite = vi.fn();
    const { rerender } = render(
      <KosCardReal
        kos={{
          _id: "kos-1",
          nama: "Kos Pogung Asri",
          harga: 950000,
          lokasi: "Jl. Pogung Dalangan No. 45",
          tipe: "Putra",
          fasilitas: ["WiFi Cepat", "Kasur", "AC", "Parkir Motor", "Dapur"],
          jumlahKamarTersedia: 3,
          jarakMeter: 750,
          rating: 4.9,
          ulasanCount: 18,
        }}
        showFavoriteButton
        isFavorited={false}
        onToggleFavorite={onToggleFavorite}
      />
    );

    expect(screen.getByRole("link", { name: "Kos Pogung Asri" })).toHaveAttribute("href", "/kos/kos-1");
    expect(screen.getByText("Sisa 3")).toBeInTheDocument();
    expect(screen.getByText("750 m")).toBeInTheDocument();
    expect(screen.getByText("Putra")).toBeInTheDocument();
    expect(screen.getByText("WiFi Cepat · Kasur · AC · +2")).toBeInTheDocument();
    expect(screen.getByText("4.9")).toBeInTheDocument();

    const favButton = screen.getByRole("button", { name: "Simpan Kos Pogung Asri ke favorit" });
    expect(favButton).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(favButton);
    expect(onToggleFavorite).toHaveBeenCalledWith("kos-1");

    rerender(
      <KosCardReal
        kos={{
          _id: "kos-2",
          nama: "Kos Seturan Penuh",
          harga: 1600000,
          lokasi: "Seturan",
          tipe: "Putri",
          fasilitas: [],
          jumlahKamarTersedia: 0,
          jarakMeter: 1850,
          jarakKm: "1.85",
        }}
        showFavoriteButton
        isFavorited
        onToggleFavorite={onToggleFavorite}
      />
    );

    expect(screen.getByText("Penuh")).toBeInTheDocument();
    expect(screen.getByText("1.85 km")).toBeInTheDocument();
    expect(screen.getByText("Fasilitas dasar tersedia")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hapus Kos Seturan Penuh dari favorit" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("KosFilterSidebar invokes callbacks for campus picker, type, facility, availability, radius, and reset", () => {
    const updateFilter = vi.fn();
    const resetFilters = vi.fn();
    const onSelectCampus = vi.fn();
    const onRadiusChange = vi.fn();

    const onRemoveCampus = vi.fn();

    render(
      <KosFilterSidebar
        filters={{ tipe: "all", fasilitas: "WiFi Cepat", tersedia: "", lokasi: "Pogung", hargaMin: "", hargaMax: "" }}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        locationMode="preset"
        selectedCampusId="UGM"
        radiusKm={5}
        campuses={[
          { id: "UGM", shortName: "UGM", nama: "UGM", kota: "Sleman", isDefault: true },
          { id: "UNY", shortName: "UNY", nama: "UNY", kota: "Yogyakarta" },
        ]}
        popularPresets={[]}
        onSelectCampus={onSelectCampus}
        onAddCampus={vi.fn()}
        onRemoveCampus={onRemoveCampus}
        onRadiusChange={onRadiusChange}
        onDetectGps={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Putri" }));
    expect(updateFilter).toHaveBeenCalledWith("tipe", "Putri", true);

    fireEvent.click(screen.getByLabelText("WiFi Cepat"));
    expect(updateFilter).toHaveBeenCalledWith("fasilitas", "", true);

    fireEvent.click(screen.getByLabelText(/Hanya Kamar Tersedia/i));
    expect(updateFilter).toHaveBeenCalledWith("tersedia", "true", true);

    fireEvent.change(screen.getByLabelText("Radius Maksimal"), { target: { value: "8" } });
    expect(onRadiusChange).toHaveBeenCalledWith(8);

    fireEvent.click(screen.getByRole("button", { name: /UNY Yogyakarta/i }));
    expect(onSelectCampus).toHaveBeenCalledWith("UNY");

    fireEvent.click(screen.getByRole("button", { name: "Hapus UNY" }));
    expect(onRemoveCampus).toHaveBeenCalledWith("UNY");

    fireEvent.click(screen.getByRole("button", { name: "Reset Semua" }));
    expect(resetFilters).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /Tambah Kampus/i }));
    expect(screen.getByLabelText(/Cari Kampus Apa Saja/i)).toBeInTheDocument();
  });
});
