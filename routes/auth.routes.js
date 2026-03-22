// routes/auth.routes.js - FIXED VERSION
import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import BankAccount from '../models/BankAccount.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth router is working' });
});

// Register - FIXED: No next parameter in validation chain
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Register attempt');
    
    // MANUAL VALIDATION (instead of using express-validator middleware)
    const { name, email, phone, password } = req.body;
    const errors = [];
    
    if (!name || name.trim() === '') {
      errors.push({ msg: 'Name is required' });
    }
    if (!email || !email.includes('@')) {
      errors.push({ msg: 'Valid email is required' });
    }
    if (!phone || phone.trim() === '') {
      errors.push({ msg: 'Phone number is required' });
    }
    if (!password || password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
    }
    
    if (errors.length > 0) {
      console.log('Validation errors:', errors);
      return res.status(400).json({ 
        success: false,
        errors: errors 
      });
    }

    console.log('Processing registration for:', { name, email, phone });

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email or phone' 
      });
    }

    // Create user
    const user = new User({
      userId: `USR${Date.now()}`,
      name,
      email,
      phone,
      password
    });

    await user.save();
    console.log('✅ User created successfully. ID:', user._id);

    // Create bank account
    const accountNumber = `ACC${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const account = new BankAccount({
      userId: user._id,
      accountNumber: accountNumber,
      accountHolderName: name.toUpperCase(),
      ifscCode: 'HDFC0001234',
      branchName: 'Main Branch',
      bankName: 'HDFC Bank',
      balance: 100000,
      accountType: 'SAVINGS',
      isActive: true
    });

    await account.save();
    console.log('✅ Account created successfully');

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Send response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      account: {
        id: account._id,
        accountNumber: account.accountNumber,
        balance: account.balance,
        bankName: account.bankName
      }
    });
    
  } catch (error) {
    console.error('❌ Registration error details:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Duplicate entry. User may already exist.',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Registration failed', 
      error: error.message,
      errorType: error.name
    });
  }
});

// Login route - Also fix this one
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body.email);
    
    const { email, password } = req.body;
    
    // Manual validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const account = await BankAccount.findOne({ userId: user._id });

    const token = jwt.sign(
      { userId: user._id }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      account: account ? {
        id: account._id,
        accountNumber: account.accountNumber,
        balance: account.balance
      } : null
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed', 
      error: error.message 
    });
  }
});

export default router;