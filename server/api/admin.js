import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const router = express.Router();

const corsOptions = {
  origin: [
    'https://plant-flow.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Terapkan CORS khusus untuk route admin
router.use(cors(corsOptions));

// Handle OPTIONS preflight untuk route admin
router.options('*', cors(corsOptions));

// Pastikan username dan password untuk admin ada di environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ;

// POST /login untuk autentikasi admin
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Verifikasi username
    if (username === ADMIN_USERNAME) {
        try {
            // Verifikasi password menggunakan bcrypt
            const isValid = await bcrypt.compare(password, ADMIN_PASSWORD);

            if (isValid) {
                // Generate JWT token jika valid
                const token = jwt.sign(
                    { username }, 
                    process.env.JWT_SECRET || 'secretkey',
                    { expiresIn: '1h' }
                );
                return res.json({ success: true, message: 'Login berhasil', token });
            } else {
                return res.status(401).json({ success: false, message: 'Login gagal: Password salah' });
            }
        } catch (error) {
            console.error('Error during authentication:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } else {
        return res.status(401).json({ success: false, message: 'Login gagal: Username salah' });
    }
});

export default router;
