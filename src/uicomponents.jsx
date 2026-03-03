// ===============================
// 🎨 ENHANCED UI COMPONENTS
// ===============================

// Enhanced Payment Modal Component
const EnhancedPaymentModal = memo(({ 
  isOpen, 
  onClose, 
  onSuccess, 
  type = 'deposit', 
  userCountry = 'Zimbabwe',
  defaultAmount = '' 
}) => {
  const [amount, setAmount] = useState(defaultAmount);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [step, setStep] = useState('method-selection'); // method-selection, details, processing, success
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const { processDeposit, processWithdrawal } = usePayment();

  // Filter available payment methods based on user country and transaction type
  const availableMethods = Object.values(enhancedPaymentMethods).filter(method => 
    method.countries.includes('International') || 
    method.countries.includes(userCountry)
  );

  const selectedMethodConfig = enhancedPaymentMethods[selectedMethod];

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    setStep('details');
    setError('');
  };

  const handleDetailChange = (field, value) => {
    setPaymentDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateDetails = () => {
    if (!selectedMethodConfig) return false;

    for (const field of selectedMethodConfig.fields) {
      if (field.required && !paymentDetails[field.name]) {
        setError(`${field.label} is required`);
        return false;
      }
      
      if (field.pattern && paymentDetails[field.name]) {
        const regex = new RegExp(field.pattern);
        if (!regex.test(paymentDetails[field.name])) {
          setError(`Invalid ${field.label} format`);
          return false;
        }
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || amount < selectedMethodConfig.limits.min) {
      setError(`Minimum amount is $${selectedMethodConfig.limits.min}`);
      return;
    }

    if (amount > selectedMethodConfig.limits.max) {
      setError(`Maximum amount is $${selectedMethodConfig.limits.max}`);
      return;
    }

    if (!validateDetails()) {
      return;
    }

    setProcessing(true);
    setStep('processing');
    setError('');

    try {
      const transactionData = {
        amount: parseFloat(amount),
        method: selectedMethod,
        details: paymentDetails,
        currency: 'USD'
      };

      const result = type === 'deposit' 
        ? await processDeposit(transactionData)
        : await processWithdrawal(transactionData);

      if (result.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess(result.data);
          onClose();
        }, 2000);
      } else {
        setError(result.error);
        setStep('details');
      }
    } catch (err) {
      setError('Transaction failed. Please try again.');
      setStep('details');
    } finally {
      setProcessing(false);
    }
  };

  const calculateFee = () => {
    if (!selectedMethodConfig || !amount) return 0;
    const feeRate = type === 'deposit' 
      ? selectedMethodConfig.fees.deposit 
      : selectedMethodConfig.fees.withdrawal;
    return amount * feeRate;
  };

  const netAmount = amount ? parseFloat(amount) - calculateFee() : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900">
            {type === 'deposit' ? 'Add Funds' : 'Withdraw Funds'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            disabled={processing}
          >
            <svg className="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {step === 'method-selection' && (
            <MethodSelectionStep
              methods={availableMethods}
              onMethodSelect={handleMethodSelect}
              type={type}
            />
          )}

          {step === 'details' && selectedMethodConfig && (
            <DetailsStep
              method={selectedMethodConfig}
              amount={amount}
              onAmountChange={setAmount}
              paymentDetails={paymentDetails}
              onDetailChange={handleDetailChange}
              onBack={() => setStep('method-selection')}
              onSubmit={handleSubmit}
              error={error}
              type={type}
              fee={calculateFee()}
              netAmount={netAmount}
            />
          )}

          {step === 'processing' && (
            <ProcessingStep method={selectedMethodConfig} amount={amount} />
          )}

          {step === 'success' && (
            <SuccessStep 
              method={selectedMethodConfig} 
              amount={amount} 
              type={type}
              netAmount={netAmount}
            />
          )}
        </div>
      </div>
    </div>
  );
});

// Method Selection Step Component
const MethodSelectionStep = memo(({ methods, onMethodSelect, type }) => {
  const categories = {
    local: { name: 'Local Payment Methods', color: 'green' },
    regional: { name: 'Regional Payments', color: 'blue' },
    international: { name: 'International', color: 'purple' }
  };

  const methodsByCategory = methods.reduce((acc, method) => {
    const category = method.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(method);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Select Payment Method
        </h3>
        
        {Object.entries(categories).map(([categoryKey, category]) => (
          methodsByCategory[categoryKey]?.length > 0 && (
            <div key={categoryKey} className="mb-6">
              <h4 className={`text-sm font-medium text-${category.color}-700 mb-3`}>
                {category.name}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {methodsByCategory[categoryKey].map(method => (
                  <button
                    key={method.id}
                    onClick={() => onMethodSelect(method.id)}
                    className="p-4 border-2 border-neutral-200 rounded-xl hover:border-green-500 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">{method.icon}</div>
                    <div className="font-medium text-neutral-900 text-sm">
                      {method.name}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      Fee: {(method.fees[type === 'deposit' ? 'deposit' : 'withdrawal'] * 100).toFixed(1)}%
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
});

// Details Step Component
const DetailsStep = memo(({ 
  method, 
  amount, 
  onAmountChange, 
  paymentDetails, 
  onDetailChange, 
  onBack, 
  onSubmit, 
  error, 
  type,
  fee,
  netAmount
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Method Header */}
      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
        <div className="text-2xl">{method.icon}</div>
        <div className="flex-1">
          <div className="font-medium text-green-700">{method.name}</div>
          <div className="text-xs text-green-600">
            {type === 'deposit' ? 'Deposit' : 'Withdrawal'} • {method.currencies.join('/')}
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-green-600 hover:text-green-700 text-sm font-medium"
        >
          Change
        </button>
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Amount (USD)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">$</span>
          <input
            type="number"
            min={method.limits.min}
            max={method.limits.max}
            step="0.01"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="w-full pl-8 pr-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
        <div className="flex justify-between text-xs text-neutral-500 mt-1">
          <span>Min: ${method.limits.min}</span>
          <span>Max: ${method.limits.max}</span>
        </div>
      </div>

      {/* Fee Display */}
      {amount && (
        <div className="bg-neutral-50 rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-neutral-600">Amount:</span>
            <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-neutral-600">Fee ({method.fees[type === 'deposit' ? 'deposit' : 'withdrawal'] * 100}%):</span>
            <span className="font-medium text-red-600">-${fee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t border-neutral-200 pt-2">
            <span className="text-neutral-900">
              {type === 'deposit' ? 'You will receive:' : 'You will get:'}
            </span>
            <span className="text-green-600">${netAmount.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Payment Method Specific Fields */}
      <div className="space-y-4">
        {method.fields.map(field => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                value={paymentDetails[field.name] || ''}
                onChange={(e) => onDetailChange(field.name, e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required={field.required}
              >
                <option value="">Select {field.label}</option>
                {field.options?.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={paymentDetails[field.name] || ''}
                onChange={(e) => onDetailChange(field.name, e.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required={field.required}
                pattern={field.pattern}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!amount || parseFloat(amount) < method.limits.min}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {type === 'deposit' ? `Deposit $${amount || '0'}` : `Withdraw $${amount || '0'}`}
        </button>
      </div>
    </form>
  );
});

// Processing Step Component
const ProcessingStep = memo(({ method, amount }) => {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 text-2xl mx-auto mb-4 animate-pulse">
        {method.icon}
      </div>
      <h3 className="text-xl font-bold text-neutral-900 mb-2">Processing Payment</h3>
      <p className="text-neutral-600 mb-6">
        Processing your {method.name} payment of ${amount}...
      </p>
      <div className="flex justify-center space-x-2">
        <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
        <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
      </div>
    </div>
  );
});

// Success Step Component
const SuccessStep = memo(({ method, amount, type, netAmount }) => {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 text-2xl mx-auto mb-4">
        ✅
      </div>
      <h3 className="text-xl font-bold text-neutral-900 mb-2">
        {type === 'deposit' ? 'Deposit Successful!' : 'Withdrawal Requested!'}
      </h3>
      <p className="text-neutral-600 mb-4">
        {type === 'deposit' 
          ? `$${netAmount} has been added to your wallet via ${method.name}.` 
          : `Your withdrawal of $${netAmount} via ${method.name} has been processed.`
        }
      </p>
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
        <div className="text-sm text-green-700">
          <div className="font-medium">Transaction Details:</div>
          <div className="mt-1 text-xs">
            Amount: ${amount} • Method: {method.name} • Net: ${netAmount}
          </div>
        </div>
      </div>
    </div>
  );
});