import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    komentar: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ userId: 1, kosId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
