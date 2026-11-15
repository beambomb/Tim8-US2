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
