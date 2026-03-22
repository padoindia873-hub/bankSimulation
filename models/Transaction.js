// models/Transaction.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
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
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['CREDIT', 'DEBIT', 'TRANSFER', 'RECHARGE', 'BILL_PAYMENT'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  counterparty: {
    type: String,
    required: true
  },
  counterpartyAccount: {
    type: String,
    default: null
  },
  counterpartyBank: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'PENDING', 'FAILED'],
    default: 'PENDING'
  },
  referenceNumber: {
    type: String,
    required: true,
    unique: true
  },
  balanceAfterTransaction: {
    type: Number,
    default: null
  },
  date: {
    type: Date,
    default: Date.now
  }
});

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ accountId: 1, date: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;