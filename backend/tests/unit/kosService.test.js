import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Kos from "../../src/models/Kos.js";
import {
  computeDistanceMeters,
  getAllKosService,
  getKosByIdService,
  getNearbyKosService,
} from "../../src/services/kosService.js";

describe("kosService unit tests", () => {
  it("computeDistanceMeters returns 0 for identical coordinates", () => {
    assert.equal(computeDistanceMeters(-7.7713, 110.3775, -7.7713, 110.3775), 0);
  });

  it("computeDistanceMeters accurately computes symmetric distance between UGM and UNY", () => {
    const d1 = computeDistanceMeters(-7.7713, 110.3775, -7.7749, 110.3867);
    const d2 = computeDistanceMeters(-7.7749, 110.3867, -7.7713, 110.3775);

    assert.equal(d1, d2);
    assert.ok(d1 > 900 && d1 < 1300, `Expected ~1090m, got ${d1}m`);
  });

  it("getKosByIdService throws 400 for invalid ObjectId format", async () => {
    await assert.rejects(
      () => getKosByIdService("not-a-valid-object-id"),
      (err) => err.statusCode === 400 && /tidak valid/i.test(err.message)
    );
  });

  it("getKosByIdService throws 404 when kos does not exist or is unapproved", async (t) => {
    const validId = new mongoose.Types.ObjectId().toString();

    t.mock.method(Kos, "findById", () => ({
      populate: async () => null,
    }));

    await assert.rejects(
      () => getKosByIdService(validId),
      (err) => err.statusCode === 404
    );

    t.mock.method(Kos, "findById", () => ({
      populate: async () => ({ _id: validId, statusVerifikasi: "Pending" }),
    }));

    await assert.rejects(
      () => getKosByIdService(validId),
      (err) => err.statusCode === 404 && /tidak ditemukan/i.test(err.message)
    );
  });

  it("getAllKosService builds filter criteria and rejects invalid coordinates", async (t) => {
    let capturedFilter = null;
    t.mock.method(Kos, "find", async (filter) => {
      capturedFilter = filter;
      return [];
    });

    await getAllKosService({
      hargaMin: "500000",
      hargaMax: "1500000",
      lokasi: "Pogung",
      tipe: "Putra",
      fasilitas: "WiFi",
      tersedia: "true",
    });

    assert.equal(capturedFilter.statusVerifikasi, "Approved");
    assert.deepEqual(capturedFilter.harga, { $gte: 500000, $lte: 1500000 });
    assert.equal(capturedFilter.lokasi.$regex, "Pogung");
    assert.equal(capturedFilter.tipe.$regex, "Putra");
    assert.equal(capturedFilter.fasilitas.$regex, "WiFi");
    assert.deepEqual(capturedFilter.jumlahKamarTersedia, { $gt: 0 });

    await assert.rejects(
      () => getAllKosService({ lat: "abc", lng: "110.3775" }),
      (err) => err.statusCode === 400
    );
  });

  it("getNearbyKosService throws 400 when coordinates are missing and sorts matches by distance", async (t) => {
    await assert.rejects(
      () => getNearbyKosService(undefined, 110.3775),
      (err) => err.statusCode === 400
    );

    const mockKosDocs = [
      {
        _id: "far",
        namaKos: "Kos Jauh",
        latitude: -7.83,
        longitude: 110.3775,
        toObject() {
          return { _id: this._id, namaKos: this.namaKos, latitude: this.latitude, longitude: this.longitude };
        },
      },
      {
        _id: "near",
        namaKos: "Kos Dekat",
        latitude: -7.772,
        longitude: 110.378,
        toObject() {
          return { _id: this._id, namaKos: this.namaKos, latitude: this.latitude, longitude: this.longitude };
        },
      },
      {
        _id: "mid",
        namaKos: "Kos Sedang",
        latitude: -7.78,
        longitude: 110.382,
        toObject() {
          return { _id: this._id, namaKos: this.namaKos, latitude: this.latitude, longitude: this.longitude };
        },
      },
    ];

    t.mock.method(Kos, "find", () => ({
      populate: async () => mockKosDocs,
    }));

    const nearby = await getNearbyKosService(-7.7713, 110.3775, 2500);
    assert.deepEqual(
      nearby.map((item) => item._id),
      ["near", "mid"]
    );
    assert.ok(nearby[0].jarakMeter < nearby[1].jarakMeter);
    assert.equal(nearby[0].jarakKm, (nearby[0].jarakMeter / 1000).toFixed(2));
  });
});
