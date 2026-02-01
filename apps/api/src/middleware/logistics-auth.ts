import { Response, NextFunction } from 'express';
import { LogisticsAuthenticatedRequest } from '../types';
import { verifyToken } from '../services/jwt.service';
import { AppError } from './error-handler';

export const authenticateLogistics = async (
  req: LogisticsAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.logistics_auth_token;

    if (!token) {
      throw new AppError(401, 'Authentication required');
    }

    const decoded = verifyToken(token);

    // Verify this is a logistics token
    if (decoded.role !== 'logistics') {
      throw new AppError(401, 'Invalid authentication credentials');
    }

    req.personnel = {
      id: decoded.personnelId!,
      phone: decoded.phone,
    };

    next();
  } catch (error) {
    next(new AppError(401, 'Invalid or expired token'));
  }
};
