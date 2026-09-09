import Stripe from 'stripe';
import { config } from '../config/env';
import { Payment } from '../models/Payment';
import { Ride } from '../models/Ride';
import { isConnectedToMongo } from '../config/db';

export class PaymentService {
  private static stripeClient: Stripe | null = null;

  private static getStripe(): Stripe | null {
    if (!this.stripeClient && config.stripeSecretKey && config.stripeSecretKey !== 'sk_test_placeholder_key') {
      try {
        this.stripeClient = new Stripe(config.stripeSecretKey, {
          apiVersion: '2024-06-20' as any,
        });
      } catch (err: any) {
        console.warn(`[Stripe Warning] Failed to initialize Stripe: ${err.message}`);
      }
    }
    return this.stripeClient;
  }

  /**
   * Creates a card payment intent with Stripe sandbox or simulation
   */
  public static async createPaymentIntent(
    rideId: string,
    userId: string,
    amountMinor: number,
    currency: string = 'INR',
    idempotencyKey: string
  ): Promise<{ clientSecret?: string; paymentId: string; status: string; isSimulated: boolean }> {
    // Check if payment already exists with this idempotency key
    if (isConnectedToMongo) {
      const existing = await Payment.findOne({ idempotencyKey });
      if (existing) {
        return {
          paymentId: existing.id,
          status: existing.status,
          isSimulated: existing.provider === 'cash',
        };
      }
    }

    const stripe = this.getStripe();

    if (stripe) {
      try {
        const intent = await stripe.paymentIntents.create(
          {
            amount: amountMinor,
            currency: currency.toLowerCase(),
            metadata: { rideId, userId },
          },
          { idempotencyKey }
        );

        let paymentRecord = null;
        if (isConnectedToMongo) {
          paymentRecord = await Payment.create({
            rideId,
            userId,
            amountMinor,
            currency,
            provider: 'stripe',
            providerTransactionId: intent.id,
            idempotencyKey,
            status: 'pending',
          });
        }

        return {
          clientSecret: intent.client_secret || undefined,
          paymentId: paymentRecord?.id || intent.id,
          status: 'pending',
          isSimulated: false,
        };
      } catch (err: any) {
        console.warn(`[Stripe Error] ${err.message}. Using simulated card sandbox.`);
      }
    }

    // Fallback sandbox simulation record
    let simulatedRecord = null;
    if (isConnectedToMongo) {
      simulatedRecord = await Payment.create({
        rideId,
        userId,
        amountMinor,
        currency,
        provider: 'stripe',
        providerTransactionId: `sim_pi_${Date.now()}`,
        idempotencyKey,
        status: 'successful',
      });
    }

    return {
      paymentId: simulatedRecord?.id || `sim_${Date.now()}`,
      status: 'successful',
      isSimulated: true,
    };
  }

  /**
   * Driver marks cash payment collected
   */
  public static async recordCashCollection(rideId: string, userId: string, amountMinor: number): Promise<boolean> {
    if (!isConnectedToMongo) return true;

    await Payment.create({
      rideId,
      userId,
      amountMinor,
      currency: 'INR',
      provider: 'cash',
      idempotencyKey: `cash_${rideId}_${Date.now()}`,
      status: 'successful',
    });

    await Ride.findByIdAndUpdate(rideId, { paymentStatus: 'successful' });
    return true;
  }
}
