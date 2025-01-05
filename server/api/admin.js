import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import authenticate from '../middleware/authMiddleware.js';

dotenv.config();

const router = express.Router();

// Gunakan environment variables atau fallback ke nilai default
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME,
    passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
};

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_CREDENTIALS.username) {
        // Verifikasi password menggunakan bcrypt
        const isValid = await bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash);
        
        if (isValid) {
            const token = jwt.sign(
                { username }, 
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            res.json({ success: true, message: 'Login berhasil', token });
            return;
        }
    }
    
    res.status(401).json({ success: false, message: 'Login gagal' });
});

export default router;
