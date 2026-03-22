// models/BankAccount.js
import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  accountHolderName: {
    type: String,
    required: true
  },
  ifscCode: {
    type: String,
    required: true
  },
  branchName: {
    type: String,
    required: true
  },
  bankName: {
    type: String,
    required: true
  },
  bankLogo: {
    type: String,
    default: null
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  accountType: {
    type: String,
    enum: ['SAVINGS', 'CURRENT', 'SALARY'],
    default: 'SAVINGS'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);
export default BankAccount;