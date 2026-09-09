import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { User } from '../models/User';

async function seedAdmin() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rideflow';
  console.log(`[Admin Bootstrap] Connecting to ${uri}...`);
  await mongoose.connect(uri);

  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@rideflow.test';
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'AdminRideFlow2026!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await User.findOneAndUpdate(
    { email: adminEmail.toLowerCase() },
    {
      name: 'RideFlow System Administrator',
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: 'admin',
      phone: '+1 (555) 999-0000',
      rating: 5.0,
      isSuspended: false,
    },
    { upsert: true, new: true }
  );

  console.log('====================================================');
  console.log('  RideFlow Admin Account Successfully Bootstrapped');
  console.log(`  Email:    ${admin.email}`);
  console.log(`  Password: ${adminPassword}`);
  console.log('====================================================');

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('[Admin Bootstrap Error]', err);
  process.exit(1);
});
