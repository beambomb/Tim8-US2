import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const seed = async () => {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const email = process.env.ADMIN_EMAIL?.trim() || (isProd ? '' : 'admin@example.com');
    const password = process.env.ADMIN_PASSWORD?.trim() || (isProd ? '' : 'password123');
    const nama = process.env.ADMIN_NAME?.trim() || 'Administrator';
    const noHp = process.env.ADMIN_PHONE?.trim() || '081111222333';

    if (!email || !password) {
      throw new Error('ADMIN_EMAIL dan ADMIN_PASSWORD wajib diset saat seed admin di production');
    }

    await mongoose.connect(process.env.MONGO_URI);
    const existingAdmin = await User.findOne({ email });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        nama,
        email,
        password: hashedPassword,
        noHp,
        role: 'ADMIN'
      });
      console.log(`Admin account created for ${email}`);
    } else {
      console.log('Admin account already exists.');
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
