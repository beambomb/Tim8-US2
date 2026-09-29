import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from './models/User.js';
import Kos from './models/Kos.js';
import Booking from './models/Booking.js';
import Review from './models/Review.js';
import Favorite from './models/Favorite.js';
import Notification from './models/Notification.js';
import Message from './models/Message.js';

dotenv.config();

const reset = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    await Promise.all([
      Booking.deleteMany({}),
      Favorite.deleteMany({}),
      Kos.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
      Review.deleteMany({}),
      User.deleteMany({})
    ]);

    const hashedPassword = await bcrypt.hash('password123', 10);
    await User.create({
      nama: 'Administrator',
      email: 'admin@example.com',
      password: hashedPassword,
      noHp: '081111222333',
      role: 'ADMIN'
    });

    console.log('DATABASE_RESET_SUCCESS: All collections cleared. Admin created: admin@example.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('DATABASE_RESET_ERROR:', error);
    process.exit(1);
  }
};

reset();
