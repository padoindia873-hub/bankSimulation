// routes/transaction.routes.js
import express from 'express';
import auth from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// Get transaction by ID
router.get('/:transactionId', auth, async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ 
      transactionId: req.params.transactionId,
      userId: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

// Get all transactions with filters
router.get('/', auth, async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      status,
      from,
      to,
      search 
    } = req.query;

    let query = { userId: req.userId };
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { counterparty: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } }
      ];
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

export default router;