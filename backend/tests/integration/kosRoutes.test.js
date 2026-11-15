import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Kos from "../../src/models/Kos.js";
import Review from "../../src/models/Review.js";
import { createApp } from "../../src/app.js";
import { startTestServer, signTestToken } from "../helpers/httpHelper.js";

describe("kosRoutes HTTP integration tests", () => {
  it("GET /api/kos returns approved catalog list", async (t) => {
    const sampleKos = [
      { _id: "k1", namaKos: "Kos Pogung Asri", statusVerifikasi: "Approved", harga: 950000 },
    ];
    t.mock.method(Kos, "find", async () => sampleKos);

    const server = await startTestServer(createApp());
    try {
      const res = await fetch(`${server.baseUrl}/api/kos?tipe=Putra`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.data.length, 1);
      assert.equal(body.data[0].namaKos, "Kos Pogung Asri");
    } finally {
      await server.close();
    }
  });

  it("GET /api/kos/nearby returns 400 when lat/lng missing and 200 with distance sorting", async (t) => {
    const mockDocs = [
      {
        _id: "k-far",
        namaKos: "Kos Agak Jauh",
        latitude: -7.78,
        longitude: 110.382,
        toObject() {
          return { _id: this._id, namaKos: this.namaKos, latitude: this.latitude, longitude: this.longitude };
        },
      },
      {
        _id: "k-near",
        namaKos: "Kos Sangat Dekat",
        latitude: -7.7718,
        longitude: 110.3779,
        toObject() {
          return { _id: this._id, namaKos: this.namaKos, latitude: this.latitude, longitude: this.longitude };
        },
      },
    ];
    t.mock.method(Kos, "find", () => ({
      populate: async () => mockDocs,
    }));

    const server = await startTestServer(createApp());
    try {
      const badRes = await fetch(`${server.baseUrl}/api/kos/nearby`);
      assert.equal(badRes.status, 400);

      const okRes = await fetch(
        `${server.baseUrl}/api/kos/nearby?lat=-7.7713&lng=110.3775&radius=3000`
      );
      const body = await okRes.json();

      assert.equal(okRes.status, 200);
      assert.equal(body.total, 2);
      assert.equal(body.data[0]._id, "k-near");
      assert.ok(body.data[0].jarakMeter <= body.data[1].jarakMeter);
    } finally {
      await server.close();
    }
  });

  it("GET /api/kos/campuses returns preset campuses when query is omitted", async () => {
    const server = await startTestServer(createApp());
    try {
      const res = await fetch(`${server.baseUrl}/api/kos/campuses`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.ok(body.total >= 6);
      assert.ok(body.data.some((c) => c.id === "UGM"));
    } finally {
      await server.close();
    }
  });

  it("GET /api/kos/:id returns 400 for invalid ObjectId and 200 for approved kos", async (t) => {
    const validId = new mongoose.Types.ObjectId().toString();
    t.mock.method(Kos, "findById", () => ({
      populate: async () => ({
        _id: validId,
        namaKos: "Kos Terverifikasi",
        statusVerifikasi: "Approved",
      }),
    }));

    const server = await startTestServer(createApp());
    try {
      const badRes = await fetch(`${server.baseUrl}/api/kos/invalid-id`);
      assert.equal(badRes.status, 400);

      const okRes = await fetch(`${server.baseUrl}/api/kos/${validId}`);
      const body = await okRes.json();
      assert.equal(okRes.status, 200);
      assert.equal(body.data.namaKos, "Kos Terverifikasi");
    } finally {
      await server.close();
    }
  });

  it("POST /api/kos/:id/reviews enforces PENCARI_KOS role and creates review on valid request", async (t) => {
    const kosId = new mongoose.Types.ObjectId().toString();
    const pencariId = new mongoose.Types.ObjectId().toString();

    t.mock.method(Kos, "findById", async () => ({
      _id: kosId,
      statusVerifikasi: "Approved",
    }));
    t.mock.method(Review, "findOne", async () => null);
    t.mock.method(Review, "create", async (doc) => ({
      ...doc,
      _id: "rev-1",
      populate: async () => ({ ...doc, _id: "rev-1", userId: { _id: pencariId, nama: "Sari" } }),
    }));

    const server = await startTestServer(createApp());
    try {
      const guestRes = await fetch(`${server.baseUrl}/api/kos/${kosId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: 5, komentar: "Bersih" }),
      });
      assert.equal(guestRes.status, 401);

      const ownerToken = signTestToken({ id: "owner-1", role: "PEMILIK_KOS" });
      const ownerRes = await fetch(`${server.baseUrl}/api/kos/${kosId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({ rating: 5, komentar: "Bersih" }),
      });
      assert.equal(ownerRes.status, 403);

      const pencariToken = signTestToken({ id: pencariId, role: "PENCARI_KOS" });
      const okRes = await fetch(`${server.baseUrl}/api/kos/${kosId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pencariToken}`,
        },
        body: JSON.stringify({ rating: 5, komentar: "Lingkungan tenang dan bersih" }),
      });
      const okBody = await okRes.json();

      assert.equal(okRes.status, 201);
      assert.equal(okBody.success, true);
      assert.equal(okBody.data.rating, 5);
    } finally {
      await server.close();
    }
  });
});
