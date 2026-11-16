import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { createApp } from "../../src/app.js";
import Kos from "../../src/models/Kos.js";
import User from "../../src/models/User.js";
import Favorite from "../../src/models/Favorite.js";
import Notification from "../../src/models/Notification.js";
import { startTestServer, signTestToken } from "../helpers/httpHelper.js";

describe("adminRoutes, favoriteRoutes, and notificationRoutes integration tests", () => {
  it("adminRoutes enforces ADMIN role and covers stats, user role update, and kos verification", async (t) => {
    const nonAdminToken = signTestToken({ id: "u-1", role: "PENCARI_KOS" });
    const adminToken = signTestToken({ id: "admin-1", role: "ADMIN" });
    const kosId = new mongoose.Types.ObjectId().toString();
    const userId = new mongoose.Types.ObjectId().toString();

    t.mock.method(User, "countDocuments", async (query = {}) => {
      if (!query.role) return 10;
      if (query.role === "PENCARI_KOS") return 6;
      if (query.role === "PEMILIK_KOS") return 3;
      return 1;
    });
    t.mock.method(Kos, "countDocuments", async (query = {}) => {
      if (!query.statusVerifikasi) return 8;
      if (query.statusVerifikasi === "Pending") return 2;
      if (query.statusVerifikasi === "Approved") return 5;
      return 1;
    });
    t.mock.method(Kos, "findByIdAndUpdate", async (id, update) => ({
      _id: id,
      nama: "Kos Verifikasi",
      ownerId: "owner-1",
      ...update,
    }));
    t.mock.method(Notification, "create", async (payload) => ({
      _id: "notif-1",
      ...payload,
    }));
    t.mock.method(User, "findByIdAndUpdate", (id, update) => ({
      select: async () => ({ _id: id, nama: "Budi", role: update.role }),
    }));

    const server = await startTestServer(createApp());
    try {
      const forbiddenRes = await fetch(`${server.baseUrl}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${nonAdminToken}` },
      });
      assert.equal(forbiddenRes.status, 403);

      const statsRes = await fetch(`${server.baseUrl}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const statsBody = await statsRes.json();
      assert.equal(statsRes.status, 200);
      assert.equal(statsBody.data.users.total, 10);
      assert.equal(statsBody.data.kos.approved, 5);

      const invalidRejectRes = await fetch(
        `${server.baseUrl}/api/admin/submissions/${kosId}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({}),
        }
      );
      assert.equal(invalidRejectRes.status, 400);

      const approveRes = await fetch(
        `${server.baseUrl}/api/admin/submissions/${kosId}/approve`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      const approveBody = await approveRes.json();
      assert.equal(approveRes.status, 200);
      assert.equal(approveBody.data.statusVerifikasi, "Approved");

      const invalidRoleRes = await fetch(
        `${server.baseUrl}/api/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ role: "SUPERADMIN" }),
        }
      );
      assert.equal(invalidRoleRes.status, 400);

      const validRoleRes = await fetch(
        `${server.baseUrl}/api/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ role: "PEMILIK_KOS" }),
        }
      );
      const validRoleBody = await validRoleRes.json();
      assert.equal(validRoleRes.status, 200);
      assert.equal(validRoleBody.data.role, "PEMILIK_KOS");

      let capturedKosQuery = null;
      t.mock.method(Kos, "find", (query = {}) => {
        capturedKosQuery = query;
        return {
          populate: () => ({
            sort: async () => [
              {
                _id: kosId,
                nama: "Kos Melati",
                lokasi: "Sleman",
                tipe: "Putri",
                harga: 1200000,
                statusVerifikasi: "Approved",
                ownerId: { _id: userId, nama: "Pemilik Melati", email: "pemilik@mail.com" },
              },
            ],
          }),
        };
      });

      const forbiddenKosRes = await fetch(`${server.baseUrl}/api/admin/kos`, {
        headers: { Authorization: `Bearer ${nonAdminToken}` },
      });
      assert.equal(forbiddenKosRes.status, 403);

      const allKosRes = await fetch(
        `${server.baseUrl}/api/admin/kos?status=Approved&tipe=Putri&search=Melati`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      const allKosBody = await allKosRes.json();
      assert.equal(allKosRes.status, 200);
      assert.equal(allKosBody.total, 1);
      assert.equal(allKosBody.data[0].nama, "Kos Melati");
      assert.equal(capturedKosQuery.statusVerifikasi, "Approved");
      assert.equal(capturedKosQuery.tipe, "Putri");
      assert.equal(Array.isArray(capturedKosQuery.$or), true);
    } finally {
      await server.close();
    }
  });

  it("favoriteRoutes restricts access to PENCARI_KOS and handles list, add, and delete", async (t) => {
    const pencariToken = signTestToken({ id: "pencari-1", role: "PENCARI_KOS" });
    const ownerToken = signTestToken({ id: "owner-1", role: "PEMILIK_KOS" });
    const kosId = new mongoose.Types.ObjectId().toString();
    const favId = new mongoose.Types.ObjectId().toString();

    t.mock.method(Favorite, "find", () => ({
      populate: async () => [{ _id: favId, userId: "pencari-1", kosId: { _id: kosId, nama: "Kos A" } }],
    }));
    t.mock.method(Kos, "findById", async () => ({
      _id: kosId,
      statusVerifikasi: "Approved",
    }));
    t.mock.method(Favorite, "findOne", async () => null);
    t.mock.method(Favorite, "create", async (payload) => ({
      _id: favId,
      ...payload,
    }));
    t.mock.method(Favorite, "findOneAndDelete", async () => ({ _id: favId }));

    const server = await startTestServer(createApp());
    try {
      const blockedRes = await fetch(`${server.baseUrl}/api/favorites`, {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });
      assert.equal(blockedRes.status, 403);

      const listRes = await fetch(`${server.baseUrl}/api/favorites`, {
        headers: { Authorization: `Bearer ${pencariToken}` },
      });
      const listBody = await listRes.json();
      assert.equal(listRes.status, 200);
      assert.equal(listBody.data.length, 1);

      const addRes = await fetch(`${server.baseUrl}/api/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pencariToken}`,
        },
        body: JSON.stringify({ kosId }),
      });
      assert.equal(addRes.status, 201);

      const delRes = await fetch(`${server.baseUrl}/api/favorites/${favId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${pencariToken}` },
      });
      assert.equal(delRes.status, 200);
    } finally {
      await server.close();
    }
  });

  it("notificationRoutes lists notifications and marks single or all notifications as read", async (t) => {
    const token = signTestToken({ id: "user-9", role: "PENCARI_KOS" });
    const notifId = new mongoose.Types.ObjectId().toString();

    t.mock.method(Notification, "find", () => ({
      sort: async () => [{ _id: notifId, judul: "Info", isRead: false }],
    }));
    t.mock.method(Notification, "findOneAndUpdate", async () => ({
      _id: notifId,
      isRead: true,
    }));
    t.mock.method(Notification, "updateMany", async () => ({ modifiedCount: 1 }));

    const server = await startTestServer(createApp());
    try {
      const unauthRes = await fetch(`${server.baseUrl}/api/notifications`);
      assert.equal(unauthRes.status, 401);

      const getRes = await fetch(`${server.baseUrl}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const getBody = await getRes.json();
      assert.equal(getRes.status, 200);
      assert.equal(getBody.total, 1);

      const readOneRes = await fetch(
        `${server.baseUrl}/api/notifications/${notifId}/read`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const readOneBody = await readOneRes.json();
      assert.equal(readOneRes.status, 200);
      assert.equal(readOneBody.data.isRead, true);

      const readAllRes = await fetch(`${server.baseUrl}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.equal(readAllRes.status, 200);
    } finally {
      await server.close();
    }
  });
});
