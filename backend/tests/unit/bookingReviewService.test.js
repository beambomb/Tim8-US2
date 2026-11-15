import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Kos from "../../src/models/Kos.js";
import Booking from "../../src/models/Booking.js";
import Review from "../../src/models/Review.js";
import {
  createBookingService,
  cancelBookingService,
  approveBookingService,
} from "../../src/services/bookingService.js";
import {
  createReviewService,
  getKosReviewsService,
} from "../../src/services/reviewService.js";

describe("bookingService and reviewService unit tests", () => {
  it("createBookingService validates required fields and kos ObjectId", async () => {
    await assert.rejects(
      () => createBookingService("user-1", { kosId: "abc" }),
      (err) => err.statusCode === 400 && /wajib diisi/i.test(err.message)
    );

    await assert.rejects(
      () =>
        createBookingService("user-1", {
          kosId: "bad-id",
          tanggalMulai: "2026-12-01",
          durasiBulan: 6,
        }),
      (err) => err.statusCode === 400 && /ID kos tidak valid/i.test(err.message)
    );
  });

  it("createBookingService rejects full kos and duplicate pending booking", async (t) => {
    const kosId = new mongoose.Types.ObjectId().toString();

    t.mock.method(Kos, "findById", async () => ({
      _id: kosId,
      statusVerifikasi: "Approved",
      jumlahKamarTersedia: 0,
    }));

    await assert.rejects(
      () =>
        createBookingService("user-1", {
          kosId,
          tanggalMulai: "2026-12-01",
          durasiBulan: 3,
        }),
      (err) => err.statusCode === 400 && /penuh/i.test(err.message)
    );

    t.mock.method(Kos, "findById", async () => ({
      _id: kosId,
      statusVerifikasi: "Approved",
      jumlahKamarTersedia: 2,
    }));
    t.mock.method(Booking, "findOne", async () => ({ _id: "pending-1" }));

    await assert.rejects(
      () =>
        createBookingService("user-1", {
          kosId,
          tanggalMulai: "2026-12-01",
          durasiSewa: 3,
        }),
      (err) => err.statusCode === 400 && /menunggu konfirmasi/i.test(err.message)
    );
  });

  it("cancelBookingService rejects invalid ID and non-PENDING bookings", async (t) => {
    await assert.rejects(
      () => cancelBookingService("user-1", "invalid-id"),
      (err) => err.statusCode === 400
    );

    const bookingId = new mongoose.Types.ObjectId().toString();
    t.mock.method(Booking, "findOne", async () => ({
      _id: bookingId,
      status: "DISETUJUI",
    }));

    await assert.rejects(
      () => cancelBookingService("user-1", bookingId),
      (err) => err.statusCode === 400 && /DISETUJUI/.test(err.message)
    );
  });

  it("approveBookingService enforces kos ownership (403)", async (t) => {
    const bookingId = new mongoose.Types.ObjectId().toString();
    t.mock.method(Booking, "findById", () => ({
      populate: async () => ({
        _id: bookingId,
        status: "PENDING",
        kosId: { _id: "kos-1", ownerId: "owner-real" },
      }),
    }));

    await assert.rejects(
      () => approveBookingService("owner-impostor", bookingId),
      (err) => err.statusCode === 403 && /hak akses/i.test(err.message)
    );
  });

  it("createReviewService validates rating range 1-5 and duplicate review", async (t) => {
    const kosId = new mongoose.Types.ObjectId().toString();

    await assert.rejects(
      () => createReviewService("user-1", kosId, { rating: 6, komentar: "Bagus" }),
      (err) => err.statusCode === 400 && /1 sampai 5/i.test(err.message)
    );

    t.mock.method(Kos, "findById", async () => ({
      _id: kosId,
      statusVerifikasi: "Approved",
    }));
    t.mock.method(Review, "findOne", async () => ({ _id: "existing-review" }));

    await assert.rejects(
      () => createReviewService("user-1", kosId, { rating: 5, komentar: "Nyaman" }),
      (err) => err.statusCode === 400 && /sudah memberikan ulasan/i.test(err.message)
    );
  });

  it("getKosReviewsService computes total count and 1-decimal averageRating", async (t) => {
    const kosId = new mongoose.Types.ObjectId().toString();

    t.mock.method(Review, "find", () => ({
      populate: () => ({
        sort: async () => [{ rating: 5 }, { rating: 4 }, { rating: 4 }],
      }),
    }));

    const summary = await getKosReviewsService(kosId);
    assert.equal(summary.total, 3);
    assert.equal(summary.averageRating, 4.3);

    t.mock.method(Review, "find", () => ({
      populate: () => ({
        sort: async () => [],
      }),
    }));

    const emptySummary = await getKosReviewsService(kosId);
    assert.equal(emptySummary.total, 0);
    assert.equal(emptySummary.averageRating, 0);
  });
});
