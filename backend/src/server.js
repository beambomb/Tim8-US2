import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../config/db.js'

dotenv.config();
connectDB();


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API CariKos berhasil berjalan!'
    });
});

app.listen(PORT, () => {
    console.log(`Server CariKos running di: http://localhost:${PORT}`);
});
