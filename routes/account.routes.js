// routes/account.routes.js
import express from 'express';
import auth from '../middleware/auth.js';
import BankAccount from '../models/BankAccount.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// Get user's bank account
router.get('/my-account', auth, async (req, res, next) => {
  try {
    const account = await BankAccount.findOne({ userId: req.userId });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    next(error);
  }
});

// Get account balance
router.get('/balance', auth, async (req, res, next) => {
  try {
    const account = await BankAccount.findOne({ userId: req.userId });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json({
      accountNumber: account.accountNumber,
      balance: account.balance,
      formattedBalance: `₹ ${account.balance.toLocaleString('en-IN')}`
    });
  } catch (error) {
    next(error);
  }
});

// Get account statement with pagination
router.get('/statement', auth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, from, to } = req.query;
    
    const account = await BankAccount.findOne({ userId: req.userId });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    let query = { accountId: account._id };
    
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get recent transactions
router.get('/recent-transactions', auth, async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const account = await BankAccount.findOne({ userId: req.userId });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const transactions = await Transaction.find({ accountId: account._id })
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

// Get total balance across all accounts
router.get('/total-balance', auth, async (req, res, next) => {
  try {
    const accounts = await BankAccount.find({ userId: req.userId, isActive: true });
    
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    res.json({
      totalBalance,
      formattedTotal: `₹ ${totalBalance.toLocaleString('en-IN')}`,
      accounts: accounts.map(acc => ({
        id: acc._id,
        accountNumber: acc.accountNumber,
        bankName: acc.bankName,
        balance: acc.balance
      }))
    });
  } catch (error) {
    next(error);
  }
});

export default router;