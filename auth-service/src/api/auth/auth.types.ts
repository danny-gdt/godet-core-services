import { Request } from 'express';

export interface JwtPayload {
    userId: string;
}

export interface AuthRequest extends Request {
    user?: JwtPayload;
} 