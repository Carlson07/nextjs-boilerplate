// ===============================
// 💰 REAL PAYMENT GATEWAY INTEGRATION
// ===============================

// Flutterwave Integration
class FlutterwavePayment {
  constructor(publicKey) {
    this.publicKey = publicKey;
  }

  async initializePayment(paymentData) {
    return new Promise((resolve, reject) => {
      const {
        amount,
        email,
        phone,
        name,
        currency = 'USD',
        paymentMethod,
        metadata = {}
      } = paymentData;

      window.FlutterwaveCheckout({
        public_key: this.publicKey,
        tx_ref: `UNILINK_${Date.now()}`,
        amount: amount,
        currency: currency,
        payment_options: 'card, mobilemoney, banktransfer',
        customer: {
          email: email,
          phone_number: phone,
          name: name,
        },
        customizations: {
          title: 'UniLink Africa',
          description: 'Educational Content Payment',
          logo: 'https://unilink-africa.com/logo.png',
        },
        callback: (response) => {
          if (response.status === 'successful') {
            resolve({
              success: true,
              transactionId: response.transaction_id,
              reference: response.tx_ref,
              amount: amount,
              method: paymentMethod,
              provider: 'flutterwave'
            });
          } else {
            reject(new Error('Payment failed: ' + response.message));
          }
        },
        onclose: () => {
          reject(new Error('Payment cancelled by user'));
        },
        metadata: metadata
      });
    });
  }
}

// PayPal Integration
class PayPalPayment {
  constructor(clientId) {
    this.clientId = clientId;
    this.loadPayPalSDK();
  }

  loadPayPalSDK() {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${this.clientId}&currency=USD`;
    script.async = true;
    document.head.appendChild(script);
  }

  async initializePayment(paymentData) {
    return new Promise((resolve, reject) => {
      if (!window.paypal) {
        reject(new Error('PayPal SDK not loaded'));
        return;
      }

      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: paymentData.amount.toString(),
                currency_code: 'USD'
              },
              description: paymentData.description || 'UniLink Africa Payment'
            }],
            application_context: {
              shipping_preference: 'NO_SHIPPING'
            }
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then(details => {
            resolve({
              success: true,
              transactionId: details.id,
              reference: details.purchase_units[0].reference_id,
              amount: paymentData.amount,
              method: 'paypal',
              provider: 'paypal',
              payer: details.payer
            });
          });
        },
        onError: (err) => {
          reject(new Error('PayPal payment failed: ' + err.message));
        },
        onCancel: () => {
          reject(new Error('Payment cancelled by user'));
        }
      }).render('#paypal-button-container');
    });
  }
}

// EcoCash Zimbabwe Integration
class EcoCashPayment {
  constructor(merchantCode, merchantPin) {
    this.merchantCode = merchantCode;
    this.merchantPin = merchantPin;
    this.baseURL = 'https://api.ecocash.com/process/transactions';
  }

  async initializePayment(paymentData) {
    const { amount, phone, reference } = paymentData;

    try {
      // Step 1: Request payment
      const requestPayload = {
        merchantCode: this.merchantCode,
        merchantPin: this.merchantPin,
        phoneNumber: phone.replace('+263', '0'),
        amount: amount,
        currency: 'USD',
        reference: reference,
        callbackUrl: 'https://unilink-africa.com/api/payments/ecocash/callback'
      };

      const response = await fetch(this.baseURL + '/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      const result = await response.json();

      if (result.success) {
        // Step 2: Poll for payment status
        return await this.pollPaymentStatus(reference);
      } else {
        throw new Error(result.message || 'EcoCash payment failed');
      }
    } catch (error) {
      throw new Error('EcoCash payment error: ' + error.message);
    }
  }

  async pollPaymentStatus(reference, maxAttempts = 30) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

      try {
        const statusResponse = await fetch(`${this.baseURL}/status/${reference}`);
        const status = await statusResponse.json();

        if (status.status === 'successful') {
          return {
            success: true,
            transactionId: status.transactionId,
            reference: reference,
            amount: status.amount,
            method: 'ecocash',
            provider: 'ecocash'
          };
        } else if (status.status === 'failed') {
          throw new Error('Payment failed or was cancelled');
        }
        // Continue polling if status is 'pending'
      } catch (error) {
        throw new Error('Status check failed: ' + error.message);
      }
    }

    throw new Error('Payment timeout - please try again');
  }
}

// Unified Payment Gateway
class UnifiedPaymentGateway {
  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }

  initializeProviders() {
    // Initialize all payment providers with their credentials
    this.providers.set('flutterwave', new FlutterwavePayment(process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY));
    this.providers.set('paypal', new PayPalPayment(process.env.REACT_APP_PAYPAL_CLIENT_ID));
    this.providers.set('ecocash', new EcoCashPayment(
      process.env.REACT_APP_ECO_CASH_MERCHANT_CODE,
      process.env.REACT_APP_ECO_CASH_MERCHANT_PIN
    ));
    
    // Add other providers...
    this.providers.set('visa', new StripePayment(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY));
    this.providers.set('mastercard', new StripePayment(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY));
  }

  async processPayment(paymentMethod, paymentData) {
    const provider = this.providers.get(paymentMethod);
    
    if (!provider) {
      throw new Error(`Payment method ${paymentMethod} not supported`);
    }

    try {
      const result = await provider.initializePayment(paymentData);
      
      // Record transaction in database
      await this.recordTransaction({
        ...result,
        userId: paymentData.userId,
        userType: paymentData.userType,
        description: paymentData.description
      });

      return result;
    } catch (error) {
      console.error('Payment processing error:', error);
      
      // Record failed transaction
      await this.recordFailedTransaction({
        method: paymentMethod,
        amount: paymentData.amount,
        userId: paymentData.userId,
        error: error.message
      });

      throw error;
    }
  }

  async recordTransaction(transaction) {
    await UniLinkAPI.payments.recordTransaction(transaction);
  }

  async recordFailedTransaction(failedTransaction) {
    await UniLinkAPI.payments.recordFailedTransaction(failedTransaction);
  }
}

// React Hook for Payments
export const usePaymentProcessing = () => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  const gateway = useRef(new UnifiedPaymentGateway());

  const processPayment = async (paymentMethod, paymentData) => {
    setProcessing(true);
    setError(null);

    try {
      const result = await gateway.current.processPayment(paymentMethod, paymentData);
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setProcessing(false);
    }
  };

  return { processing, error, processPayment };
};