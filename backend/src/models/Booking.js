import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    kosId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Kos',
      required: true,
    },
    tanggalMulai: {
      type: Date,
      required: true,
    },
    durasiBulan: {
      type: Number,
      required: true,
      min: 1,
    },
    catatan: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'DISETUJUI', 'DITOLAK', 'DIBATALKAN'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
