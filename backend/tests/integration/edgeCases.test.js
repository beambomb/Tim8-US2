import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { createApp } from "../../src/app.js";
import Booking from "../../src/models/Booking.js";
import Kos from "../../src/models/Kos.js";
import Message from "../../src/models/Message.js";
import User from "../../src/models/User.js";
import {
  approveBookingService,
  createBookingService,
} from "../../src/services/bookingService.js";
import { createReviewService } from "../../src/services/reviewService.js";
import { startTestServer, signTestToken } from "../helpers/httpHelper.js";

describe("Complex security & boundary edge-case tests", () => {
  it("Booking service rejects past dates, invalid durations, self-booking, DISETUJUI duplicates, and null kos", async (t) => {
    const userId = new mongoose.Types.ObjectId().toString();
    const ownerId = new mongoose.Types.ObjectId().toString();
    const kosId = new mongoose.Types.ObjectId().toString();

    await assert.rejects(
      () =>
        createBookingService(userId, {
          kosId,
          tanggalMulai: "2027-01-01",
          durasiBulan: 0,
        }),
      (err) => err.statusCode === 400 && /minimal 1 bulan/i.test(err.message)
    );

    await assert.rejects(
      () =>
        createBookingService(userId, {
          kosId,
          tanggalMulai: "2020-01-01",
          durasiBulan: 3,
        }),
      (err) => err.statusCode === 400 && /masa lalu/i.test(err.message)
    );

    t.mock.method(Kos, "findById", async () => ({
      _id: kosId,
      ownerId: userId,
      statusVerifikasi: "Approved",
      jumlahKamarTersedia: 2,
    }));

    await assert.rejects(
      () =>
        createBookingService(userId, {
          kosId,
          tanggalMulai: "2027-01-01",
          durasiBulan: 3,
        }),
      (err) => err.statusCode === 400 && /milik sendiri/i.test(err.message)
    );

    t.mock.method(Kos, "findById", async () => ({
      _id: kosId,
      ownerId,
      statusVerifikasi: "Approved",
      jumlahKamarTersedia: 2,
    }));
    t.mock.method(Booking, "findOne", async () => ({
      _id: "b-active",
      status: "DISETUJUI",
    }));

    await assert.rejects(
      () =>
        createBookingService(userId, {
          kosId,
          tanggalMulai: "2027-01-01",
          durasiBulan: 6,
        }),
      (err) => err.statusCode === 400 && /sewa aktif/i.test(err.message)
    );

    const orphanBookingId = new mongoose.Types.ObjectId().toString();
    t.mock.method(Booking, "findById", () => ({
      populate: async () => ({
        _id: orphanBookingId,
        kosId: null,
        status: "PENDING",
      }),
    }));

    await assert.rejects(
      () => approveBookingService(ownerId, orphanBookingId),
      (err) => err.statusCode === 404
    );
  });

  it("Auth endpoints return 400 on missing fields and normalize email casing & whitespace", async (t) => {
    let savedUserEmail = null;
    t.mock.method(User, "findOne", async ({ email }) => {
      if (email === "budi@example.com" && savedUserEmail) {
        return {
          _id: new mongoose.Types.ObjectId().toString(),
          nama: "Budi",
          email: "budi@example.com",
          password: "$2b$10$invalidhashplaceholder",
          role: "PENCARI_KOS",
        };
      }
      return null;
    });
    t.mock.method(User.prototype, "save", async function saveMock() {
      savedUserEmail = this.email;
      return this;
    });

    const server = await startTestServer(createApp());
    try {
      const emptyReg = await fetch(`${server.baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      assert.equal(emptyReg.status, 400);

      const emptyLogin = await fetch(`${server.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "  " }),
      });
      assert.equal(emptyLogin.status, 400);

      const regRes = await fetch(`${server.baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: "  Budi Santoso  ",
          email: "  Budi@Example.COM ",
          password: "secret123",
        }),
      });
      assert.equal(regRes.status, 201);
      assert.equal(savedUserEmail, "budi@example.com");
    } finally {
      await server.close();
    }
  });

  it("Owner endpoints reject negative prices/availability, whitelist PUT fields, and clamp availability", async (t) => {
    const ownerId = new mongoose.Types.ObjectId().toString();
    const kosId = new mongoose.Types.ObjectId().toString();
    const ownerToken = signTestToken({ id: ownerId, role: "PEMILIK_KOS" });

    let capturedUpdateSet = null;
    t.mock.method(Kos, "findOneAndUpdate", async (_filter, update) => {
      capturedUpdateSet = update?.$set;
      return { _id: kosId, ownerId, ...(update?.$set || {}) };
    });

    const server = await startTestServer(createApp());
    try {
      const badPrice = await fetch(`${server.baseUrl}/api/owner/kos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          nama: "Kos Minus",
          harga: -50000,
          lokasi: "Sleman",
          latitude: 0,
          longitude: 0,
          tipe: "Putra",
          jumlahKamar: 5,
        }),
      });
      assert.equal(badPrice.status, 400);

      const badAvail = await fetch(
        `${server.baseUrl}/api/owner/kos/${kosId}/availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ownerToken}`,
          },
          body: JSON.stringify({ jumlahKamarTersedia: -1 }),
        }
      );
      assert.equal(badAvail.status, 400);

      const updateRes = await fetch(`${server.baseUrl}/api/owner/kos/${kosId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          nama: "Kos Aman",
          jumlahKamar: 4,
          jumlahKamarTersedia: 99,
          statusVerifikasi: "Approved",
          ownerId: "attacker-id",
        }),
      });
      assert.equal(updateRes.status, 200);
      assert.equal(capturedUpdateSet.statusVerifikasi, undefined);
      assert.equal(capturedUpdateSet.ownerId, undefined);
      assert.equal(capturedUpdateSet.jumlahKamarTersedia, 4);
    } finally {
      await server.close();
    }
  });

  it("Admin, Kos search, and Chat endpoints guard invalid ObjectIds, regex chars, whitespace, and self-demotion", async (t) => {
    const adminId = new mongoose.Types.ObjectId().toString();
    const adminToken = signTestToken({ id: adminId, role: "ADMIN" });

    let capturedFilter = null;
    t.mock.method(Kos, "find", (filter) => {
      capturedFilter = filter;
      return {
        populate: async () => [],
      };
    });
    t.mock.method(Message, "find", () => ({
      sort: () => ({
        populate: () => ({
          populate: () => ({
            populate: async () => [],
          }),
        }),
      }),
    }));

    const server = await startTestServer(createApp());
    try {
      const badSubId = await fetch(
        `${server.baseUrl}/api/admin/submissions/not-valid-id/approve`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      assert.equal(badSubId.status, 400);

      const blankReject = await fetch(
        `${server.baseUrl}/api/admin/submissions/${new mongoose.Types.ObjectId().toString()}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ alasanPenolakan: "    " }),
        }
      );
      assert.equal(blankReject.status, 400);

      const selfDemote = await fetch(
        `${server.baseUrl}/api/admin/users/${adminId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ role: "PENCARI_KOS" }),
        }
      );
      assert.equal(selfDemote.status, 400);

      const regexSearch = await fetch(
        `${server.baseUrl}/api/kos?lokasi=${encodeURIComponent("Kos (UGM) [Baru]*")}&hargaMin=abc`
      );
      assert.equal(regexSearch.status, 200);
      assert.equal(capturedFilter.harga, undefined);
      assert.doesNotThrow(() => new RegExp(capturedFilter.lokasi.$regex, "i"));

      const badChatId = await fetch(`${server.baseUrl}/api/chat/invalid-user`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(badChatId.status, 400);

      const blankMsg = await fetch(`${server.baseUrl}/api/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          receiverId: new mongoose.Types.ObjectId().toString(),
          pesan: "   \n  ",
        }),
      });
      assert.equal(blankMsg.status, 400);

      await assert.rejects(
        () =>
          createReviewService(adminId, new mongoose.Types.ObjectId().toString(), {
            rating: 5,
            komentar: "    ",
          }),
        (err) => err.statusCode === 400 && /wajib diisi/i.test(err.message)
      );

      const ownerToken = signTestToken({ id: adminId, role: "PEMILIK_KOS" });
      const badUploadForm = new FormData();
      badUploadForm.append(
        "images",
        new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" }),
        "kamar.png"
      );
      const badUploadKosId = await fetch(
        `${server.baseUrl}/api/owner/kos/invalid-id/images`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${ownerToken}` },
          body: badUploadForm,
        }
      );
      assert.equal(badUploadKosId.status, 400);
    } finally {
      await server.close();
    }
  });
});
