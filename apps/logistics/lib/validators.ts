/**
 * Form validation utilities for logistics app
 * Provides centralized validation logic and error messages
 */

export const validators = {
  /**
   * Validates Indian Aadhar number (exactly 12 digits)
   */
  aadhar: (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 12;
  },

  /**
   * Validates Indian IFSC code format
   * Format: 4 letters + 0 + 6 alphanumeric characters
   * Example: SBIN0001234
   */
  ifsc: (value: string): boolean => {
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value);
  },

  /**
   * Validates Indian vehicle registration number
   * Format: 2 letters (state) + 2 digits (RTO) + 1-2 letters + 1-4 digits
   * Examples: MH01AB1234, DL12C5678, KA03AA1234
   */
  vehicleNumber: (value: string): boolean => {
    const cleaned = value.replace(/\s/g, '');
    return /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{1,4}$/.test(cleaned);
  },

  /**
   * Validates Indian driving license number
   * Format: 2 letters (state) + 2 digits (RTO) + 11 digits
   * Example: DL0120190012345
   */
  dlNumber: (value: string): boolean => {
    const cleaned = value.replace(/\s/g, '');
    return /^[A-Z]{2}[0-9]{2}[0-9]{11}$/.test(cleaned);
  },

  /**
   * Validates Indian bank account number
   * Length: 9-18 digits (varies by bank)
   */
  accountNumber: (value: string): boolean => {
    const length = value.length;
    return length >= 9 && length <= 18;
  },

  /**
   * Validates account holder name
   * Only letters, spaces, and dots allowed
   * Minimum 3 characters
   */
  accountHolderName: (value: string): boolean => {
    return /^[a-zA-Z\s.]+$/.test(value) && value.trim().length >= 3;
  },
};

/**
 * Error messages corresponding to validators
 */
export const errorMessages = {
  aadhar: 'Aadhar number must be exactly 12 digits',
  ifsc: 'Invalid IFSC code format (e.g., SBIN0001234)',
  vehicleNumber: 'Invalid vehicle number format (e.g., MH01AB1234)',
  dlNumber: 'Invalid driving license format (e.g., DL0120190012345)',
  accountNumber: 'Account number must be between 9-18 digits',
  accountHolderName: 'Name should only contain letters and be at least 3 characters',
  accountMismatch: 'Account numbers do not match',
};
