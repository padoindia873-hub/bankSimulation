// routes/auth.routes.js
import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import BankAccount from '../models/BankAccount.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or phone' });
    }

    const user = new User({
      userId: `USR${Date.now()}`,
      name,
      email,
      phone,
      password
    });

    await user.save();

    const account = new BankAccount({
      userId: user._id,
      accountNumber: `ACC${Date.now()}${Math.floor(Math.random() * 1000)}`,
      accountHolderName: name.toUpperCase(),
      ifscCode: 'HDFC0001234',
      branchName: 'Main Branch',
      bankName: 'HDFC Bank',
      balance: 100000,
      accountType: 'SAVINGS',
      isActive: true
    });

    await account.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
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
        balance: account.balance
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
  try {
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
    console.error('Login error:', error);
    next(error);
  }
});

export default router;