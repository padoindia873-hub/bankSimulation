// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// CORS middleware
app.use(cors({
  origin: '*', // Allow all for testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// Import routes
import authRoutes from './routes/auth.routes.js';
import accountRoutes from './routes/account.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import beneficiaryRoutes from './routes/beneficiary.routes.js';
import cardRoutes from './routes/card.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import transferRoutes from './routes/transfer.routes.js';
import exchangeRateRoutes from './routes/exchangeRate.routes.js';

console.log('✅ Routes imported');

// Routes - with error handling wrapper
app.use('/api/auth', (req, res, next) => {
  console.log('📌 Auth route accessed');
  next();
}, authRoutes);

app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/transfer', transferRoutes);
app.use('/api/exchange-rates', exchangeRateRoutes);

console.log('✅ Routes mounted');

// Health check
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check hit');
  res.json({
    status: 'OK',
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Bank Simulation API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      'auth-test': '/api/auth/test'
    }
  });
});

// Error handling middleware - FIXED
app.use((err, req, res, next) => {
  console.error('❌ Error caught in middleware:', err);
  console.error('Error stack:', err.stack);
  
  // Send proper error response
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler - Must be last
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    message: `Route ${req.method} ${req.url} not found`,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'GET /api/auth/test',
      'POST /api/auth/register',
      'POST /api/auth/login'
    ]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Auth test: http://localhost:${PORT}/api/auth/test`);
});