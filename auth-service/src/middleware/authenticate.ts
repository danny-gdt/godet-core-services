import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JwtPayload } from '../api/auth/auth.types';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication invalid: No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication invalid: Token is malformed.' });
    }

    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
        req.user = payload;
        next();
    } catch (error) {
        // Handle expired token or other verification errors
        return res.status(401).json({ message: 'Authentication invalid: Token is expired or invalid.' });
    }
}; 