// routes/auth.routes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import BankAccount from '../models/BankAccount.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Bangladesh Banks
const BANGLADESH_BANKS = [
  { name: 'Sonali Bank Limited', ifscPrefix: 'SB', country: 'Bangladesh' },
  { name: 'Janata Bank Limited', ifscPrefix: 'JB', country: 'Bangladesh' },
  { name: 'Agrani Bank Limited', ifscPrefix: 'AB', country: 'Bangladesh' },
  { name: 'Rupali Bank Limited', ifscPrefix: 'RB', country: 'Bangladesh' },
  { name: 'Dutch-Bangla Bank Limited', ifscPrefix: 'DBBL', country: 'Bangladesh' },
  { name: 'BRAC Bank Limited', ifscPrefix: 'BBL', country: 'Bangladesh' },
  { name: 'Eastern Bank Limited', ifscPrefix: 'EBL', country: 'Bangladesh' },
  { name: 'The City Bank Limited', ifscPrefix: 'CBL', country: 'Bangladesh' },
  { name: 'Islami Bank Bangladesh Limited', ifscPrefix: 'IBBL', country: 'Bangladesh' },
  { name: 'Mutual Trust Bank Limited', ifscPrefix: 'MTB', country: 'Bangladesh' },
  { name: 'Mercantile Bank Limited', ifscPrefix: 'MBL', country: 'Bangladesh' },
  { name: 'Premier Bank Limited', ifscPrefix: 'PBL', country: 'Bangladesh' },
  { name: 'Prime Bank Limited', ifscPrefix: 'PRIME', country: 'Bangladesh' },
  { name: 'Southeast Bank Limited', ifscPrefix: 'SEBL', country: 'Bangladesh' },
  { name: 'Dhaka Bank Limited', ifscPrefix: 'DBL', country: 'Bangladesh' },
  { name: 'Al-Arafah Islami Bank Limited', ifscPrefix: 'AIBL', country: 'Bangladesh' },
  { name: 'Social Islami Bank Limited', ifscPrefix: 'SIBL', country: 'Bangladesh' },
  { name: 'Trust Bank Limited', ifscPrefix: 'TBL', country: 'Bangladesh' },
  { name: 'Standard Bank Limited', ifscPrefix: 'SBL', country: 'Bangladesh' },
  { name: 'One Bank Limited', ifscPrefix: 'OBL', country: 'Bangladesh' },
  { name: 'Uttara Bank Limited', ifscPrefix: 'UBL', country: 'Bangladesh' },
  { name: 'Pubali Bank Limited', ifscPrefix: 'PUBALI', country: 'Bangladesh' },
  { name: 'National Bank Limited', ifscPrefix: 'NBL', country: 'Bangladesh' },
  { name: 'AB Bank Limited', ifscPrefix: 'ABBL', country: 'Bangladesh' },
  { name: 'Bank Asia Limited', ifscPrefix: 'BAL', country: 'Bangladesh' },
  { name: 'IFIC Bank Limited', ifscPrefix: 'IFIC', country: 'Bangladesh' },
  { name: 'NRB Bank Limited', ifscPrefix: 'NRBB', country: 'Bangladesh' },
  { name: 'Modhumoti Bank Limited', ifscPrefix: 'MBL', country: 'Bangladesh' },
  { name: 'Midland Bank Limited', ifscPrefix: 'MID', country: 'Bangladesh' }
];

// Saudi Arabia Banks
const SAUDI_ARABIA_BANKS = [
  { name: 'National Commercial Bank (AlAhli)', ifscPrefix: 'NCB', country: 'Saudi Arabia' },
  { name: 'Al Rajhi Bank', ifscPrefix: 'ARB', country: 'Saudi Arabia' },
  { name: 'Riyad Bank', ifscPrefix: 'RIB', country: 'Saudi Arabia' },
  { name: 'Samba Financial Group', ifscPrefix: 'SAMBA', country: 'Saudi Arabia' },
  { name: 'Banque Saudi Fransi', ifscPrefix: 'BSF', country: 'Saudi Arabia' },
  { name: 'Arab National Bank', ifscPrefix: 'ANB', country: 'Saudi Arabia' },
  { name: 'Saudi British Bank (SABB)', ifscPrefix: 'SABB', country: 'Saudi Arabia' },
  { name: 'Alinma Bank', ifscPrefix: 'ALINMA', country: 'Saudi Arabia' },
  { name: 'Bank AlJazira', ifscPrefix: 'BJAZ', country: 'Saudi Arabia' },
  { name: 'Al Bilad Bank', ifscPrefix: 'BILAD', country: 'Saudi Arabia' },
  { name: 'Saudi Investment Bank', ifscPrefix: 'SAIB', country: 'Saudi Arabia' },
  { name: 'Gulf International Bank', ifscPrefix: 'GIB', country: 'Saudi Arabia' },
  { name: 'Emirates NBD Saudi Arabia', ifscPrefix: 'ENBD', country: 'Saudi Arabia' },
  { name: 'Qatar National Bank', ifscPrefix: 'QNB', country: 'Saudi Arabia' },
  { name: 'Muscat Bank', ifscPrefix: 'MB', country: 'Saudi Arabia' },
  { name: 'Bank of Bahrain and Kuwait', ifscPrefix: 'BBK', country: 'Saudi Arabia' },
  { name: 'Jordan Kuwait Bank', ifscPrefix: 'JKB', country: 'Saudi Arabia' },
  { name: 'National Bank of Kuwait', ifscPrefix: 'NBK', country: 'Saudi Arabia' },
  { name: 'Abu Dhabi Islamic Bank', ifscPrefix: 'ADIB', country: 'Saudi Arabia' },
  { name: 'Dubai Islamic Bank', ifscPrefix: 'DIB', country: 'Saudi Arabia' }
];

// Combine all banks
const ALL_BANKS = [...BANGLADESH_BANKS, ...SAUDI_ARABIA_BANKS];

// Branch locations
const BANGLADESH_BRANCHES = [
  'Dhaka Main Branch', 'Chittagong Branch', 'Rajshahi Branch', 'Khulna Branch',
  'Sylhet Branch', 'Barisal Branch', 'Rangpur Branch', 'Mymensingh Branch',
  'Comilla Branch', 'Narayanganj Branch', 'Gazipur Branch', 'Jessore Branch',
  'Bogra Branch', 'Dinajpur Branch', 'Pabna Branch', 'Noakhali Branch',
  'Feni Branch', 'Cox\'s Bazar Branch', 'Motijheel Branch', 'Gulshan Branch',
  'Banani Branch', 'Uttara Branch', 'Dhanmondi Branch', 'Mohakhali Branch'
];

const SAUDI_BRANCHES = [
  'Riyadh Main Branch', 'Jeddah Branch', 'Dammam Branch', 'Mecca Branch',
  'Medina Branch', 'Khobar Branch', 'Tabuk Branch', 'Buraydah Branch',
  'Hofuf Branch', 'Khamis Mushait Branch', 'Yanbu Branch', 'Abha Branch',
  'Najran Branch', 'Hail Branch', 'Jubail Branch', 'Al Khobar Branch',
  'King Abdullah District', 'Olaya Branch', 'Tahlia Street Branch',
  'Prince Sultan Street Branch', 'King Fahd Road Branch'
];

// Generate random bank details with country-specific selection
function getRandomBankDetails() {
  // Randomly select a bank from all banks
  const randomBank = ALL_BANKS[Math.floor(Math.random() * ALL_BANKS.length)];
  
  // Select branches based on country
  let randomBranch;
  if (randomBank.country === 'Bangladesh') {
    randomBranch = BANGLADESH_BRANCHES[Math.floor(Math.random() * BANGLADESH_BRANCHES.length)];
  } else {
    randomBranch = SAUDI_BRANCHES[Math.floor(Math.random() * SAUDI_BRANCHES.length)];
  }
  
  // Generate random IFSC/SWIFT code
  const randomCode = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const countryCode = randomBank.country === 'Bangladesh' ? 'BD' : 'SA';
  
  return {
    bankName: randomBank.name,
    ifscCode: `${randomBank.ifscPrefix}${randomCode}${countryCode}`,
    branchName: randomBranch,
    country: randomBank.country
  };
}

// Generate random account number (different formats for different countries)
function generateAccountNumber(country) {
  if (country === 'Bangladesh') {
    // Bangladesh account number format: 12-15 digits
    const prefix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const middle = Math.floor(Math.random() * 1000000000).toString().padStart(10, '0');
    const suffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}${middle}${suffix}`.slice(0, 15);
  } else {
    // Saudi Arabia account number format: IBAN style (14-16 digits)
    const prefix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const middle = Math.floor(Math.random() * 10000000000).toString().padStart(11, '0');
    const suffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}${middle}${suffix}`.slice(0, 16);
  }
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
    const accountNumber = generateAccountNumber(bankDetails.country);
    
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
      isActive: true,
      country: bankDetails.country
    });
    
    await account.save();
    console.log('✅ Account created with bank:', bankDetails.bankName);
    console.log('✅ Country:', bankDetails.country);
    console.log('✅ Account number:', accountNumber);
    console.log('✅ IFSC/SWIFT Code:', bankDetails.ifscCode);
    
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
        accountType: account.accountType,
        country: account.country || bankDetails.country
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
        accountType: account.accountType,
        country: account.country
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

// Endpoint to get available banks by country
router.get('/banks/:country?', (req, res) => {
  const { country } = req.params;
  
  let banks = ALL_BANKS;
  
  if (country) {
    if (country.toLowerCase() === 'bangladesh') {
      banks = BANGLADESH_BANKS;
    } else if (country.toLowerCase() === 'saudiarabia' || country.toLowerCase() === 'saudi') {
      banks = SAUDI_ARABIA_BANKS;
    }
  }
  
  const availableBanks = banks.map(bank => ({
    name: bank.name,
    ifscPrefix: bank.ifscPrefix,
    country: bank.country
  }));
  
  res.json({
    success: true,
    count: availableBanks.length,
    banks: availableBanks,
    countries: {
      bangladesh: BANGLADESH_BANKS.length,
      saudiArabia: SAUDI_ARABIA_BANKS.length,
      total: ALL_BANKS.length
    }
  });
});

// Endpoint to get bank statistics
router.get('/banks-stats', (req, res) => {
  res.json({
    success: true,
    statistics: {
      totalBanks: ALL_BANKS.length,
      bangladeshBanks: BANGLADESH_BANKS.length,
      saudiArabiaBanks: SAUDI_ARABIA_BANKS.length,
      bangladeshBranches: BANGLADESH_BRANCHES.length,
      saudiArabiaBranches: SAUDI_BRANCHES.length,
      lastUpdated: new Date().toISOString()
    }
  });
});

export default router;