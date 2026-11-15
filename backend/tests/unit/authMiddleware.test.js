import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { verifyToken, authorizeRoles } from "../../src/middleware/authMiddleware.js";
import { createMockRes, signTestToken } from "../helpers/httpHelper.js";

describe("authMiddleware unit tests", () => {
  it("verifyToken returns 401 when authorization header is missing", () => {
    const req = { headers: {} };
    const res = createMockRes();
    let nextCalled = false;

    verifyToken(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.match(res.body.message, /tidak ada token/i);
  });

  it("verifyToken returns 401 when authorization scheme is not Bearer", () => {
    const req = { headers: { authorization: "Basic abc123" } };
    const res = createMockRes();
    let nextCalled = false;

    verifyToken(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
  });

  it("verifyToken returns 401 when token signature is invalid", () => {
    const req = { headers: { authorization: "Bearer invalid.jwt.token" } };
    const res = createMockRes();
    let nextCalled = false;

    verifyToken(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.match(res.body.message, /gagal divalidasi/i);
  });

  it("verifyToken attaches decoded user and calls next for valid JWT", () => {
    const token = signTestToken({ id: "u-99", role: "PEMILIK_KOS" });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockRes();
    let nextCalled = false;

    verifyToken(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.user.id, "u-99");
    assert.equal(req.user.role, "PEMILIK_KOS");
  });

  it("authorizeRoles returns 403 for unauthenticated guest", () => {
    const middleware = authorizeRoles("ADMIN");
    const req = {};
    const res = createMockRes();
    let nextCalled = false;

    middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Guest/);
  });

  it("authorizeRoles returns 403 when user role is not in allowedRoles", () => {
    const middleware = authorizeRoles("PEMILIK_KOS", "ADMIN");
    const req = { user: { id: "u-1", role: "PENCARI_KOS" } };
    const res = createMockRes();
    let nextCalled = false;

    middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
    assert.match(res.body.message, /PENCARI_KOS/);
  });

  it("authorizeRoles calls next when user role matches allowedRoles", () => {
    const middleware = authorizeRoles("PEMILIK_KOS", "ADMIN");
    const req = { user: { id: "u-2", role: "ADMIN" } };
    const res = createMockRes();
    let nextCalled = false;

    middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(res.body, null);
  });
});
