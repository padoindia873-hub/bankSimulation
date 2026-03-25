// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// MongoDB Connection (keep your existing connection code)
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

console.log('📡 Attempting to connect to MongoDB...');

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log(`📊 Database: ${mongoose.connection.name}`);
  console.log(`🔗 Host: ${mongoose.connection.host}`);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

// Import all routes
import authRoutes from './routes/auth.routes.js';
import accountRoutes from './routes/account.routes.js';
import transferRoutes from './routes/transfer.routes.js';
import beneficiaryRoutes from './routes/beneficiary.routes.js';
import cardRoutes from './routes/card.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import exchangeRateRoutes from './routes/exchangeRate.routes.js';
import notificationRoutes from './routes/notification.routes.js';

// Mount all routes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/transfer', transferRoutes);
app.use('/api/beneficiary', beneficiaryRoutes);
app.use('/api/card', cardRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/exchange-rate', exchangeRateRoutes);
app.use('/api/notification', notificationRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    status: 'OK',
    timestamp: new Date(),
    database: states[dbState] || 'unknown',
    mongodb_uri: MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
  });
});

// Root route to show available endpoints
app.get('/', (req, res) => {
  res.json({
    message: 'Bank Simulation API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      account: '/api/account',
      transfer: '/api/transfer',
      beneficiary: '/api/beneficiary',
      card: '/api/card',
      transaction: '/api/transaction',
      exchangeRate: '/api/exchange-rate',
      notification: '/api/notification',
      health: '/api/health'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false,
    message: err.message || 'Server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: process.env.NODE_ENV || 'development'`);
  console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
});