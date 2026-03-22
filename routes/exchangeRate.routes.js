// routes/exchangeRate.routes.js
import express from 'express';
import auth from '../middleware/auth.js';
import ExchangeRate from '../models/ExchangeRate.js';

const router = express.Router();

// Get all exchange rates
router.get('/', async (req, res, next) => {
  try {
    const rates = await ExchangeRate.find().sort({ fromCurrency: 1, toCurrency: 1 });
    res.json(rates);
  } catch (error) {
    next(error);
  }
});

// Get specific exchange rate
router.get('/:from/:to', async (req, res, next) => {
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
    next(error);
  }
});

// Update exchange rate (admin only)
router.put('/:from/:to', auth, async (req, res, next) => {
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
    next(error);
  }
});

export default router;