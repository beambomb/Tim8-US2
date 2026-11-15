import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Kos from "../../src/models/Kos.js";
import Booking from "../../src/models/Booking.js";
import Notification from "../../src/models/Notification.js";
import { createApp } from "../../src/app.js";
import { startTestServer, signTestToken } from "../helpers/httpHelper.js";

describe("bookingRoutes and ownerRoutes HTTP RBAC integration tests", () => {
  it("POST /api/bookings enforces PENCARI_KOS role and creates booking with notification", async (t) => {
    const kosId = new mongoose.Types.ObjectId().toString();
    const ownerId = new mongoose.Types.ObjectId().toString();
    const userId = new mongoose.Types.ObjectId().toString();

    t.mock.method(Kos, "findById", async () => ({
      _id: kosId,
      ownerId,
      nama: "Kos Harmoni",
      statusVerifikasi: "Approved",
      jumlahKamarTersedia: 3,
    }));
    t.mock.method(Booking, "findOne", async () => null);
    t.mock.method(Booking, "create", async (payload) => ({
      ...payload,
      _id: new mongoose.Types.ObjectId().toString(),
      populate: async () => ({
        ...payload,
        _id: "b-1",
        kosId: { _id: kosId, ownerId, nama: "Kos Harmoni" },
        userId: { _id: userId, nama: "Dewi" },
      }),
    }));
    t.mock.method(Notification, "create", async (doc) => doc);

    const server = await startTestServer(createApp());
    try {
      const guestRes = await fetch(`${server.baseUrl}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kosId, tanggalMulai: "2026-12-01", durasiBulan: 6 }),
      });
      assert.equal(guestRes.status, 401);

      const ownerToken = signTestToken({ id: ownerId, role: "PEMILIK_KOS" });
      const ownerRes = await fetch(`${server.baseUrl}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({ kosId, tanggalMulai: "2026-12-01", durasiBulan: 6 }),
      });
      assert.equal(ownerRes.status, 403);

      const pencariToken = signTestToken({ id: userId, role: "PENCARI_KOS" });
      const okRes = await fetch(`${server.baseUrl}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pencariToken}`,
        },
        body: JSON.stringify({ kosId, tanggalMulai: "2026-12-01", durasiBulan: 6 }),
      });
      const body = await okRes.json();

      assert.equal(okRes.status, 201);
      assert.equal(body.success, true);
      assert.equal(body.data.status, "PENDING");
    } finally {
      await server.close();
    }
  });

  it("PATCH /api/bookings/:id/status routes Rejected status for PEMILIK_KOS and blocks PENCARI_KOS", async (t) => {
    const bookingId = new mongoose.Types.ObjectId().toString();
    const ownerId = new mongoose.Types.ObjectId().toString();
    const pencariId = new mongoose.Types.ObjectId().toString();

    t.mock.method(Booking, "findById", () => ({
      populate: async () => ({
        _id: bookingId,
        status: "PENDING",
        kosId: { _id: "kos-1", ownerId, nama: "Kos Melati" },
      }),
    }));
    t.mock.method(Booking, "findOneAndUpdate", () => ({
      populate: async () => ({
        _id: bookingId,
        userId: pencariId,
        status: "DITOLAK",
        kosId: { _id: "kos-1", nama: "Kos Melati" },
      }),
    }));
    t.mock.method(Notification, "create", async (doc) => doc);

    const server = await startTestServer(createApp());
    try {
      const pencariToken = signTestToken({ id: pencariId, role: "PENCARI_KOS" });
      const forbiddenRes = await fetch(`${server.baseUrl}/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pencariToken}`,
        },
        body: JSON.stringify({ status: "Rejected" }),
      });
      assert.equal(forbiddenRes.status, 403);

      const ownerToken = signTestToken({ id: ownerId, role: "PEMILIK_KOS" });
      const okRes = await fetch(`${server.baseUrl}/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({ status: "Rejected" }),
      });
      const body = await okRes.json();

      assert.equal(okRes.status, 200);
      assert.equal(body.data.status, "DITOLAK");
    } finally {
      await server.close();
    }
  });

  it("GET /api/owner/kos restricts access to PEMILIK_KOS only", async (t) => {
    const ownerId = new mongoose.Types.ObjectId().toString();
    t.mock.method(Kos, "find", async () => [
      { _id: "k-owned", nama: "Kos Milik Saya", ownerId },
    ]);

    const server = await startTestServer(createApp());
    try {
      const guestRes = await fetch(`${server.baseUrl}/api/owner/kos`);
      assert.equal(guestRes.status, 401);

      const pencariToken = signTestToken({ id: "u-1", role: "PENCARI_KOS" });
      const pencariRes = await fetch(`${server.baseUrl}/api/owner/kos`, {
        headers: { Authorization: `Bearer ${pencariToken}` },
      });
      assert.equal(pencariRes.status, 403);

      const ownerToken = signTestToken({ id: ownerId, role: "PEMILIK_KOS" });
      const okRes = await fetch(`${server.baseUrl}/api/owner/kos`, {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });
      const body = await okRes.json();

      assert.equal(okRes.status, 200);
      assert.equal(body.data.length, 1);
      assert.equal(body.data[0].nama, "Kos Milik Saya");
    } finally {
      await server.close();
    }
  });
});
