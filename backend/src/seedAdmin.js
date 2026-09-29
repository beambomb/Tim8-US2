import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        nama: 'Administrator',
        email: 'admin@example.com',
        password: hashedPassword,
        noHp: '081111222333',
        role: 'ADMIN'
      });
      console.log('Admin account created: admin@example.com / password123');
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
