import Razorpay from 'razorpay';

// Initialize Razorpay instance
export function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

// Create payment link
export async function createPaymentLink(params: {
  amount: number;
  currency?: string;
  description: string;
  customer: {
    name: string;
    email: string;
    contact: string;
  };
  notify?: {
    email: boolean;
    sms: boolean;
  };
  callback_url?: string;
  callback_method?: string;
  reference_id?: string; // Order ID for tracking
}) {
  try {
    const razorpay = getRazorpayInstance();

    const paymentLinkParams: any = {
      amount: params.amount * 100, // Convert to paise
      currency: params.currency || 'INR',
      description: params.description,
      customer: params.customer,
      notify: params.notify || { email: true, sms: false },
      reminder_enable: true,
      callback_url: params.callback_url || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/callback`,
      callback_method: params.callback_method || 'get',
    };

    // Add reference_id if provided (for order tracking)
    if (params.reference_id) {
      paymentLinkParams.reference_id = params.reference_id;
    }

    const paymentLink = await razorpay.paymentLink.create(paymentLinkParams);

    return paymentLink;
  } catch (error: any) {
    console.error('Error creating payment link:', error);
    throw new Error(error.message || 'Failed to create payment link');
  }
}

// Verify payment
export async function verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean> {
  try {
    const crypto = require('crypto');
    const razorpay = getRazorpayInstance();

    const text = orderId + '|' + paymentId;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    return generatedSignature === signature;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
}

