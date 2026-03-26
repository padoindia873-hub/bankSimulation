// routes/auth.routes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import BankAccount from '../models/BankAccount.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Bank configuration
const BANKS = [
  { name: 'HDFC Bank', ifscPrefix: 'HDFC', branchPrefix: 'HDFC Branch' },
  { name: 'ICICI Bank', ifscPrefix: 'ICIC', branchPrefix: 'ICICI Branch' },
  { name: 'State Bank of India', ifscPrefix: 'SBIN', branchPrefix: 'SBI Branch' },
  { name: 'Axis Bank', ifscPrefix: 'UTIB', branchPrefix: 'Axis Branch' },
  { name: 'Kotak Mahindra Bank', ifscPrefix: 'KKBK', branchPrefix: 'Kotak Branch' },
  { name: 'Yes Bank', ifscPrefix: 'YESB', branchPrefix: 'Yes Branch' },
  { name: 'Punjab National Bank', ifscPrefix: 'PUNB', branchPrefix: 'PNB Branch' },
  { name: 'Bank of Baroda', ifscPrefix: 'BARB', branchPrefix: 'BOB Branch' },
  { name: 'Canara Bank', ifscPrefix: 'CNRB', branchPrefix: 'Canara Branch' },
  { name: 'Union Bank of India', ifscPrefix: 'UBIN', branchPrefix: 'Union Branch' }
];

const BRANCHES = [
  'Main Branch', 'Downtown Branch', 'City Center', 'West End', 'East Side',
  'North Plaza', 'South Square', 'Corporate Office', 'Business District',
  'Residential Area', 'Tech Park', 'Shopping Mall', 'Airport Road',
  'Railway Station', 'University Area', 'Hospital Road', 'Market Complex'
];

// Generate random bank details
function getRandomBankDetails() {
  const randomBank = BANKS[Math.floor(Math.random() * BANKS.length)];
  const randomBranch = BRANCHES[Math.floor(Math.random() * BRANCHES.length)];
  const randomCode = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return {
    bankName: randomBank.name,
    ifscCode: `${randomBank.ifscPrefix}${randomCode}`,
    branchName: randomBranch
  };
}

// Generate random account number
function generateAccountNumber() {
  const prefix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  const middle = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${middle}${suffix}`;
}

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth router is working' });
});

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Register attempt');
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. State:', mongoose.connection.readyState);
      return res.status(503).json({
        success: false,
        message: 'Database connection not ready. Please try again.'
      });
    }
    
    const { name, email, phone, password } = req.body;
    
    // Validate input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, email, phone, password'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }
    
    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { phone }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone'
      });
    }
    
    // Create user
    const user = new User({
      userId: `USR${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: password
    });
    
    await user.save();
    console.log('✅ User created:', user._id);
    
    // Generate random bank details
    const bankDetails = getRandomBankDetails();
    const accountNumber = generateAccountNumber();
    
    // Create bank account with random bank
    const account = new BankAccount({
      userId: user._id,
      accountNumber: accountNumber,
      accountHolderName: name.toUpperCase(),
      ifscCode: bankDetails.ifscCode,
      branchName: bankDetails.branchName,
      bankName: bankDetails.bankName,
      balance: 107865564800.75,
      accountType: 'SAVINGS',
      isActive: true
    });
    
    await account.save();
    console.log('✅ Account created with bank:', bankDetails.bankName);
    console.log('✅ Account number:', accountNumber);
    console.log('✅ IFSC Code:', bankDetails.ifscCode);
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
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
        bankName: account.bankName,
        ifscCode: account.ifscCode,
        branchName: account.branchName,
        accountType: account.accountType
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
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
        balance: account.balance,
        bankName: account.bankName,
        ifscCode: account.ifscCode,
        branchName: account.branchName,
        accountType: account.accountType
      } : null
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Optional: Endpoint to get available banks
router.get('/banks', (req, res) => {
  const availableBanks = BANKS.map(bank => ({
    name: bank.name,
    ifscPrefix: bank.ifscPrefix
  }));
  
  res.json({
    success: true,
    banks: availableBanks
  });
});

export default router;