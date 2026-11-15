import { describe, it } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import api from "@/lib/api";
import { kosService } from "@/features/kos/services/kosService";
import { setupMockWindow } from "../helpers/mockWindow.mjs";

async function withStubApiServer(handler, fn) {
  const prevBaseURL = api.defaults.baseURL;
  const server = http.createServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  api.defaults.baseURL = `http://127.0.0.1:${port}`;
  try {
    await fn();
  } finally {
    api.defaults.baseURL = prevBaseURL;
    await new Promise((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
  }
}

describe("frontend api interceptor and kosService integration tests", () => {
  it("request interceptor attaches Bearer token and kosService converts radiusKm to meters", async () => {
    const env = setupMockWindow();
    env.localStorageMock.setItem("token", "jwt-demo-123");

    let capturedAuth = "";
    let capturedUrl = "";

    await withStubApiServer(
      (req, res) => {
        capturedAuth = req.headers.authorization || "";
        capturedUrl = req.url;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, total: 0, data: [] }));
      },
      async () => {
        const result = await kosService.getNearbyKos(-7.7713, 110.3775, 2.5);
        assert.equal(result.success, true);
        assert.equal(capturedAuth, "Bearer jwt-demo-123");
        assert.equal(capturedUrl, "/kos/nearby?lat=-7.7713&lng=110.3775&radius=2500");

        await kosService.searchCampuses("  UGM  ");
        assert.equal(capturedUrl, "/kos/campuses?q=UGM");
      }
    ).finally(() => env.restore());
  });

  it("response 401 interceptor clears token and redirects on protected endpoints, but spares /auth/login", async () => {
    const env = setupMockWindow({ pathname: "/bookings" });
    env.localStorageMock.setItem("token", "stale-jwt");

    await withStubApiServer(
      (req, res) => {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Unauthorized" }));
      },
      async () => {
        await assert.rejects(() => api.post("/auth/login", { email: "a@b.c", password: "x" }));
        assert.equal(env.localStorageMock.getItem("token"), "stale-jwt");
        assert.equal(env.getReplacedUrl(), null);

        await assert.rejects(() => api.get("/bookings/my"));
        assert.equal(env.localStorageMock.getItem("token"), null);
        assert.equal(env.dispatchedEvents.length, 1);
        assert.equal(env.dispatchedEvents[0].type, "carikos:unauthorized");
        assert.equal(env.getReplacedUrl(), "/auth/login");
      }
    ).finally(() => env.restore());
  });
});
