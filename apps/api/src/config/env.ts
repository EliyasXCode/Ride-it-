import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  webOrigin: process.env.WEB_ORIGIN || 'http://localhost:3000',
  sessionSecret: process.env.SESSION_SECRET || 'rideflow-default-secure-session-secret-key-32-chars-min',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/rideflow',
  googleMapsServerApiKey: process.env.GOOGLE_MAPS_SERVER_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  paymentProvider: process.env.PAYMENT_PROVIDER || 'stripe',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  demoMode: process.env.DEMO_MODE === 'true',
  defaultCity: process.env.DEFAULT_CITY || 'Nagpur, MH, India',
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'INR',
  defaultTimezone: process.env.DEFAULT_TIMEZONE || 'Asia/Kolkata',
};
