import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    kosId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Kos',
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;