# Local Testing Guide for Payment & Invoice

## ✅ Invoice Generation Works in Both Local & Production

The invoice PDF generation uses `jsPDF` which works perfectly in both local development and production. **No production-only dependencies.**

## 🔴 The Problem: Mobile Testing with Localhost

When you test payment on mobile:
- Razorpay redirects to your callback URL after payment
- If callback URL is `http://localhost:3000`, mobile devices **cannot access it**
- This is because `localhost` on mobile refers to the mobile device itself, not your computer

## ✅ Solutions for Local Testing

### Option 1: Use ngrok (Recommended for Mobile Testing)

**ngrok** creates a public URL that tunnels to your localhost.

1. **Install ngrok:**
   ```bash
   # Download from https://ngrok.com/download
   # Or use npm: npm install -g ngrok
   ```

2. **Start your Next.js app:**
   ```bash
   cd farmveda
   npm run dev
   ```

3. **Start ngrok:**
   ```bash
   ngrok http 3000
   ```

4. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

5. **Update `.env.local`:**
   ```env
   NEXT_PUBLIC_BASE_URL=https://abc123.ngrok.io
   ```

6. **Restart your Next.js server** to load the new env variable

7. **Now test payment on mobile** - Razorpay will redirect to the ngrok URL, which works on mobile!

### Option 2: Test Invoice Email Separately (No Payment Needed)

You can test if invoice emails are sending **without completing payment**:

1. **Create an order** (mark it as "delivered" in admin panel to get a payment link)

2. **Manually mark order as paid** (or use the test endpoint below)

3. **Test invoice email sending:**
   ```
   GET http://localhost:3000/api/test-invoice-email?orderId=YOUR_ORDER_ID
   ```

   Or in browser:
   ```
   http://localhost:3000/api/test-invoice-email?orderId=YOUR_ORDER_ID
   ```

   This will:
   - Find the order
   - Generate invoice email
   - Send it to customer's email
   - Return success/failure status

### Option 3: Test in Production (Easiest)

1. **Deploy to Vercel** (or your hosting)

2. **Set environment variables in Vercel:**
   - `NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app`
   - All other env variables (MongoDB, Razorpay, Gmail)

3. **Test payment on mobile** - it will work perfectly!

## 🧪 Testing Invoice Email Locally

### Method 1: Using Test Endpoint

1. **Get an order ID** from your database or admin panel

2. **Call the test endpoint:**
   ```bash
   # In browser or Postman
   http://localhost:3000/api/test-invoice-email?orderId=YOUR_ORDER_ID
   ```

3. **Check console logs** for detailed email sending status

4. **Check customer's email inbox** for the invoice

### Method 2: Check Console Logs

When payment completes (even if redirect fails), check your **server console** for:
```
📧 [PAYMENT CALLBACK] Sending invoice email to: customer@email.com
✅ [PAYMENT CALLBACK] Invoice email sent successfully!
```

If you see these logs, **invoice email is being sent** even if redirect fails.

## 📱 Testing Payment Flow on Mobile

### With ngrok:

1. Start ngrok: `ngrok http 3000`
2. Update `NEXT_PUBLIC_BASE_URL` in `.env.local` to ngrok URL
3. Restart Next.js server
4. Test payment on mobile - redirect will work!

### Without ngrok:

1. Complete payment on mobile
2. **Even if redirect fails**, check:
   - Server console logs (invoice email status)
   - Customer email inbox (invoice should arrive)
   - Admin panel (order status should be "paid")

## ✅ What Works in Local Mode

- ✅ Invoice PDF generation
- ✅ Email sending (if Gmail credentials are set)
- ✅ Order processing
- ✅ Payment link generation
- ✅ Database operations

## ❌ What Doesn't Work in Local Mode (Mobile Testing)

- ❌ Payment callback redirect (if using localhost URL)
- ❌ Mobile access to localhost URLs

## 🎯 Recommended Testing Flow

1. **Test invoice email locally** using test endpoint
2. **Test full payment flow** using ngrok OR deploy to production
3. **Verify in production** before going live

## 📝 Quick Test Checklist

- [ ] Invoice PDF generates correctly (`/api/invoice/ORDER_ID`)
- [ ] Test invoice email endpoint works (`/api/test-invoice-email?orderId=ORDER_ID`)
- [ ] Email arrives in customer inbox
- [ ] Payment callback finds order correctly
- [ ] Order status updates to "paid"
- [ ] Redirect works (with ngrok or in production)

