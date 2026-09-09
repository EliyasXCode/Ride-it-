import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  rideId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amountMinor: number;
  currency: string;
  provider: 'stripe' | 'cash';
  providerTransactionId?: string;
  idempotencyKey: string;
  status: 'pending' | 'successful' | 'failed' | 'cancelled' | 'refunded';
  receiptUrl?: string;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    rideId: { type: Schema.Types.ObjectId, ref: 'Ride', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amountMinor: { type: Number, required: true },
    currency: { type: String, default: 'USD', required: true },
    provider: { type: String, enum: ['stripe', 'cash'], required: true },
    providerTransactionId: { type: String, index: true },
    idempotencyKey: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'successful', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
      required: true,
      index: true,
    },
    receiptUrl: { type: String },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
