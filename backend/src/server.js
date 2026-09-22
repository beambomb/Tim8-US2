import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ownerRoutes from './routes/ownerRoutes.js';
import connectDB from '../config/db.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();
connectDB();


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/owner', ownerRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API CariKos berhasil berjalan!'
    });
});

app.listen(PORT, () => {
    console.log(`Server CariKos running di: http://localhost:${PORT}`);
});
