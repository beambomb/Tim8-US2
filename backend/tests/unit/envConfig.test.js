import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEV_JWT_FALLBACK,
  getJwtSecret,
  getAllowedOrigins,
  getCorsOptions,
  validateRuntimeEnv,
} from "../../src/config/env.js";

function withEnv(overrides, fn) {
  const previous = {};
  for (const key of Object.keys(overrides)) {
    previous[key] = process.env[key];
    if (overrides[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = overrides[key];
    }
  }
  try {
    return fn();
  } finally {
    for (const key of Object.keys(overrides)) {
      if (previous[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    }
  }
}

describe("runtime env configuration unit tests", () => {
  it("getJwtSecret throws in production when secret is missing or uses dev fallback", () => {
    withEnv({ NODE_ENV: "production", JWT_SECRET: undefined }, () => {
      assert.throws(() => getJwtSecret(), /JWT_SECRET wajib diset/i);
    });

    withEnv({ NODE_ENV: "production", JWT_SECRET: DEV_JWT_FALLBACK }, () => {
      assert.throws(() => getJwtSecret(), /JWT_SECRET wajib diset/i);
    });
  });

  it("getJwtSecret returns configured secret in production and fallback in test", () => {
    withEnv(
      { NODE_ENV: "production", JWT_SECRET: "super-strong-prod-secret-32chars" },
      () => {
        assert.equal(getJwtSecret(), "super-strong-prod-secret-32chars");
      }
    );

    withEnv({ NODE_ENV: "test", JWT_SECRET: undefined }, () => {
      assert.equal(getJwtSecret(), DEV_JWT_FALLBACK);
    });
  });

  it("getAllowedOrigins normalizes comma-separated URLs and getCorsOptions blocks unlisted origins", () => {
    withEnv(
      {
        CORS_ORIGIN: "https://carikos.vercel.app/, https://staging.carikos.vercel.app",
        CLIENT_URL: undefined,
      },
      () => {
        assert.deepEqual(getAllowedOrigins(), [
          "https://carikos.vercel.app",
          "https://staging.carikos.vercel.app",
        ]);

        const options = getCorsOptions();
        assert.equal(options.credentials, true);

        let allowedResult = null;
        options.origin("https://carikos.vercel.app", (err, ok) => {
          allowedResult = { err, ok };
        });
        assert.equal(allowedResult.err, null);
        assert.equal(allowedResult.ok, true);

        let rejectedResult = null;
        options.origin("https://evil.example.com", (err, ok) => {
          rejectedResult = { err, ok };
        });
        assert.equal(rejectedResult.ok, undefined);
        assert.equal(rejectedResult.err.status, 403);
      }
    );
  });

  it("validateRuntimeEnv fails fast in production when MONGO_URI is missing", () => {
    withEnv(
      {
        NODE_ENV: "production",
        JWT_SECRET: "super-strong-prod-secret-32chars",
        MONGO_URI: undefined,
      },
      () => {
        assert.throws(() => validateRuntimeEnv(), /MONGO_URI wajib diset/i);
      }
    );
  });
});
