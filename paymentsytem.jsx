// ===============================
// 💰 ENHANCED PAYMENT SYSTEM
// ===============================

// Payment Context
const PaymentContext = React.createContext();

export const usePayment = () => {
  const context = React.useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadPaymentMethods();
    loadTransactionHistory();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await UniLinkAPI.payments.getPaymentMethods();
      setPaymentMethods(methods.data || []);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      // Fallback to default methods
      setPaymentMethods(Object.values(enhancedPaymentMethods));
    }
  };

  const loadTransactionHistory = async () => {
    try {
      const response = await UniLinkAPI.payments.getTransactionHistory();
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const processPayment = async (paymentData) => {
    setLoading(true);
    try {
      const result = await UniLinkAPI.payments.initiatePayment(paymentData);
      
      if (result.success) {
        setTransactions(prev => [result.data, ...prev]);
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return { success: false, error: 'Payment failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const processDeposit = async (amount, method, details) => {
    return processPayment({
      type: 'deposit',
      amount,
      method,
      details,
      currency: 'USD'
    });
  };

  const processWithdrawal = async (amount, method, accountDetails) => {
    return processPayment({
      type: 'withdrawal',
      amount,
      method,
      details: accountDetails,
      currency: 'USD'
    });
  };

  const value = {
    paymentMethods,
    transactions,
    loading,
    processDeposit,
    processWithdrawal,
    processPayment,
    refreshTransactions: loadTransactionHistory
  };

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
};

// Enhanced Payment Methods Configuration
export const enhancedPaymentMethods = {
  // Zimbabwe Mobile Money
  ecocash: {
    id: 'ecocash',
    name: 'EcoCash',
    icon: '📱',
    type: 'mobile_money',
    category: 'local',
    currencies: ['USD', 'ZWL'],
    countries: ['Zimbabwe'],
    fees: { deposit: 0, withdrawal: 0.02 },
    limits: { min: 0.50, max: 1000, daily: 5000 },
    fields: [
      { name: 'phone', type: 'tel', label: 'Mobile Number', required: true, pattern: '/^+263[0-9]{9}$/' }
    ]
  },
  
  onemoney: {
    id: 'onemoney',
    name: 'OneMoney',
    icon: '💰',
    type: 'mobile_money',
    category: 'local',
    currencies: ['USD', 'ZWL'],
    countries: ['Zimbabwe'],
    fees: { deposit: 0, withdrawal: 0.02 },
    limits: { min: 0.50, max: 1000, daily: 5000 },
    fields: [
      { name: 'phone', type: 'tel', label: 'Mobile Number', required: true }
    ]
  },

  // Regional Payment Methods
  netcash: {
    id: 'netcash',
    name: 'NetCash',
    icon: '💻',
    type: 'ewallet',
    category: 'regional',
    currencies: ['USD', 'ZAR', 'BWP'],
    countries: ['South Africa', 'Zimbabwe', 'Botswana', 'Namibia'],
    fees: { deposit: 0.015, withdrawal: 0.02 },
    limits: { min: 1.00, max: 5000, daily: 10000 },
    fields: [
      { name: 'username', type: 'text', label: 'NetCash Username', required: true },
      { name: 'pin', type: 'password', label: 'NetCash PIN', required: true }
    ]
  },

  paynow: {
    id: 'paynow',
    name: 'PayNow',
    icon: '⚡',
    type: 'instant_bank',
    category: 'regional',
    currencies: ['USD', 'ZAR'],
    countries: ['South Africa', 'Namibia', 'Botswana'],
    fees: { deposit: 0.01, withdrawal: 0.015 },
    limits: { min: 0.50, max: 2000, daily: 5000 },
    fields: [
      { name: 'bank', type: 'select', label: 'Bank', required: true, options: ['Standard Bank', 'FNB', 'Nedbank', 'ABSA'] },
      { name: 'account_number', type: 'text', label: 'Account Number', required: true }
    ]
  },

  // International Cards
  visa: {
    id: 'visa',
    name: 'Visa',
    icon: '💳',
    type: 'credit_card',
    category: 'international',
    currencies: ['USD', 'EUR', 'GBP', 'ZAR'],
    countries: ['International'],
    fees: { deposit: 0.029, withdrawal: 0.015 },
    limits: { min: 5.00, max: 10000, daily: 25000 },
    fields: [
      { name: 'card_number', type: 'text', label: 'Card Number', required: true, pattern: '/^[0-9]{16}$/' },
      { name: 'expiry_date', type: 'month', label: 'Expiry Date', required: true },
      { name: 'cvv', type: 'text', label: 'CVV', required: true, pattern: '/^[0-9]{3,4}$/' },
      { name: 'card_holder', type: 'text', label: 'Card Holder Name', required: true }
    ]
  },

  mastercard: {
    id: 'mastercard',
    name: 'MasterCard',
    icon: '💳',
    type: 'credit_card',
    category: 'international',
    currencies: ['USD', 'EUR', 'GBP', 'ZAR'],
    countries: ['International'],
    fees: { deposit: 0.029, withdrawal: 0.015 },
    limits: { min: 5.00, max: 10000, daily: 25000 },
    fields: [
      { name: 'card_number', type: 'text', label: 'Card Number', required: true, pattern: '/^[0-9]{16}$/' },
      { name: 'expiry_date', type: 'month', label: 'Expiry Date', required: true },
      { name: 'cvv', type: 'text', label: 'CVV', required: true, pattern: '/^[0-9]{3,4}$/' },
      { name: 'card_holder', type: 'text', label: 'Card Holder Name', required: true }
    ]
  },

  // Digital Wallets
  paypal: {
    id: 'paypal',
    name: 'PayPal',
    icon: '🌐',
    type: 'digital_wallet',
    category: 'international',
    currencies: ['USD', 'EUR', 'GBP'],
    countries: ['International'],
    fees: { deposit: 0.024, withdrawal: 0.02 },
    limits: { min: 1.00, max: 5000, daily: 10000 },
    fields: [
      { name: 'email', type: 'email', label: 'PayPal Email', required: true }
    ]
  },

  // African Payment Gateways
  flutterwave: {
    id: 'flutterwave',
    name: 'Flutterwave',
    icon: '🌍',
    type: 'payment_gateway',
    category: 'regional',
    currencies: ['USD', 'NGN', 'GHS', 'KES', 'ZAR'],
    countries: ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda', 'Tanzania'],
    fees: { deposit: 0.025, withdrawal: 0.02 },
    limits: { min: 1.00, max: 3000, daily: 7500 },
    fields: [
      { name: 'email', type: 'email', label: 'Email', required: true },
      { name: 'phone', type: 'tel', label: 'Phone Number', required: true }
    ]
  },

  mpesa: {
    id: 'mpesa',
    name: 'M-Pesa',
    icon: '📲',
    type: 'mobile_money',
    category: 'regional',
    currencies: ['KES', 'TZS', 'UGX'],
    countries: ['Kenya', 'Tanzania', 'Uganda'],
    fees: { deposit: 0, withdrawal: 0.015 },
    limits: { min: 0.50, max: 1500, daily: 3000 },
    fields: [
      { name: 'phone', type: 'tel', label: 'M-Pesa Number', required: true }
    ]
  }
};

// Payment Processing Hook
export const usePaymentProcessing = () => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const processTransaction = async (transactionData) => {
    setProcessing(true);
    setError(null);

    try {
      // Simulate API call
      const result = await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) { // 90% success rate for demo
            resolve({
              success: true,
              transactionId: 'TX_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
              ...transactionData,
              timestamp: new Date().toISOString(),
              status: 'completed'
            });
          } else {
            reject(new Error('Payment processing failed. Please try again.'));
          }
        }, 2000);
      });

      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setProcessing(false);
    }
  };

  return { processing, error, processTransaction };
};