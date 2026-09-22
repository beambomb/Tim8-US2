import mongoose from 'mongoose';

const kosSchema = new mongoose.Schema(
    {
        nama: {
            type: String,
            required: true,
        },
        harga: {
            type: Number,
            required: true,
        },
        lokasi: {
            type: String,
            required: true,
        },
        tipe: {
            type: String,
            required: true,
        },
        fasilitas: {
            type: [String],
            default: [],
        },
        jumlahKamar: {
            type: Number,
            required: true,
        },
        jumlahKamarTersedia: {
            type: Number,
            required: true,
        },

        statusVerifikasi: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
        alasanPenolakan: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Kos = mongoose.model('Kos', kosSchema);
export default Kos;
