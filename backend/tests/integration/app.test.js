import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../../src/app.js";
import { startTestServer } from "../helpers/httpHelper.js";

describe("backend app base HTTP integration tests", () => {
  it("GET / returns API health status with security and CORS headers", async () => {
    const server = await startTestServer(createApp());
    try {
      const response = await fetch(`${server.baseUrl}/`);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.success, true);
      assert.match(body.message, /API CariKos/i);
      assert.equal(response.headers.get("x-content-type-options"), "nosniff");
      assert.equal(response.headers.get("access-control-allow-origin"), "*");
    } finally {
      await server.close();
    }
  });

  it("GET /api/health returns structured server and database status", async () => {
    const server = await startTestServer(createApp());
    try {
      const response = await fetch(`${server.baseUrl}/api/health`);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.status, "ok");
      assert.match(body.database, /^(connected|disconnected)$/);
    } finally {
      await server.close();
    }
  });

  it("CORS_ORIGIN allowlist permits allowed origin and blocks disallowed origin with 403", async () => {
    const prevCors = process.env.CORS_ORIGIN;
    process.env.CORS_ORIGIN = "https://carikos.vercel.app";

    const server = await startTestServer(createApp());
    try {
      const allowedRes = await fetch(`${server.baseUrl}/api/health`, {
        headers: { Origin: "https://carikos.vercel.app" },
      });
      assert.equal(allowedRes.status, 200);
      assert.equal(
        allowedRes.headers.get("access-control-allow-origin"),
        "https://carikos.vercel.app"
      );

      const blockedRes = await fetch(`${server.baseUrl}/api/health`, {
        headers: { Origin: "https://untrusted.example.com" },
      });
      const blockedBody = await blockedRes.json();
      assert.equal(blockedRes.status, 403);
      assert.equal(blockedBody.success, false);
    } finally {
      await server.close();
      if (prevCors === undefined) delete process.env.CORS_ORIGIN;
      else process.env.CORS_ORIGIN = prevCors;
    }
  });

  it("GET unknown endpoint returns structured 404 JSON", async () => {
    const server = await startTestServer(createApp());
    try {
      const response = await fetch(`${server.baseUrl}/api/tidak-ada-endpoint`);
      const body = await response.json();

      assert.equal(response.status, 404);
      assert.equal(body.success, false);
      assert.match(body.message, /tidak ditemukan/i);
    } finally {
      await server.close();
    }
  });

  it("POST malformed JSON payload triggers global 400 error handler", async () => {
    const server = await startTestServer(createApp());
    try {
      const response = await fetch(`${server.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: '{"email": "broken',
      });
      const body = await response.json();

      assert.equal(response.status, 400);
      assert.equal(body.success, false);
      assert.match(body.message, /Format JSON/i);
    } finally {
      await server.close();
    }
  });
});
