import { z } from 'zod';

export const verifyFirebaseTokenSchema = z.object({
  idToken: z.string().min(1, 'Firebase ID token is required'),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

export type VerifyFirebaseTokenInput = z.infer<typeof verifyFirebaseTokenSchema>;
