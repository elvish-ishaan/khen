import { z } from 'zod';

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .refine((val) => val.startsWith('+91') || val.length === 10, {
      message: 'Phone must be Indian number (+91 or 10 digits)',
    }),
});

export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
