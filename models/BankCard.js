// models/BankCard.js
import mongoose from 'mongoose';

const bankCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount',
    required: true
  },
  cardNumber: {
    type: String,
    required: true,
    unique: true
  },
  cardHolderName: {
    type: String,
    required: true
  },
  expiryDate: {
    type: String,
    required: true
  },
  cvv: {
    type: String,
    required: true
  },
  cardType: {
    type: String,
    enum: ['DEBIT', 'CREDIT'],
    required: true
  },
  cardNetwork: {
    type: String,
    enum: ['VISA', 'MASTERCARD', 'RUPAY', 'AMEX'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isInternational: {
    type: Boolean,
    default: true
  },
  dailyLimit: {
    type: Number,
    required: true
  },
  creditLimit: {
    type: Number,
    default: null
  },
  outstandingBalance: {
    type: Number,
    default: 0
  },
  cardColor: {
    type: String,
    default: '#4A90E2'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const BankCard = mongoose.model('BankCard', bankCardSchema);
export default BankCard;