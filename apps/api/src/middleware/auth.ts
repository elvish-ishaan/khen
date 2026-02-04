import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { verifyToken } from '../services/jwt.service';
import { AppError } from './error-handler';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      throw new AppError(401, 'Authentication required');
    }

    const decoded = verifyToken(token);

    if (!decoded.userId) {
      throw new AppError(401, 'Invalid token payload');
    }

    req.user = {
      id: decoded.userId,
      phone: decoded.phone,
    };

    next();
  } catch (error) {
    next(new AppError(401, 'Invalid or expired token'));
  }
};
