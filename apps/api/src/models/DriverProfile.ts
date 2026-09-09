import mongoose, { Schema, Document } from 'mongoose';

export interface IDriverProfile extends Document {
  userId: mongoose.Types.ObjectId;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  status: 'offline' | 'online' | 'busy';
  vehicle: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
    category: 'economy' | 'comfort' | 'xl';
  };
  driverLicenseNumber: string;
  documents: Array<{
    docType: string;
    filename: string;
    verified: boolean;
    uploadedAt: Date;
  }>;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    heading?: number;
    updatedAt: Date;
  };
  totalEarningsMinor: number;
}

const DriverProfileSchema = new Schema<IDriverProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
      required: true,
    },
    status: {
      type: String,
      enum: ['offline', 'online', 'busy'],
      default: 'offline',
      required: true,
    },
    vehicle: {
      make: { type: String, required: true },
      model: { type: String, required: true },
      year: { type: Number, required: true },
      licensePlate: { type: String, required: true },
      color: { type: String, required: true },
      category: {
        type: String,
        enum: ['economy', 'comfort', 'xl'],
        default: 'economy',
        required: true,
      },
    },
    driverLicenseNumber: { type: String, required: true },
    documents: [
      {
        docType: { type: String, required: true },
        filename: { type: String, required: true },
        verified: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [-122.4194, 37.7749], // San Francisco default
      },
      heading: { type: Number, default: 0 },
      updatedAt: { type: Date, default: Date.now },
    },
    totalEarningsMinor: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DriverProfileSchema.index({ 'location.coordinates': '2dsphere' });
DriverProfileSchema.index({ status: 1, approvalStatus: 1 });

export const DriverProfile = mongoose.model<IDriverProfile>('DriverProfile', DriverProfileSchema);
