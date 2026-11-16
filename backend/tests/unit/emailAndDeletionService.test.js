import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import cloudinary from '../../config/cloudinary.js';
import Booking from '../../src/models/Booking.js';
import Favorite from '../../src/models/Favorite.js';
import Kos from '../../src/models/Kos.js';
import Message from '../../src/models/Message.js';
import Notification from '../../src/models/Notification.js';
import Review from '../../src/models/Review.js';
import User from '../../src/models/User.js';
import {
  getEmailConfig,
  isEmailConfigured,
  resetEmailTransporter,
  sendNotificationEmail,
} from '../../src/services/emailService.js';
import { createNotificationService } from '../../src/services/notificationService.js';
import {
  deleteCloudinaryImages,
  extractCloudinaryPublicId,
} from '../../src/services/uploadService.js';
import {
  cascadeDeleteKosRecords,
  cascadeDeleteUserById,
} from '../../src/services/deletionService.js';

const ENV_KEYS = [
  'BREVO_API_KEY',
  'BREVO_SENDER_EMAIL',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'GMAIL_USER',
  'GMAIL_APP_PASSWORD',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const originalEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalEnv[key];
    }
  }
  resetEmailTransporter();
});

describe('emailService, cloudinary cleanup, and cascade deletion unit tests', () => {
  it('detects SMTP/Gmail config, skips when unset, and sends escaped email via nodemailer', async (t) => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;

    assert.equal(isEmailConfigured(), false);
    const skipped = await sendNotificationEmail({
      to: 'user@mail.com',
      judul: 'Test',
      pesan: 'Halo',
    });
    assert.deepEqual(skipped, { sent: false, skipped: true });

    process.env.GMAIL_USER = 'sender@gmail.com';
    process.env.GMAIL_APP_PASSWORD = 'app-password-123';
    assert.equal(isEmailConfigured(), true);
    assert.equal(getEmailConfig().host, 'smtp.gmail.com');

    let capturedMail = null;
    t.mock.method(nodemailer, 'createTransport', () => ({
      sendMail: async (payload) => {
        capturedMail = payload;
        return { messageId: 'msg-123' };
      },
    }));

    const sent = await sendNotificationEmail({
      to: 'penerima@mail.com',
      recipientName: 'Siti <Admin>',
      judul: 'Booking Disetujui',
      pesan: 'Kamar <script>alert(1)</script> siap dihuni.',
      tipe: 'BOOKING_STATUS',
    });

    assert.deepEqual(sent, { sent: true, messageId: 'msg-123', provider: 'smtp' });
    assert.equal(capturedMail.to, 'penerima@mail.com');
    assert.match(capturedMail.subject, /^\[CariKos\] Booking Disetujui/);
    assert.equal(capturedMail.html.includes('<script>'), false);
    assert.equal(capturedMail.html.includes('&lt;script&gt;'), true);

    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;
    process.env.BREVO_API_KEY = 'xkeysib-test-123';
    process.env.BREVO_SENDER_EMAIL = 'CariKos <sender@carikos.id>';

    let brevoFetchCall = null;
    t.mock.method(globalThis, 'fetch', async (url, init) => {
      brevoFetchCall = { url, init: { ...init, body: JSON.parse(init.body) } };
      return new Response(JSON.stringify({ messageId: 'brevo-msg-1' }), { status: 201 });
    });

    const brevoSent = await sendNotificationEmail({
      to: 'pencari@mail.com',
      recipientName: 'Andi',
      judul: 'Kos Disetujui',
      pesan: 'Selamat bergabung.',
      tipe: 'KOS_VERIFIKASI',
    });

    assert.deepEqual(brevoSent, {
      sent: true,
      messageId: 'brevo-msg-1',
      provider: 'brevo-api',
    });
    assert.equal(brevoFetchCall.url, 'https://api.brevo.com/v3/smtp/email');
    assert.equal(brevoFetchCall.init.headers['api-key'], 'xkeysib-test-123');
    assert.deepEqual(brevoFetchCall.init.body.sender, {
      name: 'CariKos',
      email: 'sender@carikos.id',
    });
  });

  it('createNotificationService sends email best-effort without failing when email throws', async (t) => {
    process.env.SMTP_HOST = 'smtp.brevo.com';
    process.env.SMTP_USER = 'smtp-user';
    process.env.SMTP_PASS = 'smtp-pass';

    t.mock.method(Notification, 'create', async (payload) => ({
      _id: 'n-1',
      ...payload,
    }));
    t.mock.method(User, 'findById', () => ({
      select: async () => ({ nama: 'Budi', email: 'budi@mail.com' }),
    }));
    t.mock.method(nodemailer, 'createTransport', () => ({
      sendMail: async () => {
        throw new Error('SMTP timeout');
      },
    }));

    const emitted = [];
    const ioMock = {
      to: (room) => ({
        emit: (event, data) => emitted.push({ room, event, data }),
      }),
    };

    const notif = await createNotificationService(ioMock, {
      userId: 'user-1',
      judul: 'Tes Email',
      pesan: 'Notifikasi tetap tersimpan walau SMTP gagal.',
      tipe: 'SYSTEM',
    });

    assert.equal(notif._id, 'n-1');
    assert.equal(emitted.length, 1);
    assert.equal(emitted[0].room, 'user-1');
  });

  it('extractCloudinaryPublicId parses Cloudinary delivery URLs and deletes assets when configured', async (t) => {
    assert.equal(
      extractCloudinaryPublicId(
        'https://res.cloudinary.com/demo/image/upload/v1700000/carikos/kamar-1.jpg'
      ),
      'carikos/kamar-1'
    );
    assert.equal(
      extractCloudinaryPublicId('https://res.cloudinary.com/demo/image/upload/carikos/foto.png'),
      'carikos/foto'
    );
    assert.equal(extractCloudinaryPublicId('https://example.com/photo.jpg'), null);

    process.env.CLOUDINARY_CLOUD_NAME = 'demo';
    process.env.CLOUDINARY_API_KEY = 'key';
    process.env.CLOUDINARY_API_SECRET = 'secret';

    const destroyed = [];
    t.mock.method(cloudinary.uploader, 'destroy', async (publicId) => {
      destroyed.push(publicId);
      return { result: 'ok' };
    });

    await deleteCloudinaryImages([
      'https://res.cloudinary.com/demo/image/upload/v123/carikos/a.jpg',
      'https://example.com/ignored.jpg',
    ]);
    assert.deepEqual(destroyed, ['carikos/a']);
  });

  it('cascadeDeleteKosRecords and cascadeDeleteUserById clean kos dependents, cloudinary, and user chats', async (t) => {
    const ownerId = new mongoose.Types.ObjectId();
    const kosId = new mongoose.Types.ObjectId();

    process.env.CLOUDINARY_CLOUD_NAME = 'demo';
    process.env.CLOUDINARY_API_KEY = 'key';
    process.env.CLOUDINARY_API_SECRET = 'secret';

    const calls = {
      bookings: 0,
      reviews: 0,
      favorites: 0,
      notifications: 0,
      messagesUnlinked: 0,
      messagesDeleted: 0,
      kosDeleted: 0,
      userDeleted: 0,
      cloudinaryDestroyed: [],
    };

    t.mock.method(User, 'findById', () => ({
      select: async () => ({ _id: ownerId, nama: 'Pemilik', email: 'owner@mail.com' }),
    }));
    t.mock.method(Kos, 'find', async () => [
      {
        _id: kosId,
        ownerId,
        fotoUrls: ['https://res.cloudinary.com/demo/image/upload/v9/carikos/kamar.webp'],
      },
    ]);
    t.mock.method(Kos, 'deleteMany', async () => {
      calls.kosDeleted += 1;
      return { deletedCount: 1 };
    });
    t.mock.method(Booking, 'deleteMany', async () => {
      calls.bookings += 1;
      return { deletedCount: 2 };
    });
    t.mock.method(Review, 'deleteMany', async () => {
      calls.reviews += 1;
      return { deletedCount: 1 };
    });
    t.mock.method(Favorite, 'deleteMany', async () => {
      calls.favorites += 1;
      return { deletedCount: 1 };
    });
    t.mock.method(Notification, 'deleteMany', async () => {
      calls.notifications += 1;
      return { deletedCount: 2 };
    });
    t.mock.method(Message, 'updateMany', async () => {
      calls.messagesUnlinked += 1;
      return { modifiedCount: 1 };
    });
    t.mock.method(Message, 'deleteMany', async (filter) => {
      calls.messagesDeleted += 1;
      assert.equal(Array.isArray(filter.$or), true);
      return { deletedCount: 5 };
    });
    t.mock.method(User, 'findByIdAndDelete', async () => {
      calls.userDeleted += 1;
      return { _id: ownerId };
    });
    t.mock.method(cloudinary.uploader, 'destroy', async (publicId) => {
      calls.cloudinaryDestroyed.push(publicId);
      return { result: 'ok' };
    });

    await cascadeDeleteKosRecords({ _id: kosId, fotoUrls: [] });
    assert.equal(calls.bookings, 1);
    assert.equal(calls.messagesUnlinked, 1);

    const deletedUser = await cascadeDeleteUserById(ownerId.toString());
    assert.equal(deletedUser.nama, 'Pemilik');
    assert.equal(calls.kosDeleted, 1);
    assert.equal(calls.messagesDeleted, 1);
    assert.equal(calls.notifications, 3);
    assert.equal(calls.userDeleted, 1);
    assert.deepEqual(calls.cloudinaryDestroyed, ['carikos/kamar']);
  });
});
