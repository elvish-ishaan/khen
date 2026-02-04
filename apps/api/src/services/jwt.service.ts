import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId?: string;
  ownerId?: string;
  personnelId?: string;
  phone: string;
  role?: 'user' | 'restaurant' | 'logistics';
  restaurantId?: string;
  iat?: number;
  exp?: number;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as string | number,
  } as SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

export const getTokenExpiry = (): number => {
  // Convert JWT_EXPIRES_IN (e.g., "30d") to milliseconds
  const expiresIn = env.JWT_EXPIRES_IN;
  const match = expiresIn.match(/^(\d+)([dhms])$/);

  if (!match) {
    return 30 * 24 * 60 * 60 * 1000; // Default 30 days
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'm':
      return value * 60 * 1000;
    case 's':
      return value * 1000;
    default:
      return 30 * 24 * 60 * 60 * 1000;
  }
};
