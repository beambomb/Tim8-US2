import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "@/lib/api";
import { authService } from "@/features/auth/services/authService";
import { bookingService } from "@/features/booking/services/bookingService";
import { reviewService } from "@/features/review/services/reviewService";
import { chatService } from "@/features/chat/services/chatService";
import { ownerService } from "@/features/owner/services/ownerService";
import { adminService } from "@/features/admin/services/adminService";
import { kosService } from "@/features/kos/services/kosService";

describe("frontend feature services unit tests", () => {
  beforeEach(() => {
    vi.spyOn(api, "get").mockResolvedValue({ data: { success: true, data: [] } });
    vi.spyOn(api, "post").mockResolvedValue({ data: { success: true } });
    vi.spyOn(api, "put").mockResolvedValue({ data: { success: true } });
    vi.spyOn(api, "patch").mockResolvedValue({ data: { success: true } });
    vi.spyOn(api, "delete").mockResolvedValue({ data: { success: true } });
  });

  it("authService calls auth and saved-campus endpoints with encoded campus IDs", async () => {
    await authService.login({ email: "a@b.c", password: "123" });
    expect(api.post).toHaveBeenCalledWith("/auth/login", { email: "a@b.c", password: "123" });

    await authService.register({ nama: "A", email: "a@b.c", password: "123" });
    expect(api.post).toHaveBeenCalledWith("/auth/register", { nama: "A", email: "a@b.c", password: "123" });

    await authService.getMe();
    expect(api.get).toHaveBeenCalledWith("/auth/me");

    await authService.saveCampus({ id: "UGM" });
    expect(api.post).toHaveBeenCalledWith("/auth/campuses", { id: "UGM" });

    await authService.removeCampus("campus/1");
    expect(api.delete).toHaveBeenCalledWith("/auth/campuses/campus%2F1");
  });

  it("bookingService routes booking requests and status normalization", async () => {
    await bookingService.createBooking({ kosId: "k1", durasiBulan: 3 });
    expect(api.post).toHaveBeenCalledWith("/bookings", { kosId: "k1", durasiBulan: 3 });

    await bookingService.getMyBookings();
    expect(api.get).toHaveBeenCalledWith("/bookings/my");

    await bookingService.cancelBooking("b1");
    expect(api.patch).toHaveBeenCalledWith("/bookings/b1/cancel");

    await bookingService.getOwnerBookings();
    expect(api.get).toHaveBeenCalledWith("/bookings/owner");

    await bookingService.updateBookingStatus("b1", "Disetujui");
    expect(api.patch).toHaveBeenCalledWith("/bookings/b1/approve");

    await bookingService.updateBookingStatus("b1", "rejected");
    expect(api.patch).toHaveBeenCalledWith("/bookings/b1/reject");

    await expect(bookingService.updateBookingStatus("b1", "UNKNOWN")).rejects.toThrow(/tidak valid/i);
  });

  it("chatService handles support contact, messages, kos context null guard, and notifications", async () => {
    expect(await chatService.getKosContext(null)).toBeNull();
    await chatService.getKosContext("k-9");
    expect(api.get).toHaveBeenCalledWith("/kos/k-9");

    await chatService.getSupportContact();
    expect(api.get).toHaveBeenCalledWith("/chat/support");

    await chatService.getInbox();
    expect(api.get).toHaveBeenCalledWith("/chat/inbox");

    await chatService.getMessages("u2");
    expect(api.get).toHaveBeenCalledWith("/chat/u2");

    await chatService.sendMessage("u2", "Halo", "k-9");
    expect(api.post).toHaveBeenCalledWith("/chat/send", {
      receiverId: "u2",
      pesan: "Halo",
      kosId: "k-9",
    });

    await chatService.getNotifications();
    await chatService.markNotificationRead("n1");
    await chatService.markAllNotificationsRead();
    expect(api.get).toHaveBeenCalledWith("/notifications");
    expect(api.patch).toHaveBeenCalledWith("/notifications/n1/read");
    expect(api.patch).toHaveBeenCalledWith("/notifications/read-all");
  });

  it("ownerService covers kos CRUD, availability coercion, booking statuses, and FormData upload", async () => {
    await ownerService.getOwnerKos();
    await ownerService.createKos({ nama: "Kos A" });
    await ownerService.updateKos("k1", { harga: 1000000 });
    await ownerService.deleteKos("k1");
    await ownerService.submitVerification("k1");
    await ownerService.getVerificationStatus("k1");

    expect(api.get).toHaveBeenCalledWith("/owner/kos");
    expect(api.post).toHaveBeenCalledWith("/owner/kos", { nama: "Kos A" });
    expect(api.put).toHaveBeenCalledWith("/owner/kos/k1", { harga: 1000000 });
    expect(api.delete).toHaveBeenCalledWith("/owner/kos/k1");
    expect(api.post).toHaveBeenCalledWith("/owner/kos/k1/submit");
    expect(api.get).toHaveBeenCalledWith("/owner/kos/k1/status");

    await ownerService.updateAvailability("k1", "4");
    expect(api.patch).toHaveBeenCalledWith("/owner/kos/k1/availability", { jumlahKamarTersedia: 4 });

    await ownerService.updateBookingStatus("b9", "APPROVE");
    expect(api.patch).toHaveBeenCalledWith("/bookings/b9/approve");

    await ownerService.updateBookingStatus("b9", "DITOLAK");
    expect(api.patch).toHaveBeenCalledWith("/bookings/b9/reject");

    await expect(ownerService.updateBookingStatus("b9", "BAD")).rejects.toThrow(/tidak valid/i);

    const file1 = new File(["img1"], "a.jpg", { type: "image/jpeg" });
    const file2 = new File(["img2"], "b.jpg", { type: "image/jpeg" });
    await ownerService.uploadImages([file1, file2]);
    const [uploadUrl, formDataArg] = api.post.mock.calls.at(-1);
    expect(uploadUrl).toBe("/owner/upload");
    expect(formDataArg).toBeInstanceOf(FormData);
    expect(formDataArg.getAll("images")).toHaveLength(2);
  });

  it("adminService, reviewService, and kosService call expected endpoints", async () => {
    await adminService.getStats();
    await adminService.getSubmissions();
    await adminService.getSubmissionDetail("k5");
    await adminService.approveSubmission("k5");
    await adminService.rejectSubmission("k5", "Foto buram");
    await adminService.getUsers();
    await adminService.updateUserRole("u5", "PEMILIK_KOS");

    expect(api.get).toHaveBeenCalledWith("/admin/stats");
    expect(api.get).toHaveBeenCalledWith("/admin/submissions/k5");
    expect(api.patch).toHaveBeenCalledWith("/admin/submissions/k5/approve");
    expect(api.patch).toHaveBeenCalledWith("/admin/submissions/k5/reject", { alasanPenolakan: "Foto buram" });
    expect(api.patch).toHaveBeenCalledWith("/admin/users/u5/role", { role: "PEMILIK_KOS" });

    await reviewService.getReviews("k5");
    await reviewService.submitReview("k5", { rating: 5, komentar: "Top" });
    expect(api.get).toHaveBeenCalledWith("/kos/k5/reviews");
    expect(api.post).toHaveBeenCalledWith("/kos/k5/reviews", { rating: 5, komentar: "Top" });

    await kosService.getKosList({ tipe: "Putra" });
    await kosService.getKosDetail("k5");
    await kosService.getFavorites();
    await kosService.addFavorite("k5");
    await kosService.removeFavorite("fav1");
    expect(api.get).toHaveBeenCalledWith("/kos", { params: { tipe: "Putra" } });
    expect(api.get).toHaveBeenCalledWith("/kos/k5");
    expect(api.post).toHaveBeenCalledWith("/favorites", { kosId: "k5" });
    expect(api.delete).toHaveBeenCalledWith("/favorites/fav1");
  });
});
