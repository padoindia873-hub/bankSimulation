// routes/transfer.routes.js
import express from 'express';
import auth from '../middleware/auth.js';
import mongoose from 'mongoose';
import BankAccount from '../models/BankAccount.js';
import Transaction from '../models/Transaction.js';
import InternationalTransfer from '../models/InternationalTransfer.js';
import ExchangeRate from '../models/ExchangeRate.js';
import Notification from '../models/Notification.js';
import { generateTransactionId, generateReferenceNumber } from '../utils/helpers.js';

const router = express.Router();

// Domestic Transfer
router.post('/domestic', auth, async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { toAccountNumber, toIfsc, amount, description } = req.body;

    const senderAccount = await BankAccount.findOne({ userId: req.userId }).session(session);
    if (!senderAccount) {
      throw new Error('Sender account not found');
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount > senderAccount.balance) {
      throw new Error('Insufficient balance');
    }

    const receiverAccount = await BankAccount.findOne({ 
      accountNumber: toAccountNumber,
      ifscCode: toIfsc
    }).session(session);

    if (!receiverAccount) {
      throw new Error('Receiver account not found');
    }

    senderAccount.balance -= transferAmount;
    await senderAccount.save({ session });

    receiverAccount.balance += transferAmount;
    await receiverAccount.save({ session });

    const debitTransaction = new Transaction({
      userId: req.userId,
      accountId: senderAccount._id,
      transactionId: generateTransactionId(),
      amount: transferAmount,
      type: 'DEBIT',
      description: description || `Transfer to ${receiverAccount.accountHolderName}`,
      counterparty: receiverAccount.accountHolderName,
      counterpartyAccount: receiverAccount.accountNumber,
      counterpartyBank: receiverAccount.bankName,
      status: 'SUCCESS',
      referenceNumber: generateReferenceNumber(),
      balanceAfterTransaction: senderAccount.balance
    });
    await debitTransaction.save({ session });

    const creditTransaction = new Transaction({
      userId: receiverAccount.userId,
      accountId: receiverAccount._id,
      transactionId: generateTransactionId(),
      amount: transferAmount,
      type: 'CREDIT',
      description: description || `Transfer from ${senderAccount.accountHolderName}`,
      counterparty: senderAccount.accountHolderName,
      counterpartyAccount: senderAccount.accountNumber,
      counterpartyBank: senderAccount.bankName,
      status: 'SUCCESS',
      referenceNumber: generateReferenceNumber(),
      balanceAfterTransaction: receiverAccount.balance
    });
    await creditTransaction.save({ session });

    const senderNotification = new Notification({
      userId: req.userId,
      notificationId: `NOTIF${Date.now()}`,
      title: 'Transfer Successful',
      message: `₹${transferAmount.toLocaleString('en-IN')} transferred to ${receiverAccount.accountHolderName}`,
      type: 'TRANSACTION',
      data: { transactionId: debitTransaction.transactionId }
    });
    await senderNotification.save({ session });

    const receiverNotification = new Notification({
      userId: receiverAccount.userId,
      notificationId: `NOTIF${Date.now() + 1}`,
      title: 'Money Received',
      message: `₹${transferAmount.toLocaleString('en-IN')} received from ${senderAccount.accountHolderName}`,
      type: 'TRANSACTION',
      data: { transactionId: creditTransaction.transactionId }
    });
    await receiverNotification.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Transfer successful',
      transaction: debitTransaction,
      newBalance: senderAccount.balance
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

// International Transfer
router.post('/international', auth, async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      receiverName,
      receiverAccount,
      receiverBankName,
      receiverBankAddress,
      receiverCountry,
      swiftCode,
      amount,
      purpose
    } = req.body;

    const senderAccount = await BankAccount.findOne({ userId: req.userId }).session(session);
    if (!senderAccount) {
      throw new Error('Sender account not found');
    }

    const transferAmount = parseFloat(amount);
    
    const exchangeRateData = await ExchangeRate.findOne({
      fromCurrency: 'INR',
      toCurrency: receiverCountry.currency
    }).session(session);

    if (!exchangeRateData) {
      throw new Error('Exchange rate not available');
    }

    const foreignAmount = transferAmount / exchangeRateData.rate;
    const feeAmount = transferAmount * 0.02;
    const totalAmount = transferAmount + feeAmount;

    if (totalAmount > senderAccount.balance) {
      throw new Error('Insufficient balance including fees');
    }

    senderAccount.balance -= totalAmount;
    await senderAccount.save({ session });

    const transfer = new InternationalTransfer({
      userId: req.userId,
      accountId: senderAccount._id,
      transferId: `IMT${Date.now()}`,
      senderName: senderAccount.accountHolderName,
      senderAccount: senderAccount.accountNumber,
      receiverName,
      receiverAccount,
      receiverBankName,
      receiverBankAddress,
      receiverCountry,
      receiverSwiftCode: swiftCode,
      amount: transferAmount,
      amountInForeignCurrency: foreignAmount,
      foreignCurrency: receiverCountry.currency,
      exchangeRate: exchangeRateData.rate,
      feeAmount,
      totalAmount,
      purposeOfTransfer: purpose,
      referenceNumber: generateReferenceNumber(),
      estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    });

    await transfer.save({ session });

    const transaction = new Transaction({
      userId: req.userId,
      accountId: senderAccount._id,
      transactionId: transfer.transferId,
      amount: transferAmount,
      type: 'TRANSFER',
      description: `International Transfer to ${receiverName}`,
      counterparty: receiverName,
      counterpartyAccount: receiverAccount,
      counterpartyBank: receiverBankName,
      status: 'PENDING',
      referenceNumber: transfer.referenceNumber,
      balanceAfterTransaction: senderAccount.balance
    });
    await transaction.save({ session });

    const notification = new Notification({
      userId: req.userId,
      notificationId: `NOTIF${Date.now()}`,
      title: 'International Transfer Initiated',
      message: `Your international transfer of ₹${transferAmount.toLocaleString('en-IN')} to ${receiverName} is being processed`,
      type: 'TRANSACTION',
      data: { transferId: transfer.transferId }
    });
    await notification.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'International transfer initiated successfully',
      transfer,
      transaction
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

// Get international transfer history
router.get('/international/history', auth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    let query = { userId: req.userId };
    if (status) query.status = status;

    const transfers = await InternationalTransfer.find(query)
      .sort({ transferDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await InternationalTransfer.countDocuments(query);

    res.json({
      transfers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get international transfer by ID
router.get('/international/:transferId', auth, async (req, res, next) => {
  try {
    const transfer = await InternationalTransfer.findOne({
      transferId: req.params.transferId,
      userId: req.userId
    });

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    res.json(transfer);
  } catch (error) {
    next(error);
  }
});

export default router;