// routes/card.routes.js
import express from 'express';
import auth from '../middleware/auth.js';
import BankCard from '../models/BankCard.js';

const router = express.Router();

// Get user's cards
router.get('/', auth, async (req, res) => {
  try {
    const cards = await BankCard.find({ userId: req.userId, isActive: true })
      .populate('accountId', 'accountNumber bankName');
    
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get card by ID
router.get('/:cardId', auth, async (req, res) => {
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Block card
router.patch('/:cardId/block', auth, async (req, res) => {
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Change card limit
router.patch('/:cardId/limit', auth, async (req, res) => {
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;