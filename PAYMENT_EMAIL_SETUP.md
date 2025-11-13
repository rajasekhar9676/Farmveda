# Payment & Email Integration Setup Guide

## Overview
This system integrates Razorpay for payment links and Gmail API for sending emails. When an admin marks an order as "delivered", a payment link is automatically generated and sent to the customer's email. Upon payment completion, an invoice is automatically sent.

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Razorpay Credentials
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Gmail API Credentials
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Base URL (for production, use your actual domain)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Setup Instructions

### 1. Razorpay Setup

1. **Create Razorpay Account**
   - Go to https://razorpay.com
   - Sign up for an account
   - Complete KYC verification

2. **Get API Keys**
   - Go to Dashboard → Settings → API Keys
   - Generate Test Keys (for development) or Live Keys (for production)
   - Copy `Key ID` and `Key Secret`

3. **Add to .env.local**
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_key_secret_here
   ```

### 2. Gmail API Setup

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "FarmVeda" as the name
   - Click "Generate"
   - Copy the 16-character password (no spaces)

3. **Add to .env.local**
   ```env
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   ```
   **Note**: Remove spaces from the app password when adding to .env.local

### 3. Base URL Configuration

For **Development**:
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

For **Production**:
```env
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## How It Works

### 1. Order Delivery Flow

1. Admin marks order as "Delivered"
2. System automatically:
   - Creates Razorpay payment link
   - Generates QR code
   - Sends payment link email to customer

### 2. Payment Flow

1. Customer clicks payment link in email
2. Customer completes payment on Razorpay
3. Razorpay redirects to callback URL
4. System automatically:
   - Updates order status to "Paid"
   - Sends invoice email to customer

### 3. Email Notifications

**Payment Link Email** (sent when order is delivered):
- Contains order details
- Payment link button
- QR code (if generated)

**Invoice Email** (sent when payment is completed):
- Payment confirmation
- Invoice download link
- Order summary

## Testing

### Test Payment Link
1. Create a test order
2. Mark it as "Delivered" in admin panel
3. Check customer email for payment link
4. Use Razorpay test cards for payment testing

### Test Email Sending
1. Ensure Gmail credentials are correct
2. Check server logs for email sending status
3. Verify emails are received in customer inbox

## Troubleshooting

### Payment Link Not Generated
- Check Razorpay credentials in `.env.local`
- Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are correct
- Check server logs for errors

### Emails Not Sending
- Verify Gmail App Password is correct (16 characters, no spaces)
- Check that 2FA is enabled on Gmail account
- Ensure `GMAIL_USER` matches the account with App Password
- Check server logs for email errors

### Payment Callback Not Working
- Verify `NEXT_PUBLIC_BASE_URL` is correct
- Check Razorpay webhook settings (if using webhooks)
- Ensure callback URL is accessible

## Security Notes

1. **Never commit `.env.local` to git**
2. **Use App Passwords, not regular passwords**
3. **Use Test Keys for development, Live Keys for production**
4. **Keep credentials secure and rotate regularly**

## Future Enhancements

- WhatsApp API integration (replace email)
- SMS notifications
- Payment reminders
- Multiple payment methods

