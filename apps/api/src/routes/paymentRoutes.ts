import { Router } from 'express';
import { PaymentService } from '../services/paymentService';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const paymentRouter = Router();

// 1. Create PaymentIntent for card sandbox
paymentRouter.post('/create-intent', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { rideId, amountMinor, currency, idempotencyKey } = req.body;
    const userId = req.user!._id?.toString() || req.user!.id;

    if (!rideId || !amountMinor || !idempotencyKey) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'rideId, amountMinor, and idempotencyKey are required.' },
      });
    }

    const result = await PaymentService.createPaymentIntent(
      rideId,
      userId,
      amountMinor,
      currency || 'USD',
      idempotencyKey
    );

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// 2. Driver confirms cash collected
paymentRouter.post('/collect-cash', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { rideId, amountMinor } = req.body;
    const userId = req.user!._id?.toString() || req.user!.id;

    await PaymentService.recordCashCollection(rideId, userId, amountMinor);

    return res.json({
      success: true,
      data: { message: 'Cash collection recorded successfully.' },
    });
  } catch (err) {
    next(err);
  }
});

// 3. Webhook endpoint
paymentRouter.post('/webhook', (req, res) => {
  // Safe webhook acknowledgement
  return res.json({ received: true });
});
