import http from "node:http";
import bcrypt from "../../../backend/node_modules/bcrypt/bcrypt.js";
import mongoose from "../../../backend/node_modules/mongoose/index.js";
import { Server } from "../../../backend/node_modules/socket.io/dist/index.js";
import { createApp } from "../../../backend/src/app.js";
import { saveMessageService } from "../../../backend/src/services/chatService.js";
import User from "../../../backend/src/models/User.js";
import Kos from "../../../backend/src/models/Kos.js";
import Booking from "../../../backend/src/models/Booking.js";
import Review from "../../../backend/src/models/Review.js";
import Message from "../../../backend/src/models/Message.js";
import Notification from "../../../backend/src/models/Notification.js";

function makeQuery(resolver) {
  let sortSpec = null;
  const query = {
    populate() {
      return query;
    },
    select() {
      return query;
    },
    sort(spec) {
      sortSpec = spec;
      return query;
    },
    then(onFulfilled, onRejected) {
      return Promise.resolve()
        .then(() => resolver(sortSpec))
        .then(onFulfilled, onRejected);
    },
    catch(onRejected) {
      return query.then(undefined, onRejected);
    },
  };
  return query;
}

function attachToObject(doc) {
  if (!doc || typeof doc !== "object") return doc;
  if (typeof doc.toObject !== "function") {
    doc.toObject = function () {
      const plain = { ...this };
      delete plain.toObject;
      delete plain.populate;
      return plain;
    };
  }
  return doc;
}

/**
 * Menjalankan backend Express + Socket.IO E2E server terisolasi dengan in-memory state store.
 */
export async function startE2EServer(t) {
  const adminId = new mongoose.Types.ObjectId().toString();
  const adminPassword = await bcrypt.hash("AdminPass123!", 10);

  const store = {
    users: [
      {
        _id: adminId,
        nama: "Admin CariKos",
        email: "admin@carikos.id",
        password: adminPassword,
        role: "ADMIN",
        savedCampuses: [],
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ],
    kos: [],
    bookings: [],
    reviews: [],
    messages: [],
    notifications: [],
  };

  const findUserById = (id) =>
    store.users.find((u) => u._id.toString() === id?.toString()) || null;
  const findKosById = (id) =>
    store.kos.find((k) => k._id.toString() === id?.toString()) || null;

  t.mock.method(User, "findOne", (filter = {}) =>
    makeQuery(() => {
      if (filter.email) {
        return store.users.find((u) => u.email === filter.email) || null;
      }
      if (filter.role) {
        return store.users.find((u) => u.role === filter.role) || null;
      }
      return null;
    })
  );
  t.mock.method(User, "findById", (id) => makeQuery(() => findUserById(id)));
  t.mock.method(User.prototype, "save", async function () {
    const id = (this._id || new mongoose.Types.ObjectId()).toString();
    const record = {
      _id: id,
      nama: this.nama,
      email: this.email,
      password: this.password,
      noHp: this.noHp || null,
      role: this.role,
      savedCampuses: this.savedCampuses || [],
      createdAt: new Date(),
    };
    this._id = id;
    store.users.push(record);
    return this;
  });

  t.mock.method(Kos, "find", (filter = {}) =>
    makeQuery(() =>
      store.kos
        .filter((k) => {
          if (filter.statusVerifikasi && k.statusVerifikasi !== filter.statusVerifikasi) {
            return false;
          }
          if (filter.ownerId && k.ownerId.toString() !== filter.ownerId.toString()) {
            return false;
          }
          if (filter.tipe && !new RegExp(filter.tipe.$regex || filter.tipe, "i").test(k.tipe)) {
            return false;
          }
          if (
            filter.jumlahKamarTersedia?.$gt !== undefined &&
            !(k.jumlahKamarTersedia > filter.jumlahKamarTersedia.$gt)
          ) {
            return false;
          }
          return true;
        })
        .map((k) => attachToObject({ ...k }))
    )
  );
  t.mock.method(Kos, "findById", (id) =>
    makeQuery(() => {
      const k = findKosById(id);
      if (!k) return null;
      return attachToObject({ ...k, ownerId: findUserById(k.ownerId) || k.ownerId });
    })
  );
  t.mock.method(Kos.prototype, "save", async function () {
    const id = (this._id || new mongoose.Types.ObjectId()).toString();
    const record = {
      _id: id,
      ownerId: this.ownerId?.toString(),
      nama: this.nama,
      harga: Number(this.harga),
      lokasi: this.lokasi,
      latitude: Number(this.latitude),
      longitude: Number(this.longitude),
      tipe: this.tipe,
      fasilitas: this.fasilitas || [],
      jumlahKamar: Number(this.jumlahKamar),
      jumlahKamarTersedia: Number(this.jumlahKamarTersedia),
      fotoUrls: this.fotoUrls || [],
      statusVerifikasi: this.statusVerifikasi || "Pending",
      createdAt: new Date(),
    };
    this._id = id;
    store.kos.push(record);
    return attachToObject(record);
  });
  t.mock.method(Kos, "findByIdAndUpdate", async (id, update) => {
    const kos = findKosById(id);
    if (!kos) return null;
    Object.assign(kos, update);
    return attachToObject({ ...kos });
  });
  t.mock.method(Kos, "findOneAndUpdate", async (query, update) => {
    const kos = store.kos.find((k) => {
      if (query._id && k._id.toString() !== query._id.toString()) return false;
      if (query.jumlahKamarTersedia?.$gt !== undefined) {
        if (!(k.jumlahKamarTersedia > query.jumlahKamarTersedia.$gt)) return false;
      }
      return true;
    });
    if (!kos) return null;
    if (update.$inc?.jumlahKamarTersedia) {
      kos.jumlahKamarTersedia += update.$inc.jumlahKamarTersedia;
    }
    if (update.$set) Object.assign(kos, update.$set);
    return attachToObject({ ...kos });
  });

  t.mock.method(Booking, "findOne", async (filter = {}) =>
    store.bookings.find(
      (b) =>
        (!filter.userId || b.userId === filter.userId.toString()) &&
        (!filter.kosId || b.kosId === filter.kosId.toString()) &&
        (!filter.status || b.status === filter.status)
    ) || null
  );
  t.mock.method(Booking, "find", (filter = {}) =>
    makeQuery(() =>
      store.bookings
        .filter((b) => !filter.userId || b.userId === filter.userId.toString())
        .map((b) => ({
          ...b,
          kosId: findKosById(b.kosId),
          userId: findUserById(b.userId),
        }))
    )
  );
  t.mock.method(Booking, "findById", (id) =>
    makeQuery(() => {
      const b = store.bookings.find((item) => item._id === id.toString());
      if (!b) return null;
      return { ...b, kosId: findKosById(b.kosId) };
    })
  );
  t.mock.method(Booking, "create", async (doc) => {
    const id = new mongoose.Types.ObjectId().toString();
    const record = {
      _id: id,
      userId: doc.userId.toString(),
      kosId: doc.kosId.toString(),
      tanggalMulai: doc.tanggalMulai,
      durasiBulan: doc.durasiBulan,
      catatan: doc.catatan || "",
      status: doc.status || "PENDING",
      createdAt: new Date(),
    };
    store.bookings.push(record);
    return {
      ...record,
      async populate() {
        return {
          ...record,
          kosId: findKosById(record.kosId),
          userId: findUserById(record.userId),
        };
      },
    };
  });
  t.mock.method(Booking, "findOneAndUpdate", (query, update) =>
    makeQuery(() => {
      const booking = store.bookings.find(
        (b) =>
          b._id === query._id?.toString() &&
          (!query.status || b.status === query.status)
      );
      if (!booking) return null;
      if (update.$set) Object.assign(booking, update.$set);
      return { ...booking, kosId: findKosById(booking.kosId) };
    })
  );

  t.mock.method(Review, "findOne", async ({ userId, kosId }) =>
    store.reviews.find((r) => r.userId === userId.toString() && r.kosId === kosId.toString()) || null
  );
  t.mock.method(Review, "find", ({ kosId }) =>
    makeQuery(() =>
      store.reviews
        .filter((r) => r.kosId === kosId.toString())
        .map((r) => ({ ...r, userId: findUserById(r.userId) }))
    )
  );
  t.mock.method(Review, "create", async (doc) => {
    const record = {
      _id: new mongoose.Types.ObjectId().toString(),
      userId: doc.userId.toString(),
      kosId: doc.kosId.toString(),
      rating: doc.rating,
      komentar: doc.komentar,
      createdAt: new Date(),
    };
    store.reviews.push(record);
    return {
      ...record,
      async populate() {
        return { ...record, userId: findUserById(record.userId) };
      },
    };
  });

  t.mock.method(Message.prototype, "save", async function () {
    const id = new mongoose.Types.ObjectId().toString();
    const record = {
      _id: id,
      senderId: this.senderId.toString(),
      receiverId: this.receiverId.toString(),
      kosId: this.kosId ? this.kosId.toString() : null,
      pesan: this.pesan,
      dibaca: false,
      createdAt: new Date(),
    };
    this._id = id;
    store.messages.push(record);
    return this;
  });
  t.mock.method(Message, "findById", (id) =>
    makeQuery(() => {
      const msg = store.messages.find((m) => m._id === id.toString());
      if (!msg) return null;
      return {
        ...msg,
        senderId: findUserById(msg.senderId),
        receiverId: findUserById(msg.receiverId),
        kosId: msg.kosId ? findKosById(msg.kosId) : null,
      };
    })
  );
  t.mock.method(Message, "updateMany", async () => ({ modifiedCount: 0 }));
  t.mock.method(Message, "find", (filter = {}) =>
    makeQuery(() =>
      store.messages
        .filter((m) => {
          if (!filter.$or) return true;
          return filter.$or.some(
            (clause) =>
              (!clause.senderId || m.senderId === clause.senderId.toString()) &&
              (!clause.receiverId || m.receiverId === clause.receiverId.toString())
          );
        })
        .map((m) => ({
          ...m,
          senderId: findUserById(m.senderId),
          receiverId: findUserById(m.receiverId),
          kosId: m.kosId ? findKosById(m.kosId) : null,
        }))
    )
  );

  t.mock.method(Notification, "create", async (doc) => {
    const record = { ...doc, _id: new mongoose.Types.ObjectId().toString() };
    store.notifications.push(record);
    return record;
  });

  const app = createApp();
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });
  app.set("io", io);

  io.on("connection", (socket) => {
    socket.on("joinRoom", (userId) => {
      if (userId) socket.join(userId.toString());
    });
    socket.on("sendMessage", async (payload, callback) => {
      try {
        const { senderId, receiverId, kosId, pesan } = payload;
        const saved = await saveMessageService(senderId, receiverId, kosId, pesan);
        io.to(receiverId.toString()).emit("receiveMessage", saved);
        socket.emit("messageSent", saved);
        if (callback) callback({ success: true, data: saved });
      } catch (err) {
        if (callback) callback({ success: false, message: err.message });
      }
    });
  });

  await new Promise((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
  const { port } = httpServer.address();

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    store,
    adminId,
    async close() {
      io.close();
      await new Promise((resolve, reject) =>
        httpServer.close((err) => (err ? reject(err) : resolve()))
      );
    },
  };
}
