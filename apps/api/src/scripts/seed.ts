import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { User } from '../models/User';
import { DriverProfile } from '../models/DriverProfile';
import { PricingSettings } from '../models/PricingSettings';
import { SavedPlace } from '../models/SavedPlace';

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rideflow';
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PROD_SEED) {
    console.error('FATAL: Seeding is disabled in production to protect real customer data.');
    process.exit(1);
  }

  console.log(`[Seed] Connecting to ${uri}...`);
  await mongoose.connect(uri);

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Seed Demo Rider
  const rider = await User.findOneAndUpdate(
    { email: 'rider@rideflow.test' },
    {
      name: 'Alex Rider',
      email: 'rider@rideflow.test',
      passwordHash: defaultPassword,
      role: 'rider',
      phone: '+1 (555) 019-2834',
      rating: 4.96,
      ratingCount: 42,
    },
    { upsert: true, new: true }
  );

  // 2. Seed Demo Driver
  const driverUser = await User.findOneAndUpdate(
    { email: 'driver@rideflow.test' },
    {
      name: 'Elena Rostova',
      email: 'driver@rideflow.test',
      passwordHash: defaultPassword,
      role: 'driver',
      phone: '+1 (555) 012-9988',
      rating: 4.98,
      ratingCount: 154,
    },
    { upsert: true, new: true }
  );

  await DriverProfile.findOneAndUpdate(
    { userId: driverUser._id },
    {
      userId: driverUser._id,
      approvalStatus: 'approved',
      status: 'online',
      vehicle: {
        make: 'Tesla',
        model: 'Model Y',
        year: 2024,
        licensePlate: '9ELN441',
        color: 'Pearl White',
        category: 'comfort',
      },
      driverLicenseNumber: 'DL9981244X',
      location: {
        type: 'Point',
        coordinates: [-122.4184, 37.7794], // San Francisco
        heading: 90,
        updatedAt: new Date(),
      },
      totalEarningsMinor: 145000, // $1,450.00
    },
    { upsert: true, new: true }
  );

  // 3. Seed Pricing Settings
  await PricingSettings.findOneAndUpdate(
    {},
    {
      currency: 'INR',
      bookingFeeMinor: 2000, // ₹20.00 booking fee
      taxRatePercent: 5.0, // 5% GST
      rates: {
        economy: { baseFareMinor: 5000, perKmMinor: 1400, perMinuteMinor: 150, minimumFareMinor: 8000 },
        comfort: { baseFareMinor: 7500, perKmMinor: 1800, perMinuteMinor: 200, minimumFareMinor: 12000 },
        xl: { baseFareMinor: 10000, perKmMinor: 2400, perMinuteMinor: 300, minimumFareMinor: 16000 },
      },
    },
    { upsert: true }
  );

  // 4. Seed Saved Places for Rider
  await SavedPlace.findOneAndUpdate(
    { userId: rider._id, label: 'home' },
    {
      userId: rider._id,
      label: 'home',
      customName: 'Home',
      address: '742 Montgomery St, San Francisco, CA',
      lat: 37.7963,
      lng: -122.4034,
    },
    { upsert: true }
  );

  await SavedPlace.findOneAndUpdate(
    { userId: rider._id, label: 'work' },
    {
      userId: rider._id,
      label: 'work',
      customName: 'Office',
      address: '1 Market St, San Francisco, CA',
      lat: 37.7941,
      lng: -122.3951,
    },
    { upsert: true }
  );

  console.log('[Seed] Database successfully seeded with demo accounts:');
  console.log('  Rider:  rider@rideflow.test  / password123');
  console.log('  Driver: driver@rideflow.test / password123');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed Error]', err);
  process.exit(1);
});
