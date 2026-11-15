import { describe, it } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../../src/models/User.js";
import { createApp } from "../../src/app.js";
import { startTestServer, signTestToken } from "../helpers/httpHelper.js";

describe("authRoutes HTTP integration tests", () => {
  it("POST /api/auth/register prevents privilege escalation by sanitizing ADMIN role to PENCARI_KOS", async (t) => {
    t.mock.method(User, "findOne", async () => null);
    t.mock.method(User.prototype, "save", async function () {
      return this;
    });

    const server = await startTestServer(createApp());
    try {
      const response = await fetch(`${server.baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: "Budi Mahasiswa",
          email: "budi@mail.com",
          password: "Password123",
          role: "ADMIN",
        }),
      });
      const body = await response.json();

      assert.equal(response.status, 201);
      assert.equal(body.user.role, "PENCARI_KOS");
      assert.equal(body.user.email, "budi@mail.com");
    } finally {
      await server.close();
    }
  });

  it("POST /api/auth/register returns 400 when email is already registered", async (t) => {
    t.mock.method(User, "findOne", async () => ({ _id: "u-existing" }));

    const server = await startTestServer(createApp());
    try {
      const response = await fetch(`${server.baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: "Budi",
          email: "existing@mail.com",
          password: "Password123",
        }),
      });
      const body = await response.json();

      assert.equal(response.status, 400);
      assert.match(body.message, /sudah terdaftar/i);
    } finally {
      await server.close();
    }
  });

  it("POST /api/auth/login returns 404/400 on invalid credentials and returns JWT on valid login", async (t) => {
    const hashedPassword = await bcrypt.hash("SecretPass1!", 10);
    const fakeUserId = new mongoose.Types.ObjectId();

    t.mock.method(User, "findOne", async ({ email }) => {
      if (email !== "pemilik@mail.com") return null;
      return {
        _id: fakeUserId,
        nama: "Ibu Kos",
        email: "pemilik@mail.com",
        password: hashedPassword,
        noHp: "08123456789",
        role: "PEMILIK_KOS",
        savedCampuses: [],
      };
    });

    const server = await startTestServer(createApp());
    try {
      const unknownRes = await fetch(`${server.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "ghost@mail.com", password: "SecretPass1!" }),
      });
      assert.equal(unknownRes.status, 404);

      const badPassRes = await fetch(`${server.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "pemilik@mail.com", password: "WrongPassword" }),
      });
      assert.equal(badPassRes.status, 400);

      const okRes = await fetch(`${server.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "pemilik@mail.com", password: "SecretPass1!" }),
      });
      const okBody = await okRes.json();

      assert.equal(okRes.status, 200);
      assert.ok(okBody.token);
      assert.equal(okBody.user.role, "PEMILIK_KOS");
    } finally {
      await server.close();
    }
  });

  it("GET /api/auth/me requires valid JWT and returns user profile", async (t) => {
    const userId = new mongoose.Types.ObjectId().toString();
    t.mock.method(User, "findById", () => ({
      select: async () => ({
        _id: userId,
        nama: "Andi",
        email: "andi@mail.com",
        role: "PENCARI_KOS",
      }),
    }));

    const server = await startTestServer(createApp());
    try {
      const unauthRes = await fetch(`${server.baseUrl}/api/auth/me`);
      assert.equal(unauthRes.status, 401);

      const token = signTestToken({ id: userId, role: "PENCARI_KOS" });
      const authRes = await fetch(`${server.baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await authRes.json();

      assert.equal(authRes.status, 200);
      assert.equal(body.user.email, "andi@mail.com");
    } finally {
      await server.close();
    }
  });
});
