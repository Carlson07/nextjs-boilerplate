# UniLink Billing System Implementation

## Overview
The UniLink billing system implements a micro-billing model where users pay per minute of content consumed. The system supports multiple African payment methods including Ecocash, PayNow, M-Pesa, and other local systems. It ensures accurate revenue distribution between the platform (33%) and teachers (66%) with real-time transaction tracking.

## Supported Payment Methods in Africa

### 1. Ecocash (Zimbabwe)
- **Provider Code**: `ecocash`
- **Supported Countries**: Zimbabwe (ZW)
- **Integration Method**: Ecocash API with Econet/Zimbabwean banking partnerships
- **Transaction Fees**: ~2-5% depending on transaction amount
- **Settlement Time**: Instant to 24 hours

### 2. PayNow (Zimbabwe)
- **Provider Code**: `paynow`
- **Supported Countries**: Zimbabwe (ZW)
- **Integration Method**: PayNow standard integration
- **Transaction Fees**: ~1-3% depending on amount
- **Settlement Time**: Instant

### 3. M-Pesa (Kenya, Tanzania, Ghana, Democratic Republic of Congo)
- **Provider Code**: `mpesa`
- **Supported Countries**: Kenya (KE), Tanzania (TZ), Ghana (GH), DRC (CD)
- **Integration Method**: Safaricom API, Vodacom API (for Tanzania/DRC)
- **Transaction Fees**: Variable based on amount (0.01-10 USD)
- **Settlement Time**: Instant

### 4. Flutterwave (Pan-African)
- **Provider Code**: `flutterwave`
- **Supported Countries**: Multiple African countries
- **Integration Method**: Flutterwave Rave API
- **Transaction Fees**: ~1.4% + fixed fee
- **Settlement Time**: 24-48 hours

### 5. Paystack (Nigeria, Ghana)
- **Provider Code**: `paystack`
- **Supported Countries**: Nigeria (NG), Ghana (GH)
- **Integration Method**: Paystack API
- **Transaction Fees**: ~1.5% + fixed fee
- **Settlement Time**: 24 hours

### 6. Wave (Senegal, West Africa)
- **Provider Code**: `wave`
- **Supported Countries**: Senegal (SN), Mali (ML), Burkina Faso (BF)
- **Integration Method**: Wave API
- **Transaction Fees**: ~1-2%
- **Settlement Time**: Instant

### 7. Orange Money (Multiple Countries)
- **Provider Code**: `orange_money`
- **Supported Countries**: Côte d'Ivoire (CI), Cameroon (CM), Niger (NE), Chad (TD)
- **Integration Method**: Orange Money API
- **Transaction Fees**: ~1-3%
- **Settlement Time**: Instant

### 8. MTN Mobile Money (Multiple Countries)
- **Provider Code**: `mtn_mobile_money`
- **Supported Countries**: Uganda (UG), Rwanda (RW), Zambia (ZM), Ghana (GH), Nigeria (NG)
- **Integration Method**: MTN MOMO API
- **Transaction Fees**: Variable based on amount
- **Settlement Time**: Instant

## Billing Rates by Content Level

### Tiered Pricing Structure
```
Primary Education:
- VOD (Video on Demand): $0.04 per minute
- Live Streaming: $0.08 per minute (2x multiplier)

Secondary Education:
- VOD: $0.08 per minute
- Live Streaming: $0.16 per minute (2x multiplier)

Tertiary Education:
- VOD: $0.12 per minute
- Live Streaming: $0.24 per minute (2x multiplier)

Professional/Corporate:
- VOD: $0.15 per minute
- Live Streaming: $0.30 per minute (2x multiplier)
```

### Custom Rate Override
- Teachers can set custom rates above tier minimums
- Custom rates apply to all their content
- Minimum rates enforced based on content level

## Revenue Split Mechanism

### Standard Split: 33% Platform Fee, 66% Teacher Share
- **Platform Revenue**: 33% of each transaction
- **Teacher Revenue**: 66% of each transaction
- Calculated per heartbeat (every 60 seconds of viewing)

### Example Calculation
```
User watches 5 minutes of Secondary Education VOD:
- Total cost: 5 minutes × $0.08/min = $0.40
- Platform revenue: $0.40 × 0.33 = $0.13
- Teacher revenue: $0.40 × 0.66 = $0.27
```

## Billing Session Flow

### 1. Session Initialization
```
POST /api/videos/{videoId}/playback
Headers: Authorization: Bearer {token}

Response:
{
  "video": { ... },
  "billingRate": 0.08,
  "sessionId": "session-uuid",
  "isLive": false,
  "courseLevel": "secondary"
}
```

### 2. Heartbeat Billing (Every 60 seconds)
```
POST /api/billing/heartbeat
Headers: Authorization: Bearer {token}

Body:
{
  "videoId": "video-uuid",
  "sessionId": "session-uuid",
  "currentTime": 60
}

Response:
{
  "status": "ok",
  "remainingBalance": 15.20,
  "minutesBilled": 1,
  "amountCharged": 0.08,
  "teacherRevenue": 0.05,  // 66% of $0.08
  "platformFee": 0.03      // 33% of $0.08
}
```

### 3. Session Completion
```
POST /api/billing/session-end
Headers: Authorization: Bearer {token}

Body:
{
  "videoId": "video-uuid",
  "sessionId": "session-uuid",
  "totalTimeWatched": 300  // seconds
}
```

## Database Transactions for Billing

### Atomic Billing Operation
Each heartbeat executes an atomic database transaction:

```sql
BEGIN;

-- Check user has sufficient balance
SELECT balance FROM wallets WHERE user_id = ? FOR UPDATE;

-- Calculate amounts
SET @total_amount = @minutes_watched * @rate;
SET @teacher_share = @total_amount * 0.66;
SET @platform_fee = @total_amount * 0.33;

-- Deduct from user wallet
UPDATE wallets SET balance = balance - @total_amount WHERE user_id = ?;

-- Add to teacher wallet
UPDATE wallets SET balance = balance + @teacher_share WHERE user_id = ?;

-- Record transaction in ledger
INSERT INTO ledger_entries (user_id, video_id, transaction_type, amount, description)
VALUES (?, ?, 'spend', @total_amount, 'Video consumption');

INSERT INTO ledger_entries (user_id, video_id, transaction_type, amount, description)
VALUES (?, ?, 'earning', @teacher_share, 'Video earning');

INSERT INTO ledger_entries (user_id, video_id, transaction_type, amount, description)
VALUES (?, ?, 'platform_fee', @platform_fee, 'Platform fee');

COMMIT;
```

## Payment Provider Integration

### Generic Payment Interface
```typescript
interface PaymentProvider {
  initiateDeposit(amount: number, userId: string, countryCode: string): Promise<PaymentInitiationResult>;
  validateWebhook(payload: any, signature: string): boolean;
  processWebhook(data: PaymentWebhookData): Promise<void>;
  initiatePayout(amount: number, recipient: string, providerOptions?: any): Promise<PayoutResult>;
}
```

### Ecocash Implementation
```typescript
class EcocashProvider implements PaymentProvider {
  async initiateDeposit(amount: number, userId: string, countryCode: string) {
    const payload = {
      amount: amount.toString(),
      mobile_number: await this.getUserMobileNumber(userId),
      currency: 'USD',
      reference: `ECOCASH_${Date.now()}_${userId}`,
      callback_url: `${process.env.API_URL}/webhooks/ecocash`,
      remark: 'UniLink Platform Deposit'
    };

    const response = await axios.post(
      'https://api.ecocash.co.zw/disburse/request',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    return {
      paymentLink: response.data.redirect_url,
      referenceId: response.data.reference,
      provider: 'ecocash'
    };
  }

  validateWebhook(payload: any, signature: string): boolean {
    // Validate HMAC signature
    const expectedSignature = crypto
      .createHmac('sha256', this.secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  async processWebhook(data: PaymentWebhookData) {
    if (!this.validateWebhook(data, data.signature)) {
      throw new Error('Invalid webhook signature');
    }

    // Verify payment status with Ecocash
    const verification = await this.verifyPayment(data.reference);
    
    if (verification.status === 'SUCCESSFUL') {
      // Credit user wallet
      await this.creditUserWallet(data.userId, data.amount);
      
      // Record transaction
      await this.recordTransaction({
        userId: data.userId,
        amount: data.amount,
        type: 'deposit',
        provider: 'ecocash',
        reference: data.reference
      });
    }
  }
}
```

### PayNow Implementation
```typescript
class PayNowProvider implements PaymentProvider {
  async initiateDeposit(amount: number, userId: string, countryCode: string) {
    const initPayload = {
      id: process.env.PAYNOW_INTEGRATION_ID,
      reference: `PAYNOW_${Date.now()}_${userId}`,
      amount: amount.toFixed(2),
      paymentmethod: 'ecocash', // or 'telecash', 'onemoney'
      returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
      resultUrl: `${process.env.API_URL}/webhooks/paynow`
    };

    const signature = crypto
      .createHash('md5')
      .update(
        initPayload.id +
        initPayload.reference +
        initPayload.amount +
        initPayload.returnUrl +
        process.env.PAYNOW_INTEGRATION_KEY
      )
      .digest('hex');

    const response = await axios.post('https://www.paynow.co.zw/interface/initiatetransaction', {
      ...initPayload,
      hash: signature.toUpperCase()
    });

    if (response.data.status === 'Ok') {
      return {
        paymentLink: response.data.browserurl,
        referenceId: response.data.paynowreference,
        provider: 'paynow'
      };
    } else {
      throw new Error(`PayNow error: ${response.data.error}`);
    }
  }

  validateWebhook(payload: any, signature: string): boolean {
    // PayNow uses MD5 hash for verification
    const hashString = 
      payload.reference +
      payload.amount +
      payload.pollurl +
      process.env.PAYNOW_INTEGRATION_KEY;
    
    const expectedHash = crypto.createHash('md5').update(hashString).digest('hex');
    
    return payload.hash.toLowerCase() === expectedHash.toLowerCase();
  }
}
```

## Payout System for Teachers

### Payout Request Process
```typescript
async requestPayout(userId: string, amount: number, provider: string, recipientDetails: any) {
  // Verify user is a teacher
  const user = await this.userService.findById(userId);
  if (user.role !== 'teacher') {
    throw new Error('Only teachers can request payouts');
  }

  // Verify user has sufficient balance
  const wallet = await this.walletService.getWallet(userId);
  if (wallet.balance < amount) {
    throw new Error('Insufficient balance for payout');
  }

  // Create payout request record
  const payoutRequest = await this.payoutRepository.create({
    userId,
    amount,
    provider,
    recipientDetails,
    status: 'pending',
    requestedAt: new Date()
  });

  // Process payout based on provider
  switch (provider) {
    case 'ecocash':
      return this.ecocashProvider.initiatePayout(amount, recipientDetails.mobileNumber);
    case 'mpesa':
      return this.mpesaProvider.initiatePayout(amount, recipientDetails.phoneNumber);
    case 'paynow':
      return this.paynowProvider.initiatePayout(amount, recipientDetails.accountNumber);
    default:
      throw new Error(`Unsupported payout provider: ${provider}`);
  }
}
```

## Fraud Prevention Measures

### 1. Session Validation
- Validate session ID exists and belongs to user
- Check video exists and is accessible
- Verify user has permission to access content

### 2. Rate Limiting
- Limit heartbeat frequency (min 30 seconds between calls)
- Detect and block rapid heartbeat requests
- Monitor for unusual billing patterns

### 3. Balance Verification
- Verify sufficient balance before processing heartbeat
- Implement grace period for insufficient balance
- Prevent negative wallet balances

### 4. Duplicate Prevention
- Use UUIDs for session IDs to prevent collisions
- Validate unique session per video/user combination
- Implement idempotency keys for transactions

## Error Handling

### Insufficient Balance (HTTP 402)
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient wallet balance for continued viewing",
    "requiredAmount": 0.08,
    "currentBalance": 0.05
  }
}
```

### Session Expired
```json
{
  "success": false,
  "error": {
    "code": "SESSION_EXPIRED",
    "message": "Billing session has expired, please restart video"
  }
}
```

### Invalid Video Access
```json
{
  "success": false,
  "error": {
    "code": "ACCESS_DENIED",
    "message": "You don't have permission to access this video"
  }
}
```

## Monitoring & Analytics

### Key Billing Metrics
- Average revenue per user (ARPU)
- Churn rate due to insufficient balance
- Payment success/failure rates by provider
- Teacher earnings by content level
- Revenue distribution accuracy

### Alerts
- Low balance notifications for users
- Failed payment processing alerts
- Revenue calculation discrepancies
- Unusual billing pattern detection

## Compliance & Reporting

### Financial Reporting
- Detailed transaction logs for auditing
- Revenue reports by teacher and content type
- Payment provider fee reconciliation
- Tax calculation and reporting

### Regulatory Compliance
- Transaction record retention (7 years)
- Anti-money laundering (AML) compliance
- Know Your Customer (KYC) verification
- Data protection compliance for financial data