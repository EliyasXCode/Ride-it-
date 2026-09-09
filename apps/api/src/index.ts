import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import { config } from './config/env';
import { connectDB, isConnectedToMongo } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { setupRideSocket } from './sockets/rideSocket';
import { ScheduledRideWorker } from './workers/scheduledRideWorker';

import { authRouter } from './routes/authRoutes';
import { fareRouter } from './routes/fareRoutes';
import { rideRouter } from './routes/rideRoutes';
import { driverRouter } from './routes/driverRoutes';
import { adminRouter } from './routes/adminRoutes';
import { aiRouter } from './routes/aiRoutes';
import { paymentRouter } from './routes/paymentRoutes';
import { placesRouter } from './routes/placesRoutes';
import { supportRouter } from './routes/supportRoutes';

async function bootstrap() {
  const app = express();
  const server = http.createServer(app);

  // Initialize Socket.IO
  const io = new SocketIOServer(server, {
    cors: {
      origin: [config.webOrigin, 'http://localhost:3000'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Connect to Database
  await connectDB();

  // Basic Security & Parsing
  app.use(
    helmet({
      contentSecurityPolicy: false, // Handled by frontend
    })
  );

  app.use(
    cors({
      origin: [config.webOrigin, 'http://localhost:3000'],
      credentials: true,
    })
  );

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Session Store
  const sessionConfig: session.SessionOptions = {
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  };

  if (isConnectedToMongo) {
    sessionConfig.store = MongoStore.create({
      mongoUrl: config.mongoUri,
      collectionName: 'sessions',
      ttl: 7 * 24 * 60 * 60,
    });
  }

  app.use(session(sessionConfig));

  // Mount API routes
  const apiV1 = express.Router();

  apiV1.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      database: isConnectedToMongo ? 'connected' : 'memory_fallback',
      demoMode: config.demoMode,
      geminiConfigured: !!config.geminiApiKey,
      mapsConfigured: !!config.googleMapsServerApiKey,
      timestamp: new Date().toISOString(),
    });
  });

  apiV1.use('/auth', authRouter);
  apiV1.use('/fares', fareRouter);
  apiV1.use('/rides', rideRouter);
  apiV1.use('/drivers', driverRouter);
  apiV1.use('/admin', adminRouter);
  apiV1.use('/ai', aiRouter);
  apiV1.use('/payments', paymentRouter);
  apiV1.use('/places', placesRouter);
  apiV1.use('/support', supportRouter);

  app.use('/api/v1', apiV1);

  // Global Error Handler
  app.use(errorHandler);

  // Setup WebSockets
  setupRideSocket(io);

  // Start Scheduled Worker
  ScheduledRideWorker.start();

  // Start listening
  server.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`  🚀 RideFlow API running on http://localhost:${config.port}`);
    console.log(`  ⚡ Web Sockets active on port ${config.port}`);
    console.log(`  📍 Default City: ${config.defaultCity}`);
    console.log(`  🤖 Gemini Model: ${config.geminiModel}`);
    console.log(`====================================================`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('Shutting down RideFlow API gracefully...');
    ScheduledRideWorker.stop();
    server.close(() => {
      console.log('HTTP and Socket server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  console.error('Fatal Server Boot Error:', err);
  process.exit(1);
});
