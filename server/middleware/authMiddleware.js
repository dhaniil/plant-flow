import jwt from 'jsonwebtoken';

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        // Debug logs

        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(403).json({ 
                success: false, 
                message: 'Invalid authorization header format' 
            });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(403).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
            console.error('Token verification failed:', err);
            return res.status(403).json({ 
                success: false, 
                message: 'Invalid token',
                error: err.message 
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server authentication error' 
        });
    }
};

export default authenticate;