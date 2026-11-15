import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import User from "../../src/models/User.js";
import { createApp } from "../../src/app.js";
import { startTestServer, signTestToken } from "../helpers/httpHelper.js";

describe("recently updated backend features HTTP integration tests", () => {
  it("POST and DELETE /api/auth/campuses validate coords, enforce 12-item cap, and persist changes", async (t) => {
    const userId = new mongoose.Types.ObjectId().toString();
    const fakeUser = {
      _id: userId,
      savedCampuses: [],
      async save() {
        return this;
      },
    };

    t.mock.method(User, "findById", () => ({
      select: async () => fakeUser,
    }));

    const server = await startTestServer(createApp());
    const token = signTestToken({ id: userId, role: "PENCARI_KOS" });

    try {
      const invalidRes = await fetch(`${server.baseUrl}/api/auth/campuses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nama: "Kampus Error", latitude: "nan", longitude: 110 }),
      });
      assert.equal(invalidRes.status, 400);

      const addRes = await fetch(`${server.baseUrl}/api/auth/campuses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nama: "Universitas Diponegoro",
          shortName: "UNDIP",
          kota: "Semarang",
          latitude: -7.0518,
          longitude: 110.4381,
        }),
      });
      const addBody = await addRes.json();
      assert.equal(addRes.status, 200);
      assert.equal(addBody.savedCampuses.length, 1);
      assert.equal(addBody.savedCampuses[0].id, "custom_universitas_diponegoro");

      fakeUser.savedCampuses = Array.from({ length: 12 }, (_, idx) => ({
        id: `c-${idx}`,
        nama: `Campus ${idx}`,
      }));
      const capRes = await fetch(`${server.baseUrl}/api/auth/campuses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: "c-13",
          nama: "Campus 13",
          latitude: -7.1,
          longitude: 110.4,
        }),
      });
      assert.equal(capRes.status, 400);

      const delRes = await fetch(`${server.baseUrl}/api/auth/campuses/c-0`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const delBody = await delRes.json();
      assert.equal(delRes.status, 200);
      assert.equal(delBody.savedCampuses.some((c) => c.id === "c-0"), false);
    } finally {
      await server.close();
    }
  });

  it("GET /api/chat/support resolves admin contact or returns 404, and GET /api/chat/:userId blocks self-chat", async (t) => {
    const userId = new mongoose.Types.ObjectId().toString();
    const token = signTestToken({ id: userId, role: "PENCARI_KOS" });

    let adminRecord = null;
    t.mock.method(User, "findOne", () => ({
      select: () => ({
        sort: async () => adminRecord,
      }),
    }));

    const server = await startTestServer(createApp());
    try {
      const missingAdminRes = await fetch(`${server.baseUrl}/api/chat/support`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.equal(missingAdminRes.status, 404);

      adminRecord = {
        _id: "admin-support-1",
        nama: "Admin Support",
        email: "support@carikos.id",
        role: "ADMIN",
      };

      const foundRes = await fetch(`${server.baseUrl}/api/chat/support`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const foundBody = await foundRes.json();
      assert.equal(foundRes.status, 200);
      assert.equal(foundBody.data.id, "admin-support-1");

      const selfChatRes = await fetch(`${server.baseUrl}/api/chat/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.equal(selfChatRes.status, 400);
    } finally {
      await server.close();
    }
  });
});
