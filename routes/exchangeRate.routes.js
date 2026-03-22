// routes/exchangeRate.routes.js
import express from 'express';
import auth from '../middleware/auth.js';
import ExchangeRate from '../models/ExchangeRate.js';

const router = express.Router();

// Get all exchange rates
router.get('/', async (req, res) => {
  try {
    const rates = await ExchangeRate.find().sort({ fromCurrency: 1, toCurrency: 1 });
    res.json(rates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get specific exchange rate
router.get('/:from/:to', async (req, res) => {
  try {
    const rate = await ExchangeRate.findOne({
      fromCurrency: req.params.from.toUpperCase(),
      toCurrency: req.params.to.toUpperCase()
    });
    
    if (!rate) {
      return res.status(404).json({ message: 'Exchange rate not found' });
    }
    
    res.json(rate);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update exchange rate (admin only)
router.put('/:from/:to', auth, async (req, res) => {
  try {
    const { rate } = req.body;
    
    const updatedRate = await ExchangeRate.findOneAndUpdate(
      {
        fromCurrency: req.params.from.toUpperCase(),
        toCurrency: req.params.to.toUpperCase()
      },
      { rate, lastUpdated: new Date() },
      { new: true, upsert: true }
    );
    
    res.json(updatedRate);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;