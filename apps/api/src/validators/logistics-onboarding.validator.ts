import { z } from 'zod';

export const submitDocumentsSchema = z.object({
  aadharNumber: z.string().regex(/^\d{12}$/, 'Aadhar must be 12 digits'),
  aadharFileUrl: z.string().url('Invalid Aadhar file URL'),
  dlNumber: z.string().min(8, 'Invalid driving license number'),
  dlFileUrl: z.string().url('Invalid DL file URL'),
  vehicleType: z.string().min(2, 'Vehicle type is required'),
  vehicleNumber: z.string().min(3, 'Vehicle number is required'),
});

export const submitBankDetailsSchema = z.object({
  accountTitle: z.string().min(2, 'Account title is required'),
  accountNumber: z.string().min(8, 'Invalid account number'),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
  branchName: z.string().min(2, 'Branch name is required'),
});

export type SubmitDocumentsInput = z.infer<typeof submitDocumentsSchema>;
export type SubmitBankDetailsInput = z.infer<typeof submitBankDetailsSchema>;
