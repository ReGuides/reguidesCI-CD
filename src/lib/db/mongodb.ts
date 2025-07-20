import mongoose from 'mongoose';
import { logError } from '@/lib/utils/errorHandler';
import { getDatabaseURI } from '@/lib/config';

const MONGODB_URI = getDatabaseURI();

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('✅ Connected to MongoDB');
  } catch (e) {
    logError('MongoDB connection error', e);
    throw new Error('Failed to connect to MongoDB');
  }
}

export async function disconnectFromDatabase() {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('✅ Disconnected from MongoDB');
  } catch (e) {
    logError('MongoDB disconnection error', e);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectFromDatabase();
  process.exit(0);
}); 