import mongoose, { Schema, Document } from 'mongoose';

export interface ITripMessage extends Document {
  rideId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderRole: 'rider' | 'driver';
  text: string;
}

const TripMessageSchema = new Schema<ITripMessage>(
  {
    rideId: { type: Schema.Types.ObjectId, ref: 'Ride', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['rider', 'driver'], required: true },
    text: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

export const TripMessage = mongoose.model<ITripMessage>('TripMessage', TripMessageSchema);
