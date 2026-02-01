import { Response } from 'express';
import { prisma, PaymentStatus, OrderStatus } from '@repo/db';
import { AuthenticatedRequest } from '../types';
import { createPaymentOrderSchema, verifyPaymentSchema } from '../validators/payment.validator';
import { AppError, asyncHandler } from '../middleware/error-handler';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpay.service';

export const createPaymentOrderHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const { orderId } = createPaymentOrderSchema.parse(req.body);

    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user.id,
      },
      include: {
        payment: true,
      },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    if (order.payment) {
      throw new AppError(400, 'Payment already initiated for this order');
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount: order.total,
      currency: 'INR',
      receipt: order.orderNumber,
    });

    // Save payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        amount: order.total,
        currency: 'INR',
        status: PaymentStatus.PENDING,
        method: order.paymentMethod,
      },
    });

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: order.total,
        currency: 'INR',
        paymentId: payment.id,
      },
    });
  }
);

export const verifyPaymentHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = verifyPaymentSchema.parse(req.body);

    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user.id,
      },
      include: {
        payment: true,
      },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    if (!order.payment) {
      throw new AppError(400, 'Payment not initiated for this order');
    }

    // Verify signature
    const isValid = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          status: PaymentStatus.FAILED,
        },
      });

      throw new AppError(400, 'Invalid payment signature');
    }

    // Update payment record
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: PaymentStatus.SUCCESS,
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.CONFIRMED,
      },
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });
  }
);

export const getPaymentStatusHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const { orderId } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user.id,
      },
      include: {
        payment: true,
      },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    res.json({
      success: true,
      data: {
        payment: order.payment,
      },
    });
  }
);
