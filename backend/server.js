import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import { seedDatabase } from './seed.js';
import authRoutes from './routes/authRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Restaurant Platform API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect Database, auto-seed if empty, and start server
const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET must be set in the backend environment before starting the server.');
    }

    await connectDB();

    // Auto-seed sample data if database is fresh/empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Auto-seeding initial sample data...');
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` Restaurant Platform Backend Server Started    `);
      console.log(` Port: ${PORT}                                  `);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Health Check: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

export default app;
