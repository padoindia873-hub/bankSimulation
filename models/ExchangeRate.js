// models/ExchangeRate.js
import mongoose from 'mongoose';

const exchangeRateSchema = new mongoose.Schema({
  fromCurrency: {
    type: String,
    required: true
  },
  toCurrency: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

exchangeRateSchema.index({ fromCurrency: 1, toCurrency: 1 }, { unique: true });

const ExchangeRate = mongoose.model('ExchangeRate', exchangeRateSchema);
export default ExchangeRate;