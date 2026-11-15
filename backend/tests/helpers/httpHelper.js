import http from "node:http";
import jwt from "jsonwebtoken";

/**
 * Menjalankan instance Express app di port ephemeral lokal untuk integration test.
 */
export async function startTestServer(app) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    server,
    baseUrl,
    async close() {
      await new Promise((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve()))
      );
    },
  };
}

/**
 * Membuat mock Express response object untuk unit testing middleware dan controller.
 */
export function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

/**
 * Men-generate JWT valid untuk keperluan testing autentikasi & RBAC.
 */
export function signTestToken(payload = { id: "user-1", role: "PENCARI_KOS" }) {
  const secret = process.env.JWT_SECRET || "rahasia_jwt_carikos_123";
  return jwt.sign(payload, secret, { expiresIn: "1h" });
}
