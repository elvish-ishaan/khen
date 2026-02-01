import cors from 'cors';
import { env } from '../config/env';

// Allow multiple origins for user, restaurant, and logistics apps
const allowedOrigins = [
  env.CORS_ORIGIN, // User app (default: http://localhost:3000)
  'http://localhost:3001', // Restaurant app
  'http://localhost:3002', // Logistics app
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
