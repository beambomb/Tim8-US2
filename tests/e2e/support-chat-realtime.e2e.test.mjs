import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { io as ioClient } from "../../frontend/node_modules/socket.io-client/build/esm/index.js";
import { startE2EServer } from "./helpers/e2eHarness.mjs";

describe("E2E real-time customer support chat flow", () => {
  it("resolves support admin contact and delivers Socket.IO messages end-to-end", async (t) => {
    const env = await startE2EServer(t);

    let pencariSocket;
    let adminSocket;

    try {
      await fetch(`${env.baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: "Mahasiswa Support",
          email: "mhs.chat@carikos.id",
          password: "Password123!",
          role: "PENCARI_KOS",
        }),
      });

      const loginRes = await fetch(`${env.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "mhs.chat@carikos.id",
          password: "Password123!",
        }),
      });
      const loginBody = await loginRes.json();
      const pencariToken = loginBody.token;
      const pencariId = loginBody.user.id;

      // 1. Pencari queries support endpoint to discover Admin receiver
      const supportRes = await fetch(`${env.baseUrl}/api/chat/support`, {
        headers: { Authorization: `Bearer ${pencariToken}` },
      });
      const supportBody = await supportRes.json();
      assert.equal(supportRes.status, 200);
      assert.equal(supportBody.data.role, "ADMIN");
      const targetAdminId = supportBody.data.id;

      // 2. Both Pencari and Admin join their personal Socket.IO rooms
      pencariSocket = ioClient(env.baseUrl, { transports: ["websocket"] });
      adminSocket = ioClient(env.baseUrl, { transports: ["websocket"] });

      await Promise.all([
        new Promise((resolve) => pencariSocket.on("connect", resolve)),
        new Promise((resolve) => adminSocket.on("connect", resolve)),
      ]);

      pencariSocket.emit("joinRoom", pencariId);
      adminSocket.emit("joinRoom", targetAdminId);

      // Allow room joins to register on server before sending
      await new Promise((resolve) => setTimeout(resolve, 40));

      const receivedPromise = new Promise((resolve) => {
        adminSocket.once("receiveMessage", (msg) => resolve(msg));
      });

      const ackPromise = new Promise((resolve) => {
        pencariSocket.emit(
          "sendMessage",
          {
            senderId: pencariId,
            receiverId: targetAdminId,
            pesan: "Halo Admin, bagaimana cara ubah jadwal survei kos?",
          },
          (ack) => resolve(ack)
        );
      });

      const [ack, delivered] = await Promise.all([ackPromise, receivedPromise]);
      assert.equal(ack.success, true);
      assert.equal(delivered.pesan, "Halo Admin, bagaimana cara ubah jadwal survei kos?");

      // 3. Verify persisted conversation via REST GET /api/chat/:userId
      const convRes = await fetch(`${env.baseUrl}/api/chat/${targetAdminId}`, {
        headers: { Authorization: `Bearer ${pencariToken}` },
      });
      const convBody = await convRes.json();
      assert.equal(convRes.status, 200);
      assert.equal(convBody.total, 1);
      assert.equal(convBody.data[0].pesan, "Halo Admin, bagaimana cara ubah jadwal survei kos?");
    } finally {
      if (pencariSocket) pencariSocket.disconnect();
      if (adminSocket) adminSocket.disconnect();
      await env.close();
    }
  });
});
