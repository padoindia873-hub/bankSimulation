// routes/beneficiary.routes.js
import express from 'express';
import auth from '../middleware/auth.js';
import DomesticBeneficiary from '../models/DomesticBeneficiary.js';
import InternationalBeneficiary from '../models/InternationalBeneficiary.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all domestic beneficiaries
router.get('/domestic', auth, async (req, res) => {
  try {
    const beneficiaries = await DomesticBeneficiary.find({ userId: req.userId })
      .sort({ isFavorite: -1, name: 1 });
    res.json(beneficiaries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add domestic beneficiary
router.post('/domestic', auth, async (req, res) => {
  try {
    const { name, accountNumber, ifscCode, phoneNumber, branchName, bankName, panNumber, aadharNumber } = req.body;

    const existing = await DomesticBeneficiary.findOne({
      userId: req.userId,
      accountNumber
    });

    if (existing) {
      return res.status(400).json({ message: 'Beneficiary already exists' });
    }

    const beneficiary = new DomesticBeneficiary({
      userId: req.userId,
      beneficiaryId: uuidv4(),
      name,
      accountNumber,
      ifscCode,
      phoneNumber,
      branchName,
      bankName,
      panNumber: panNumber || '',
      aadharNumber: aadharNumber || ''
    });

    await beneficiary.save();
    res.status(201).json(beneficiary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update domestic beneficiary
router.put('/domestic/:beneficiaryId', auth, async (req, res) => {
  try {
    const beneficiary = await DomesticBeneficiary.findOne({
      beneficiaryId: req.params.beneficiaryId,
      userId: req.userId
    });

    if (!beneficiary) {
      return res.status(404).json({ message: 'Beneficiary not found' });
    }

    Object.assign(beneficiary, req.body);
    await beneficiary.save();

    res.json(beneficiary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete domestic beneficiary
router.delete('/domestic/:beneficiaryId', auth, async (req, res) => {
  try {
    const result = await DomesticBeneficiary.findOneAndDelete({
      beneficiaryId: req.params.beneficiaryId,
      userId: req.userId
    });

    if (!result) {
      return res.status(404).json({ message: 'Beneficiary not found' });
    }

    res.json({ message: 'Beneficiary deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle favorite
router.patch('/domestic/:beneficiaryId/favorite', auth, async (req, res) => {
  try {
    const beneficiary = await DomesticBeneficiary.findOne({
      beneficiaryId: req.params.beneficiaryId,
      userId: req.userId
    });

    if (!beneficiary) {
      return res.status(404).json({ message: 'Beneficiary not found' });
    }

    beneficiary.isFavorite = !beneficiary.isFavorite;
    await beneficiary.save();

    res.json(beneficiary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// International Beneficiaries
router.get('/international', auth, async (req, res) => {
  try {
    const beneficiaries = await InternationalBeneficiary.find({ userId: req.userId })
      .sort({ isFavorite: -1, name: 1 });
    res.json(beneficiaries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add international beneficiary
router.post('/international', auth, async (req, res) => {
  try {
    const { name, accountNumber, bankName, bankAddress, country, swiftCode } = req.body;

    const beneficiary = new InternationalBeneficiary({
      userId: req.userId,
      beneficiaryId: uuidv4(),
      name,
      accountNumber,
      bankName,
      bankAddress,
      country,
      swiftCode
    });

    await beneficiary.save();
    res.status(201).json(beneficiary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete international beneficiary
router.delete('/international/:beneficiaryId', auth, async (req, res) => {
  try {
    const result = await InternationalBeneficiary.findOneAndDelete({
      beneficiaryId: req.params.beneficiaryId,
      userId: req.userId
    });

    if (!result) {
      return res.status(404).json({ message: 'Beneficiary not found' });
    }

    res.json({ message: 'Beneficiary deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;