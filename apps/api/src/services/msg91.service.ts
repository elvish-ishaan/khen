import { env } from '../config/env';

export interface SendOtpResponse {
  type: string;
  message: string;
}

export const sendOtp = async (phone: string): Promise<boolean> => {
  // In development, skip actual MSG91 API call
  if (env.NODE_ENV === 'development' || !env.MSG91_AUTH_KEY) {
    console.log(`📱 [DEV] OTP for ${phone}: 123456`);
    return true;
  }

  try {
    const response = await fetch(
      `https://control.msg91.com/api/v5/otp?template_id=${env.MSG91_TEMPLATE_ID}&mobile=${phone}`,
      {
        method: 'POST',
        headers: {
          'authkey': env.MSG91_AUTH_KEY!,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('MSG91 OTP send failed:', await response.text());
      return false;
    }

    const data = await response.json();
    return data.type === 'success';
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
};

export const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
  // In development, accept 123456 as valid OTP
  if (env.NODE_ENV === 'development' || !env.MSG91_AUTH_KEY) {
    console.log(`✅ [DEV] OTP verified for ${phone}`);
    return otp === '123456';
  }

  try {
    const response = await fetch(
      `https://control.msg91.com/api/v5/otp/verify?mobile=${phone}&otp=${otp}`,
      {
        method: 'GET',
        headers: {
          'authkey': env.MSG91_AUTH_KEY!,
        },
      }
    );

    if (!response.ok) {
      console.error('MSG91 OTP verify failed:', await response.text());
      return false;
    }

    const data = await response.json();
    return data.type === 'success';
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
};
