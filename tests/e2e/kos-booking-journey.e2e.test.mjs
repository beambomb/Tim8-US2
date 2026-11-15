import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { startE2EServer } from "./helpers/e2eHarness.mjs";

async function jsonRequest(url, { method = "GET", token, body } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: res.status, data: await res.json() };
}

describe("E2E multi-role kos submission, discovery, booking, and review journey", () => {
  it("completes end-to-end flow from owner submission & admin approval to booking stock decrement and review", async (t) => {
    const env = await startE2EServer(t);

    try {
      // 1. Register & login Pemilik Kos and Pencari Kos
      const regOwner = await jsonRequest(`${env.baseUrl}/api/auth/register`, {
        method: "POST",
        body: {
          nama: "Pemilik E2E",
          email: "owner.e2e@carikos.id",
          password: "Password123!",
          role: "PEMILIK_KOS",
        },
      });
      assert.equal(regOwner.status, 201);

      const regPencari = await jsonRequest(`${env.baseUrl}/api/auth/register`, {
        method: "POST",
        body: {
          nama: "Pencari E2E",
          email: "pencari.e2e@carikos.id",
          password: "Password123!",
          role: "PENCARI_KOS",
        },
      });
      assert.equal(regPencari.status, 201);

      const loginOwner = await jsonRequest(`${env.baseUrl}/api/auth/login`, {
        method: "POST",
        body: { email: "owner.e2e@carikos.id", password: "Password123!" },
      });
      const loginPencari = await jsonRequest(`${env.baseUrl}/api/auth/login`, {
        method: "POST",
        body: { email: "pencari.e2e@carikos.id", password: "Password123!" },
      });
      const loginAdmin = await jsonRequest(`${env.baseUrl}/api/auth/login`, {
        method: "POST",
        body: { email: "admin@carikos.id", password: "AdminPass123!" },
      });

      const ownerToken = loginOwner.data.token;
      const pencariToken = loginPencari.data.token;
      const adminToken = loginAdmin.data.token;
      assert.ok(ownerToken && pencariToken && adminToken);

      // 2. Owner creates a kos (initially Pending, hidden from public catalog)
      const createKos = await jsonRequest(`${env.baseUrl}/api/owner/kos`, {
        method: "POST",
        token: ownerToken,
        body: {
          nama: "Kos Pogung Sejahtera",
          harga: 1200000,
          lokasi: "Pogung Baru, Sleman",
          latitude: -7.769,
          longitude: 110.376,
          tipe: "Putra",
          fasilitas: ["WiFi", "AC"],
          jumlahKamar: 2,
        },
      });
      assert.equal(createKos.status, 201);
      const kosId = createKos.data.data._id;

      const beforeApprove = await jsonRequest(`${env.baseUrl}/api/kos`);
      assert.equal(beforeApprove.data.data.length, 0);

      // 3. Admin inspects pending submissions & approves kos
      const pendingList = await jsonRequest(`${env.baseUrl}/api/admin/submissions`, {
        token: adminToken,
      });
      assert.equal(pendingList.status, 200);
      assert.equal(pendingList.data.total, 1);

      const approveKos = await jsonRequest(
        `${env.baseUrl}/api/admin/submissions/${kosId}/approve`,
        { method: "PATCH", token: adminToken }
      );
      assert.equal(approveKos.status, 200);
      assert.equal(approveKos.data.data.statusVerifikasi, "Approved");

      // 4. Pencari searches nearby UGM (-7.7713, 110.3775)
      const nearbyRes = await jsonRequest(
        `${env.baseUrl}/api/kos/nearby?lat=-7.7713&lng=110.3775&radius=2000`
      );
      assert.equal(nearbyRes.status, 200);
      assert.equal(nearbyRes.data.total, 1);
      assert.equal(nearbyRes.data.data[0]._id, kosId);

      // 5. Pencari submits booking & Owner approves -> available rooms drop from 2 to 1
      const createBooking = await jsonRequest(`${env.baseUrl}/api/bookings`, {
        method: "POST",
        token: pencariToken,
        body: { kosId, tanggalMulai: "2026-12-01", durasiBulan: 6, catatan: "Masuk pagi" },
      });
      assert.equal(createBooking.status, 201);
      const bookingId = createBooking.data.data._id;

      const approveBooking = await jsonRequest(
        `${env.baseUrl}/api/bookings/${bookingId}/approve`,
        { method: "PATCH", token: ownerToken }
      );
      assert.equal(approveBooking.status, 200);
      assert.equal(approveBooking.data.data.status, "DISETUJUI");

      const kosDetailAfterBooking = await jsonRequest(`${env.baseUrl}/api/kos/${kosId}`);
      assert.equal(kosDetailAfterBooking.data.data.jumlahKamarTersedia, 1);

      // 6. Pencari posts review and verifies aggregated rating
      const createReview = await jsonRequest(`${env.baseUrl}/api/kos/${kosId}/reviews`, {
        method: "POST",
        token: pencariToken,
        body: { rating: 5, komentar: "Dekat kampus dan bersih" },
      });
      assert.equal(createReview.status, 201);

      const reviewSummary = await jsonRequest(`${env.baseUrl}/api/kos/${kosId}/reviews`);
      assert.equal(reviewSummary.status, 200);
      assert.equal(reviewSummary.data.data.total, 1);
      assert.equal(reviewSummary.data.data.averageRating, 5);
    } finally {
      await env.close();
    }
  });
});
