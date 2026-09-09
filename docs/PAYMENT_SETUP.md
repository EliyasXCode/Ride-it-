# Payment Adapter & Fare Engine Setup Guide

RideFlow provides a modular payment architecture supporting **Cash on Delivery** and a **Stripe Sandbox Adapter** for card payments.

---

## 1. Fare Calculation Engine & Minor Currency Units

All monetary values in RideFlow are calculated and stored as **integers in minor currency units** (e.g. 1 USD = 100 cents) to eliminate floating-point rounding errors:

$$\text{Fare} = \max\left(\text{MinFare}, \left(\text{BaseFare} + (\text{DistanceKm} \times \text{PerKmRate}) + (\text{DurationMin} \times \text{PerMinRate})\right) \times \text{Multiplier}\right) + \text{BookingFee} + \text{Taxes} - \text{Discount}$$

### Base Demonstration Pricing Rules:
- **Economy**: Base \$2.50 (250¢), \$1.20/km (120¢), \$0.25/min (25¢), Multiplier 1.0x, Min \$5.00 (500¢)
- **Comfort**: Base \$3.50 (350¢), \$1.60/km (160¢), \$0.35/min (35¢), Multiplier 1.25x, Min \$8.00 (800¢)
- **XL**: Base \$5.00 (500¢), \$2.20/km (220¢), \$0.50/min (50¢), Multiplier 1.7x, Min \$12.00 (1200¢)
- **Booking Fee**: \$2.00 (200¢)
- **Tax**: 8.5%

---

## 2. Stripe Sandbox Configuration

1. Create a free Stripe account at [dashboard.stripe.com/register](https://dashboard.stripe.com/register).
2. Ensure you are in **Test Mode** (toggle in upper-right header).
3. Under **Developers** > **API keys**, copy:
   - Secret key (`sk_test_...`)
4. In `rideflow/apps/api/.env`:
   ```env
   PAYMENT_PROVIDER=stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
5. For local webhook forwarding, download the Stripe CLI and run:
   ```bash
   stripe listen --forward-to localhost:5000/api/v1/payments/webhook
   ```
   Paste the printed webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

---

## 3. Webhook Verification & Separation of Concerns

- **Separation of Concerns**: `Ride.status` is tracked independently from `Ride.paymentStatus`. A ride may be `completed` while its payment is `pending` or `successful`.
- **Authoritative Verification**: Payment completion is recorded **only** when verified through signed webhook events (`payment_intent.succeeded`) or direct server API confirmation. A client-side URL redirect is never treated as proof of payment.
- **Card Security**: Raw credit card details never enter the RideFlow backend.
- **Driver Earnings**: Stored as calculated ledger records within MongoDB. RideFlow clearly states that payout records are for tracking purposes and do not execute automated bank transfers without an authorized payout integration (e.g. Stripe Connect).
