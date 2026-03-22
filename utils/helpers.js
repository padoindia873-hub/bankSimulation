// utils/helpers.js
import { randomBytes } from 'crypto';

export const generateTransactionId = () => {
  return `TXN${Date.now()}${randomBytes(4).toString('hex').toUpperCase()}`;
};

export const generateReferenceNumber = () => {
  return `REF${Date.now()}${randomBytes(3).toString('hex').toUpperCase()}`;
};

export const generateCardNumber = () => {
  let number = '';
  for (let i = 0; i < 4; i++) {
    if (i > 0) number += ' ';
    number += Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  }
  return number;
};

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};