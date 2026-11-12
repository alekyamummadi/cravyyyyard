import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI must be set in backend/.env.');
  }


  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[MongoDB] Connected successfully.');
  } catch (err) {
    console.error(`[MongoDB] Could not connect to the configured database: ${err.message}`);
    throw err;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
  } catch (err) {
    console.error('[MongoDB] Disconnect error:', err.message);
  }
};
