// backend/auth.js
import jwt from 'jsonwebtoken';

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Auth Middleware: Token received:', token ? token.substring(0, 10) + '...' : 'None');

    if (token == null) {
        console.log('Auth Middleware: No token found.');
        return res.status(401).json({ message: 'Authentication token required (Bearer token missing).' });
    }


    if (!SUPABASE_JWT_SECRET) {
        console.error('--- Auth Middleware ERROR: SUPABASE_JWT_SECRET is undefined or null AT THE POINT OF VERIFICATION ---');
        console.error('--- Value of process.env.SUPABASE_JWT_SECRET when auth.js initialized: ', process.env.SUPABASE_JWT_SECRET);
        console.error('--- This means: It is NOT being loaded correctly into the constant within auth.js, despite process.env being populated. ---');
        console.error('-------------------------------------------------------------------------------------------------------');
        return res.status(500).json({ message: 'Server configuration error: JWT secret not set for verification.' });
    }


    jwt.verify(token, SUPABASE_JWT_SECRET, (err, user) => { 
        if (err) {
            console.error('Auth Middleware: JWT verification failed:', err.message);
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ message: 'Invalid or expired token. Please log in again.' });
            }
            return res.status(403).json({ message: 'Invalid authentication token.' });
        }
        req.userId = user.sub;
        console.log('Auth Middleware: Token verified. User ID:', req.userId);
        next();
    });
};

export default authMiddleware;