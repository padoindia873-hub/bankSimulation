// models/DomesticBeneficiary.js
import mongoose from 'mongoose';

const domesticBeneficiarySchema = new mongoose.Schema({
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
  ifscCode: {
    type: String,
    required: true
  },
  phoneNumber: {
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
  panNumber: {
    type: String,
    default: ''
  },
  aadharNumber: {
    type: String,
    default: ''
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

domesticBeneficiarySchema.index({ userId: 1, accountNumber: 1 }, { unique: true });

const DomesticBeneficiary = mongoose.model('DomesticBeneficiary', domesticBeneficiarySchema);
export default DomesticBeneficiary;