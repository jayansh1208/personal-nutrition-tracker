import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import prisma from './prisma';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

// Start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 NutriTrack Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
  });

  const shutdown = async () => {
    console.log('\nGracefully shutting down...');
    server.close(async () => {
      await prisma.$disconnect();
      console.log('Database disconnected. Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

export default app;
