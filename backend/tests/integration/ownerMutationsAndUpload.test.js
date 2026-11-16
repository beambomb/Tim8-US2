import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import mongoose from "mongoose";
import cloudinary from "../../config/cloudinary.js";
import { createApp } from "../../src/app.js";
import Booking from "../../src/models/Booking.js";
import Favorite from "../../src/models/Favorite.js";
import Kos from "../../src/models/Kos.js";
import Message from "../../src/models/Message.js";
import Notification from "../../src/models/Notification.js";
import Review from "../../src/models/Review.js";
import { startTestServer, signTestToken } from "../helpers/httpHelper.js";

describe("ownerRoutes mutations and image upload HTTP integration tests", () => {
  it("POST/PUT/DELETE/PATCH /api/owner/kos validates required fields and executes owner CRUD", async (t) => {
    const ownerId = new mongoose.Types.ObjectId().toString();
    const kosId = new mongoose.Types.ObjectId().toString();
    const ownerToken = signTestToken({ id: ownerId, role: "PEMILIK_KOS" });

    t.mock.method(Kos.prototype, "save", async function saveMock() {
      return {
        _id: kosId,
        ownerId,
        nama: this.nama,
        harga: this.harga,
        lokasi: this.lokasi,
        latitude: this.latitude,
        longitude: this.longitude,
        tipe: this.tipe,
        jumlahKamar: this.jumlahKamar,
        jumlahKamarTersedia: this.jumlahKamarTersedia,
        statusVerifikasi: this.statusVerifikasi,
      };
    });
    t.mock.method(Kos, "findOneAndUpdate", async (_filter, update) => ({
      _id: kosId,
      ownerId,
      nama: "Kos Updated",
      ...(update?.$set || {}),
    }));
    t.mock.method(Kos, "findOne", () => ({
      select: async () => ({
        _id: kosId,
        nama: "Kos Updated",
        statusVerifikasi: "Pending",
        alasanPenolakan: null,
      }),
    }));
    t.mock.method(Kos, "findOneAndDelete", async () => ({
      _id: kosId,
      fotoUrls: [],
    }));
    t.mock.method(Booking, "deleteMany", async () => ({ deletedCount: 1 }));
    t.mock.method(Review, "deleteMany", async () => ({ deletedCount: 0 }));
    t.mock.method(Favorite, "deleteMany", async () => ({ deletedCount: 1 }));
    t.mock.method(Notification, "deleteMany", async () => ({ deletedCount: 0 }));
    t.mock.method(Message, "updateMany", async () => ({ modifiedCount: 0 }));

    const server = await startTestServer(createApp());
    try {
      const invalidCreateRes = await fetch(`${server.baseUrl}/api/owner/kos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({ nama: "Kurang Field" }),
      });
      assert.equal(invalidCreateRes.status, 400);

      const createRes = await fetch(`${server.baseUrl}/api/owner/kos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          nama: "Kos Melati Baru",
          harga: 1200000,
          lokasi: "Sleman",
          latitude: -7.766,
          longitude: 110.374,
          tipe: "Putri",
          jumlahKamar: 8,
          fasilitas: ["WiFi Cepat"],
          fotoUrls: ["https://example.com/1.jpg"],
        }),
      });
      const createBody = await createRes.json();
      assert.equal(createRes.status, 201);
      assert.equal(createBody.data.statusVerifikasi, "Pending");

      const updateRes = await fetch(`${server.baseUrl}/api/owner/kos/${kosId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({ harga: 1350000 }),
      });
      const updateBody = await updateRes.json();
      assert.equal(updateRes.status, 200);
      assert.equal(updateBody.data.harga, 1350000);

      const availRes = await fetch(
        `${server.baseUrl}/api/owner/kos/${kosId}/availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ownerToken}`,
          },
          body: JSON.stringify({ jumlahKamarTersedia: 3 }),
        }
      );
      const availBody = await availRes.json();
      assert.equal(availRes.status, 200);
      assert.equal(availBody.data.jumlahKamarTersedia, 3);

      const submitRes = await fetch(
        `${server.baseUrl}/api/owner/kos/${kosId}/submit`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${ownerToken}` },
        }
      );
      assert.equal(submitRes.status, 200);

      const statusRes = await fetch(
        `${server.baseUrl}/api/owner/kos/${kosId}/status`,
        {
          headers: { Authorization: `Bearer ${ownerToken}` },
        }
      );
      const statusBody = await statusRes.json();
      assert.equal(statusRes.status, 200);
      assert.equal(statusBody.data.statusVerifikasi, "Pending");

      const delRes = await fetch(`${server.baseUrl}/api/owner/kos/${kosId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${ownerToken}` },
      });
      assert.equal(delRes.status, 200);
    } finally {
      await server.close();
    }
  });

  it("upload endpoints parse multipart image buffers to Cloudinary and reject non-image files", async (t) => {
    const ownerToken = signTestToken({ id: "owner-upload-1", role: "PEMILIK_KOS" });
    const kosId = new mongoose.Types.ObjectId().toString();
    const uploadedUrl = "https://res.cloudinary.com/demo/image/upload/v1/carikos/sample.png";

    t.mock.method(cloudinary.uploader, "upload_stream", (_options, cb) => {
      const stream = new PassThrough();
      stream.on("finish", () => cb(null, { secure_url: uploadedUrl }));
      return stream;
    });

    t.mock.method(Kos, "findOneAndUpdate", async (_filter, update) => ({
      _id: kosId,
      fotoUrls: update?.$push?.fotoUrls?.$each || [],
    }));

    const server = await startTestServer(createApp());
    try {
      const emptyUploadRes = await fetch(`${server.baseUrl}/api/owner/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${ownerToken}` },
      });
      assert.equal(emptyUploadRes.status, 400);

      const badForm = new FormData();
      badForm.append(
        "images",
        new Blob(["plain text"], { type: "text/plain" }),
        "note.txt"
      );
      const badFileRes = await fetch(`${server.baseUrl}/api/owner/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${ownerToken}` },
        body: badForm,
      });
      const badFileBody = await badFileRes.json();
      assert.equal(badFileRes.status, 500);
      assert.match(badFileBody.message, /Hanya file gambar/i);

      const goodForm = new FormData();
      goodForm.append(
        "images",
        new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" }),
        "kamar.png"
      );
      const goodRes = await fetch(`${server.baseUrl}/api/owner/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${ownerToken}` },
        body: goodForm,
      });
      const goodBody = await goodRes.json();
      assert.equal(goodRes.status, 200);
      assert.deepEqual(goodBody.data.urls, [uploadedUrl]);

      const attachForm = new FormData();
      attachForm.append(
        "images",
        new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" }),
        "kamar2.png"
      );
      const attachRes = await fetch(
        `${server.baseUrl}/api/owner/kos/${kosId}/images`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${ownerToken}` },
          body: attachForm,
        }
      );
      const attachBody = await attachRes.json();
      assert.equal(attachRes.status, 200);
      assert.deepEqual(attachBody.data.fotoUrls, [uploadedUrl]);

      const removeMissingUrlRes = await fetch(
        `${server.baseUrl}/api/owner/kos/${kosId}/images`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ownerToken}`,
          },
          body: JSON.stringify({}),
        }
      );
      assert.equal(removeMissingUrlRes.status, 400);

      const removeRes = await fetch(
        `${server.baseUrl}/api/owner/kos/${kosId}/images`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ownerToken}`,
          },
          body: JSON.stringify({ imageUrl: uploadedUrl }),
        }
      );
      assert.equal(removeRes.status, 200);
    } finally {
      await server.close();
    }
  });
});
