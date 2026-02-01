import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env';
import { RazorpayOrderOptions, RazorpayVerifyPayload } from '../types';

let razorpayInstance: Razorpay | null = null;

export const getRazorpayInstance = (): Razorpay | null => {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    console.warn('Razorpay credentials not configured');
    return null;
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpayInstance;
};

export const createRazorpayOrder = async (
  options: RazorpayOrderOptions
): Promise<any> => {
  const instance = getRazorpayInstance();

  if (!instance) {
    throw new Error('Razorpay not configured');
  }

  try {
    const order = await instance.orders.create({
      amount: Math.round(options.amount * 100), // Convert to paise
      currency: options.currency,
      receipt: options.receipt,
    });

    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const verifyRazorpaySignature = (
  payload: RazorpayVerifyPayload
): boolean => {
  if (!env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay key secret not configured');
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;

  const text = `${razorpay_order_id}|${razorpay_payment_id}`;
  const generated_signature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');

  return generated_signature === razorpay_signature;
};

export const getPaymentDetails = async (paymentId: string): Promise<any> => {
  const instance = getRazorpayInstance();

  if (!instance) {
    throw new Error('Razorpay not configured');
  }

  try {
    const payment = await instance.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw error;
  }
};
