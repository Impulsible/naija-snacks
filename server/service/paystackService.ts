// server/src/services/paystackService.ts
import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || '';
const PAYSTACK_CALLBACK_URL = process.env.PAYSTACK_CALLBACK_URL || 'http://localhost:5173/order-confirmation';

// Log key status (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log('🔑 Paystack Keys Status:');
  console.log(`  - Secret Key: ${PAYSTACK_SECRET_KEY ? '✅ Present' : '❌ Missing'}`);
  console.log(`  - Public Key: ${PAYSTACK_PUBLIC_KEY ? '✅ Present' : '❌ Missing'}`);
}

interface InitializePaymentParams {
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, any>;
  callback_url?: string;
}

interface InitializePaymentResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    reference: string;
    access_code: string;
  };
}

interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    reference: string;
    status: 'success' | 'failed' | 'pending';
    amount: number;
    paid_at: string;
    metadata: Record<string, any>;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
    authorization: {
      authorization_code: string;
      card_type: string;
      bank: string;
      brand: string;
      country_code: string;
    };
  };
}

export class PaystackService {
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    this.secretKey = PAYSTACK_SECRET_KEY;
    this.baseUrl = 'https://api.paystack.co';
  }

  // ─── Initialize Payment ──────────────────────────────────────────
  async initializePayment(params: InitializePaymentParams): Promise<{
    authorization_url: string;
    reference: string;
    access_code: string;
  }> {
    try {
      if (!this.secretKey) {
        throw new Error('PAYSTACK_SECRET_KEY is not configured');
      }

      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: params.email,
          amount: params.amount,
          reference: params.reference,
          metadata: params.metadata,
          callback_url: params.callback_url || PAYSTACK_CALLBACK_URL,
        }),
      });

      const data = await response.json() as InitializePaymentResponse;

      if (!data.status) {
        throw new Error(data.message || 'Payment initialization failed');
      }

      return {
        authorization_url: data.data.authorization_url,
        reference: data.data.reference,
        access_code: data.data.access_code,
      };
    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw error;
    }
  }

  // ─── Verify Payment ──────────────────────────────────────────────
  async verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
    try {
      if (!this.secretKey) {
        throw new Error('PAYSTACK_SECRET_KEY is not configured');
      }

      const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      const data = await response.json() as VerifyPaymentResponse;

      if (!data.status) {
        throw new Error(data.message || 'Payment verification failed');
      }

      return data;
    } catch (error) {
      console.error('Paystack verification error:', error);
      throw error;
    }
  }

  // ─── Webhook Verification ────────────────────────────────────────
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.secretKey) {
      console.error('PAYSTACK_SECRET_KEY is not configured for webhook verification');
      return false;
    }

    try {
      const hash = crypto
        .createHmac('sha512', this.secretKey)
        .update(payload)
        .digest('hex');
      
      return hash === signature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  // ─── Get Payment Status Helper ──────────────────────────────────
  getPaymentStatus(status: string): 'success' | 'failed' | 'pending' {
    if (status === 'success') return 'success';
    if (status === 'failed' || status === 'reversed' || status === 'abandoned') return 'failed';
    return 'pending';
  }
}

export const paystackService = new PaystackService();

// ─── Helper Functions ──────────────────────────────────────────────
export const generatePaymentReference = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `NS-${timestamp}-${random}`.toUpperCase();
};

export const convertToKobo = (amount: number): number => {
  return Math.round(amount * 100);
};

export const convertFromKobo = (amount: number): number => {
  return amount / 100;
};