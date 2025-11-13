# Environment Variables Configuration

Copy these variables to your `.env.local` file:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farmveda?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-secret-key-here-change-in-production

# Base URL (for production, use your actual domain)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Razorpay Credentials
# Get these from: https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Gmail API Credentials
# Generate App Password: https://myaccount.google.com/apppasswords
# Note: Use App Password, not your regular Gmail password
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
```

## Quick Setup Steps

1. **Create `.env.local` file** in the `farmveda` folder
2. **Copy the variables above** and fill in your values
3. **For Gmail App Password**: 
   - Enable 2FA on your Gmail account
   - Go to https://myaccount.google.com/apppasswords
   - Generate app password for "Mail"
   - Copy the 16-character password (remove spaces)
4. **For Razorpay**:
   - Sign up at https://razorpay.com
   - Get test keys from Dashboard → Settings → API Keys
5. **Restart your development server** after adding variables

