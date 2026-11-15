import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        nama: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        noHp: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: ['PENCARI_KOS', 'PEMILIK_KOS', 'ADMIN'],
            default: 'PENCARI_KOS',
        },
        savedCampuses: [
            {
                id: { type: String, required: true },
                shortName: { type: String, required: true },
                nama: { type: String, required: true },
                kota: { type: String, default: '' },
                latitude: { type: Number, required: true },
                longitude: { type: Number, required: true },
                source: { type: String, default: 'custom' },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);
export default User;
