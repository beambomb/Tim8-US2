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
        fasilitas: {
            type: [String],
            default: []
        },
        jumlahKamar: {
            type: Number,
            required: true
        },
        jumlahKamarTersedia: {
            type: Number,
            required: true
        },
        fotoUrls: {
            type: [String],
            default: []
        },
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

const Kos = mongoose.model('Kos', kosSchema);
export default Kos;