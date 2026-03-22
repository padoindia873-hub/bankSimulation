// routes/card.routes.js
import express from 'express';
import auth from '../middleware/auth.js';
import BankCard from '../models/BankCard.js';

const router = express.Router();

// Get user's cards
router.get('/', auth, async (req, res, next) => {
  try {
    const cards = await BankCard.find({ userId: req.userId, isActive: true })
      .populate('accountId', 'accountNumber bankName');
    
    res.json(cards);
  } catch (error) {
    next(error);
  }
});

// Get card by ID
router.get('/:cardId', auth, async (req, res, next) => {
  try {
    const card = await BankCard.findOne({
      _id: req.params.cardId,
      userId: req.userId
    }).populate('accountId', 'accountNumber bankName');

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.json(card);
  } catch (error) {
    next(error);
  }
});

// Block card
router.patch('/:cardId/block', auth, async (req, res, next) => {
  try {
    const card = await BankCard.findOne({
      _id: req.params.cardId,
      userId: req.userId
    });

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    card.isActive = false;
    await card.save();

    res.json({ message: 'Card blocked successfully', card });
  } catch (error) {
    next(error);
  }
});

// Change card limit
router.patch('/:cardId/limit', auth, async (req, res, next) => {
  try {
    const { dailyLimit } = req.body;
    
    const card = await BankCard.findOne({
      _id: req.params.cardId,
      userId: req.userId
    });

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    card.dailyLimit = dailyLimit;
    await card.save();

    res.json({ message: 'Card limit updated successfully', card });
  } catch (error) {
    next(error);
  }
});

export default router;