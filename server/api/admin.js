const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123',
};

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const token = jwt.sign({ username }, 'secretkey', { expiresIn: '1h' });
        res.json({ success: true, message: 'Login berhasil', token });
    } else {
        res.status(401).json({ success: false, message: 'Login gagal' });
    }
});

module.exports = router;
