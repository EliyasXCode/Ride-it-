import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedPlace extends Document {
  userId: mongoose.Types.ObjectId;
  label: 'home' | 'work' | 'favorite' | 'custom';
  customName?: string;
  address: string;
  lat: number;
  lng: number;
}

const SavedPlaceSchema = new Schema<ISavedPlace>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, enum: ['home', 'work', 'favorite', 'custom'], required: true },
    customName: { type: String },
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { timestamps: true }
);

export const SavedPlace = mongoose.model<ISavedPlace>('SavedPlace', SavedPlaceSchema);
