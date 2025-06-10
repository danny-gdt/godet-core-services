// src/api/auth/auth.controller.ts
import { Request, Response } from 'express';
import { hash, compare } from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../../server';
import { AuthRequest, JwtPayload } from './auth.types';
import crypto from 'crypto';

const generateTokens = (userId: string) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION || '15m',
    } as SignOptions);
    const refreshTokenPayload = {
        userId,
        jti: crypto.randomBytes(16).toString('hex'),
    };
    const refreshToken = jwt.sign(refreshTokenPayload, process.env.REFRESH_TOKEN_SECRET!, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
    } as SignOptions);
    return { accessToken, refreshToken };
};

const hashToken = (token: string) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

export const register = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password || password.length < 8) {
        return res.status(400).json({ message: 'Email and a password of at least 8 characters are required.' });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        const hashedPassword = await hash(password, 12);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        return res.status(201).json({ message: `User ${user.email} created successfully` });
    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isValidPassword = await compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const { accessToken, refreshToken } = generateTokens(user.id);
        const hashedRefreshToken = hashToken(refreshToken);

        await prisma.refreshToken.create({
            data: {
                hashedToken: hashedRefreshToken,
                userId: user.id,
            },
        });

        return res.json({ accessToken, refreshToken });
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required.' });
    }

    try {
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;
        const hashedToken = hashToken(refreshToken);

        const dbToken = await prisma.refreshToken.findUnique({
            where: { hashedToken },
        });

        console.log('dbToken', dbToken);
        console.log('payload', payload);

        if (!dbToken || dbToken.revoked || dbToken.userId !== payload.userId) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
        }
        
        // Revoke the old token
        await prisma.refreshToken.update({
            where: { id: dbToken.id },
            data: { revoked: true },
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(payload.userId);
        const newHashedRefreshToken = hashToken(newRefreshToken);

        await prisma.refreshToken.create({
            data: {
                hashedToken: newHashedRefreshToken,
                userId: payload.userId,
            },
        });

        return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });

    } catch (error) {
        console.error('RefreshToken Error:', error);
        return res.status(401).json({ message: 'Unauthorized: Token expired or malformed.' });
    }
};

export const me = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized.' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, createdAt: true, updatedAt: true },
        });

        if (!user) {
            // This case should be rare if token is valid and user exists
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.json(user);
    } catch (error) {
        console.error('Me Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}; 