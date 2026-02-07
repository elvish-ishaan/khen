import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error-handler';
import { env } from '../config/env';

/**
 * Test endpoint to verify cookie configuration
 * DELETE THIS FILE after debugging
 */
export const testCookieHandler = asyncHandler(
  async (req: Request, res: Response) => {
    // Set a test cookie with the same settings as auth
    const cookieOptions: any = {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'lax' : 'lax',
      maxAge: 60000, // 1 minute
      path: '/',
    };

    if (env.NODE_ENV === 'production' && env.COOKIE_DOMAIN) {
      cookieOptions.domain = env.COOKIE_DOMAIN;
    }

    res.cookie('test_cookie', 'test_value', cookieOptions);

    res.json({
      success: true,
      message: 'Test cookie set',
      debug: {
        nodeEnv: env.NODE_ENV,
        cookieDomain: env.COOKIE_DOMAIN || 'NOT SET',
        cookieOptions,
        corsOrigins: env.CORS_ORIGINS,
      },
    });
  }
);

export const checkCookieHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const testCookie = req.cookies.test_cookie;
    const authCookie = req.cookies.auth_token;

    res.json({
      success: true,
      data: {
        hasTestCookie: !!testCookie,
        hasAuthCookie: !!authCookie,
        allCookies: Object.keys(req.cookies),
      },
    });
  }
);
