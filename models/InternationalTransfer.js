// models/InternationalTransfer.js
import mongoose from 'mongoose';

const internationalTransferSchema = new mongoose.Schema({
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
  transferId: {
    type: String,
    required: true,
    unique: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderAccount: {
    type: String,
    required: true
  },
  receiverName: {
    type: String,
    required: true
  },
  receiverAccount: {
    type: String,
    required: true
  },
  receiverBankName: {
    type: String,
    required: true
  },
  receiverBankAddress: {
    type: String,
    required: true
  },
  receiverCountry: {
    name: String,
    code: String,
    flagEmoji: String,
    currency: String
  },
  receiverSwiftCode: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  amountInForeignCurrency: {
    type: Number,
    required: true
  },
  foreignCurrency: {
    type: String,
    required: true
  },
  exchangeRate: {
    type: Number,
    required: true
  },
  feeAmount: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  transferDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    default: 'PENDING'
  },
  purposeOfTransfer: {
    type: String,
    required: true
  },
  referenceNumber: {
    type: String,
    required: true,
    unique: true
  },
  estimatedDeliveryDate: {
    type: Date,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
});

const InternationalTransfer = mongoose.model('InternationalTransfer', internationalTransferSchema);
export default InternationalTransfer;