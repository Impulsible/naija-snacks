// frontend/src/services/paystackService.ts

// Declare Paystack global type
declare global {
  interface Window {
    PaystackPop: any;
  }
}

// ─── Initialize Payment (Redirect) ───────────────────────────────
export const initiatePayment = async (orderId: string): Promise<void> => {
  try {
    const token = localStorage.getItem('naija-snacks-token');
    const response = await fetch(`/api/orders/${orderId}/pay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (data.success && data.authorization_url) {
      // Redirect to Paystack payment page
      window.location.href = data.authorization_url;
    } else {
      throw new Error(data.message || 'Payment initialization failed');
    }
  } catch (error) {
    console.error('Payment initialization error:', error);
    throw error;
  }
};

// ─── Verify Payment ──────────────────────────────────────────────
export const verifyPayment = async (reference: string): Promise<any> => {
  try {
    const response = await fetch(`/api/orders/verify-payment/${reference}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};

// ─── Open Paystack Popup ──────────────────────────────────────────
export const openPaystackPopup = (params: {
  email: string;
  amount: number;
  reference: string;
  orderId: string;
  callback: (response: any) => void;
  onClose?: () => void;
}): void => {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_748a6580ce75356886fd6054d6afdba2f11882d4';
  
  // Check if Paystack script is loaded
  if (typeof window.PaystackPop === 'undefined') {
    console.error('Paystack script not loaded. Please add the script to index.html');
    // Load script dynamically as fallback
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => {
      // Retry after script loads
      setTimeout(() => {
        openPaystackPopup(params);
      }, 500);
    };
    document.head.appendChild(script);
    return;
  }

  const handler = window.PaystackPop.setup({
    key: publicKey,
    email: params.email,
    amount: Math.round(params.amount * 100), // Convert to kobo
    ref: params.reference,
    metadata: {
      order_id: params.orderId,
    },
    callback: (response: any) => {
      // Payment successful
      console.log('Payment successful!', response);
      params.callback(response);
    },
    onClose: () => {
      // Payment modal closed
      console.log('Payment window closed');
      if (params.onClose) {
        params.onClose();
      }
    },
  });
  
  handler.openIframe();
};

// ─── Generate Reference ──────────────────────────────────────────
export const generateReference = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `NS-${timestamp}-${random}`.toUpperCase();
};

export default {
  initiatePayment,
  verifyPayment,
  openPaystackPopup,
  generateReference,
};