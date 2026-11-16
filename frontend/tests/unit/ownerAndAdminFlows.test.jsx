import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, renderHook, act, waitFor } from "@testing-library/react";
import OwnerMetricsGrid from "@/features/owner/components/OwnerMetricsGrid";
import OwnerKosTable from "@/features/owner/components/OwnerKosTable";
import { useOwnerKos } from "@/features/owner/hooks/useOwnerKos";
import { useOwnerKosForm } from "@/features/owner/hooks/useOwnerKosForm";
import AdminShell from "@/components/admin/AdminShell";
import OwnerLayout from "@/features/owner/components/OwnerLayout";
import { useAdminSubmissions } from "@/features/admin/hooks/useAdminSubmissions";
import { useAdminUsers } from "@/features/admin/hooks/useAdminUsers";
import { useAdminKos } from "@/features/admin/hooks/useAdminKos";
import AdminKosPage from "@/app/admin/kos/page";
import { ownerService } from "@/features/owner/services/ownerService";
import { adminService } from "@/features/admin/services/adminService";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("Owner and Admin dashboard UI & hook flows", () => {
  beforeEach(() => {
    mockPush.mockReset();
    usePathname.mockReturnValue("/admin/submissions");
    useAuth.mockReturnValue({
      user: { _id: "admin-1", nama: "Admin", role: "ADMIN" },
      isAuthenticated: true,
      loading: false,
      logout: vi.fn(),
    });
  });

  it("OwnerMetricsGrid renders loading skeleton and formatted owner metrics", () => {
    const { rerender } = render(<OwnerMetricsGrid isLoading />);
    expect(screen.getByLabelText("Memuat metrik dasbor")).toBeInTheDocument();

    rerender(
      <OwnerMetricsGrid
        isLoading={false}
        metrics={{
          totalKos: 3,
          totalKamar: 20,
          kamarTersedia: 5,
          kamarTerisi: 15,
          okupansi: 75,
          totalBookings: 4,
          bookingPending: 2,
          estimatedIncome: 4500000,
          statusCounts: { approved: 2, pending: 1, rejected: 0 },
        }}
      />
    );

    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText(/2 menunggu konfirmasi/i)).toBeInTheDocument();
    expect(screen.getByText(/4\.500\.000/)).toBeInTheDocument();
  });

  it("OwnerKosTable handles empty state, room adjustments, verification resubmit, and delete confirmation", async () => {
    const onAvail = vi.fn().mockResolvedValue({ success: true });
    const onSubmit = vi.fn().mockResolvedValue({ success: true, message: "Terkirim" });
    const onDelete = vi.fn().mockResolvedValue({ success: true, message: "Terhapus" });

    const { rerender } = render(
      <OwnerKosTable
        kosList={[]}
        handleUpdateAvailability={onAvail}
        handleSubmitVerification={onSubmit}
        handleDelete={onDelete}
      />
    );
    expect(screen.getByText("Belum ada properti kos")).toBeInTheDocument();

    rerender(
      <OwnerKosTable
        kosList={[
          {
            _id: "kos-own-1",
            nama: "Kos Cempaka",
            lokasi: "Pogung",
            harga: 1200000,
            tipe: "Putri",
            jumlahKamar: 10,
            jumlahKamarTersedia: 4,
            statusVerifikasi: "Rejected",
            alasanPenolakan: "Foto kurang jelas",
          },
        ]}
        handleUpdateAvailability={onAvail}
        handleSubmitVerification={onSubmit}
        handleDelete={onDelete}
        actionLoadingId={null}
      />
    );

    const plusButtons = screen.getAllByRole("button", {
      name: /Tambah kamar siap huni untuk Kos Cempaka/i,
    });
    fireEvent.click(plusButtons[0]);
    await waitFor(() => {
      expect(onAvail).toHaveBeenCalledWith("kos-own-1", 5);
    });

    fireEvent.click(screen.getAllByRole("button", { name: /^Ajukan/i })[0]);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("kos-own-1");
    });

    fireEvent.click(screen.getAllByRole("button", { name: "Hapus" })[0]);
    expect(screen.getByText("Konfirmasi Hapus Properti")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ya, Hapus Sekarang" }));
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith("kos-own-1");
    });
  });

  it("useOwnerKos and useOwnerKosForm manage CRUD, validation, and facility toggles", async () => {
    vi.spyOn(ownerService, "getOwnerKos").mockResolvedValue({
      data: [{ _id: "k-1", nama: "Kos 1", jumlahKamar: 5, jumlahKamarTersedia: 2 }],
    });
    vi.spyOn(ownerService, "updateAvailability").mockResolvedValue({ success: true });
    vi.spyOn(ownerService, "submitVerification").mockResolvedValue({ message: "OK" });
    vi.spyOn(ownerService, "deleteKos").mockResolvedValue({ message: "Deleted" });

    const { result: listHook } = renderHook(() => useOwnerKos());
    await waitFor(() => expect(listHook.current.isLoading).toBe(false));

    await act(async () => {
      await listHook.current.handleUpdateAvailability("k-1", 3);
      await listHook.current.handleSubmitVerification("k-1");
      await listHook.current.handleDelete("k-1");
    });
    expect(listHook.current.kosList).toHaveLength(0);

    const { result: formHook } = renderHook(() => useOwnerKosForm());
    act(() => {
      formHook.current.handleChange("nama", "");
      formHook.current.handleFacilityToggle("AC");
      formHook.current.handlePresetCoords({ lat: -7.774, lng: 110.386 });
    });
    expect(formHook.current.formData.fasilitas).toContain("AC");
    expect(formHook.current.formData.latitude).toBe(-7.774);

    await act(async () => {
      await formHook.current.handleSubmit({ preventDefault: () => {} });
    });
    expect(formHook.current.formError).toMatch(/wajib diisi/i);
  });

  it("AdminShell renders portal links and useAdminSubmissions/useAdminUsers run admin workflows", async () => {
    const { unmount: unmountAdmin } = render(
      <AdminShell title="Verifikasi Kos" subtitle="Antrean pengajuan">
        <div>Konten Admin</div>
      </AdminShell>
    );
    expect(screen.getAllByText("Portal Admin").length).toBeGreaterThan(0);
    expect(screen.getByText("Konten Admin")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Verifikasi Kos/i }).length).toBeGreaterThan(0);
    const adminNavLinks = screen.getAllByRole("link").map((el) => el.textContent?.trim());
    expect(adminNavLinks.indexOf("Semua Kos")).toBe(adminNavLinks.indexOf("Pengguna") + 1);
    expect(screen.getAllByRole("link", { name: "Semua Kos" }).every((el) => el.getAttribute("href") === "/admin/kos")).toBe(true);
    expect(screen.getAllByRole("link", { name: "Pesan" }).every((el) => el.getAttribute("href") === "/admin/chat")).toBe(true);
    unmountAdmin();

    useAuth.mockReturnValue({
      user: { _id: "owner-1", nama: "Pemilik", role: "PEMILIK_KOS" },
      isAuthenticated: true,
      loading: false,
      logout: vi.fn(),
    });
    render(
      <OwnerLayout>
        <div>Konten Owner</div>
      </OwnerLayout>
    );
    expect(screen.getAllByText("Portal Pemilik").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Pesan" }).every((el) => el.getAttribute("href") === "/owner/chat")).toBe(true);

    vi.spyOn(adminService, "getSubmissions").mockResolvedValue({
      data: [{ _id: "sub-1", nama: "Kos Pending" }],
    });
    vi.spyOn(adminService, "getSubmissionDetail").mockResolvedValue({
      data: { _id: "sub-1", nama: "Kos Pending" },
    });
    const approveSpy = vi
      .spyOn(adminService, "approveSubmission")
      .mockResolvedValue({ success: true });
    const rejectSpy = vi
      .spyOn(adminService, "rejectSubmission")
      .mockResolvedValue({ success: true });

    const { result: subHook } = renderHook(() => useAdminSubmissions());
    await waitFor(() => expect(subHook.current.isLoading).toBe(false));

    await act(async () => {
      await subHook.current.openDetail("sub-1");
    });
    expect(subHook.current.selected?.nama).toBe("Kos Pending");

    let emptyReject;
    await act(async () => {
      emptyReject = await subHook.current.rejectKos("sub-1", "   ");
    });
    expect(emptyReject.success).toBe(false);
    expect(rejectSpy).not.toHaveBeenCalled();

    await act(async () => {
      await subHook.current.rejectKos("sub-1", "Data kurang");
      await subHook.current.approveKos("sub-1");
    });
    expect(rejectSpy).toHaveBeenCalledWith("sub-1", "Data kurang");
    expect(approveSpy).toHaveBeenCalledWith("sub-1");

    vi.spyOn(adminService, "getUsers").mockResolvedValue({
      data: [
        { _id: "u-1", nama: "Andi", email: "andi@mail.com", role: "PENCARI_KOS" },
        { _id: "u-2", nama: "Sinta", email: "sinta@mail.com", role: "PEMILIK_KOS" },
      ],
    });
    vi.spyOn(adminService, "updateUserRole").mockResolvedValue({
      data: { _id: "u-1", nama: "Andi", email: "andi@mail.com", role: "PEMILIK_KOS" },
    });

    const { result: usersHook } = renderHook(() => useAdminUsers());
    await waitFor(() => expect(usersHook.current.loading).toBe(false));

    act(() => {
      usersHook.current.setQuery("sinta");
    });
    expect(usersHook.current.filtered).toHaveLength(1);

    await act(async () => {
      await usersHook.current.updateRole(
        { _id: "u-1", nama: "Andi", role: "PENCARI_KOS" },
        "PEMILIK_KOS"
      );
    });
    expect(usersHook.current.users[0].role).toBe("PEMILIK_KOS");
  });

  it("AdminKosPage and useAdminKos list all registered kos, filter by status/query, and show detail modal", async () => {
    vi.spyOn(adminService, "getAllKos").mockResolvedValue({
      data: [
        {
          _id: "kos-1",
          nama: "Kos Harmoni",
          lokasi: "Sleman, Yogyakarta",
          tipe: "Putri",
          harga: 1500000,
          jumlahKamar: 10,
          jumlahKamarTersedia: 3,
          statusVerifikasi: "Approved",
          fasilitas: ["WiFi", "AC"],
          ownerId: { _id: "own-1", nama: "Ibu Rina", email: "rina@mail.com", noHp: "08123" },
        },
        {
          _id: "kos-2",
          nama: "Kos Sentosa",
          lokasi: "Depok, Sleman",
          tipe: "Putra",
          harga: 900000,
          jumlahKamar: 8,
          jumlahKamarTersedia: 0,
          statusVerifikasi: "Rejected",
          alasanPenolakan: "Foto buram",
          ownerId: { _id: "own-2", nama: "Pak Budi", email: "budi@mail.com" },
        },
      ],
    });

    const { result: kosHook } = renderHook(() => useAdminKos());
    await waitFor(() => expect(kosHook.current.loading).toBe(false));
    expect(kosHook.current.counts).toEqual({ ALL: 2, Approved: 1, Pending: 0, Rejected: 1 });

    act(() => {
      kosHook.current.setStatusFilter("Rejected");
    });
    expect(kosHook.current.filtered).toHaveLength(1);
    expect(kosHook.current.filtered[0].nama).toBe("Kos Sentosa");

    render(<AdminKosPage />);
    expect(await screen.findByText("Kos Harmoni")).toBeInTheDocument();
    expect(screen.getByText("Kos Sentosa")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Cari kos terdaftar"), {
      target: { value: "Rina" },
    });
    expect(screen.getByText("Kos Harmoni")).toBeInTheDocument();
    expect(screen.queryByText("Kos Sentosa")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Detail" }));
    expect(screen.getByRole("dialog", { name: "Kos Harmoni" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Chat pemilik" })).toHaveAttribute(
      "href",
      "/admin/chat/own-1?kosId=kos-1"
    );
  });
});
