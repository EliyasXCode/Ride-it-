import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportTicket extends Document {
  userId: mongoose.Types.ObjectId;
  rideId?: mongoose.Types.ObjectId;
  category: 'trip_issue' | 'billing' | 'driver_behavior' | 'lost_item' | 'safety' | 'other';
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages: Array<{
    senderId: mongoose.Types.ObjectId;
    senderRole: 'rider' | 'driver' | 'admin';
    senderName: string;
    message: string;
    createdAt: Date;
  }>;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rideId: { type: Schema.Types.ObjectId, ref: 'Ride', index: true },
    category: {
      type: String,
      enum: ['trip_issue', 'billing', 'driver_behavior', 'lost_item', 'safety', 'other'],
      required: true,
    },
    subject: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    messages: [
      {
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        senderRole: { type: String, enum: ['rider', 'driver', 'admin'], required: true },
        senderName: { type: String, required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const SupportTicket = mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
