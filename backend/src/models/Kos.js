import mongoose from 'mongoose';

const kosSchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        nama: {
            type: String,
            required: true
        },
        harga: {
            type: Number,
            required: true
        },
        lokasi: {
            type: String,
            required: true
        },
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        },
        tipe: {
            type: String,
            enum: ['Putra', 'Putri', 'Campur'],
            required: true
        },
        fasilitas: [String],
        jumlahKamar: {
            type: Number,
            required: true
        },
        jumlahKamarTersedia: {
            type: Number,
            required: true
        },
        fotoUrls: [String],
        statusVerifikasi: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        },
        alasanPenolakan: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

export default mongoose.model('Kos', kosSchema);