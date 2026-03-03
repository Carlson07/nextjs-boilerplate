// WalletRechargeModal.jsx
import React, { useState } from 'react';
import EnhancedPaymentModal from './EnhancedPaymentModal';

const WalletRechargeModal = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');

  return (
    <EnhancedPaymentModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      type="deposit"
      defaultAmount={amount}
    />
  );
};

export default WalletRechargeModal;