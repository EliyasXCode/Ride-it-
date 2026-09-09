import mongoose from 'mongoose';
import { config } from './env';

export let isConnectedToMongo = false;

export async function connectDB(): Promise<void> {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    isConnectedToMongo = true;
    console.log(`[Database] MongoDB connected successfully to ${config.mongoUri.split('@').pop()}`);
  } catch (error: any) {
    isConnectedToMongo = false;
    console.warn(`[Database Warning] Unable to connect to MongoDB: ${error.message}`);
    console.warn(`[Database Warning] RideFlow will operate in Memory-Resilient Mode for development/demo.`);
  }
}
