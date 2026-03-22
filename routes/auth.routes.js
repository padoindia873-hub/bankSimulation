// routes/auth.routes.js
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

// Register - COMPLETE WORKING VERSION
router.post('/register', 
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  async (req, res) => {
    try {
      console.log('📝 Register attempt - Full version');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      // 1. Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { name, email, phone, password } = req.body;
      console.log('Processing registration for:', { name, email, phone });

      // 2. Check if user exists
      const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
      if (existingUser) {
        console.log('User already exists:', existingUser.email);
        return res.status(400).json({ 
          success: false,
          message: 'User already exists with this email or phone' 
        });
      }

      // 3. Create user
      const user = new User({
        userId: `USR${Date.now()}`,
        name,
        email,
        phone,
        password
      });

      await user.save();
      console.log('✅ User created successfully. ID:', user._id);

      // 4. Create bank account
      const accountNumber = `ACC${Date.now()}${Math.floor(Math.random() * 1000)}`;
      console.log('Creating account with number:', accountNumber);
      
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
      console.log('✅ Account created successfully. Account Number:', account.accountNumber);

      // 5. Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );
      console.log('✅ JWT token generated');

      // 6. Send success response
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
      
      // Check for specific MongoDB errors
      if (error.code === 11000) {
        return res.status(400).json({ 
          success: false,
          message: 'Duplicate key error. User may already exist.',
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
  }
);

// Login route
router.post('/login',
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    try {
      console.log('🔐 Login attempt:', req.body.email);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const account = await BankAccount.findOne({ userId: user._id });

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

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
  }
);

export default router;