// models/InternationalBeneficiary.js
import mongoose from 'mongoose';

const internationalBeneficiarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  beneficiaryId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  bankName: {
    type: String,
    required: true
  },
  bankAddress: {
    type: String,
    required: true
  },
  country: {
    name: String,
    code: String,
    flagEmoji: String,
    currency: String
  },
  swiftCode: {
    type: String,
    required: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  lastTransferDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const InternationalBeneficiary = mongoose.model('InternationalBeneficiary', internationalBeneficiarySchema);
export default InternationalBeneficiary;