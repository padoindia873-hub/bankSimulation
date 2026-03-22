// seed/initialData.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ExchangeRate from '../models/ExchangeRate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const initialExchangeRates = [
  { fromCurrency: 'INR', toCurrency: 'USD', rate: 83.45 },
  { fromCurrency: 'INR', toCurrency: 'EUR', rate: 90.12 },
  { fromCurrency: 'INR', toCurrency: 'GBP', rate: 105.67 },
  { fromCurrency: 'INR', toCurrency: 'AED', rate: 22.71 },
  { fromCurrency: 'INR', toCurrency: 'SGD', rate: 61.89 },
  { fromCurrency: 'INR', toCurrency: 'CAD', rate: 61.23 },
  { fromCurrency: 'INR', toCurrency: 'AUD', rate: 54.56 },
  { fromCurrency: 'INR', toCurrency: 'JPY', rate: 0.55 },
  { fromCurrency: 'INR', toCurrency: 'CNY', rate: 11.48 },
  { fromCurrency: 'INR', toCurrency: 'CHF', rate: 92.34 }
];

export async function seedExchangeRates() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bank_simulation';
    
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ Connected to MongoDB');
    
    for (const rate of initialExchangeRates) {
      await ExchangeRate.findOneAndUpdate(
        { fromCurrency: rate.fromCurrency, toCurrency: rate.toCurrency },
        { ...rate, lastUpdated: new Date() },
        { upsert: true, new: true }
      );
      console.log(`✅ Seeded: ${rate.fromCurrency} → ${rate.toCurrency} = ${rate.rate}`);
    }
    
    console.log('✅ All exchange rates seeded successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding exchange rates:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedExchangeRates();
}