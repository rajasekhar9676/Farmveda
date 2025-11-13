# How to Create Gmail App Password - Step by Step Guide

## ✅ Yes, Nodemailer is Implemented!

The email service is already set up using **nodemailer** with Gmail SMTP. You can find it in `lib/email.ts`.

## 📧 Gmail App Password Setup

### Why App Password?
Gmail requires an **App Password** (not your regular password) for third-party applications like our Node.js app. This is more secure than using your regular password.

### Step-by-Step Instructions

#### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com
2. Click on **Security** (left sidebar)
3. Under "How you sign in to Google", find **2-Step Verification**
4. Click **Get Started** (if not already enabled)
5. Follow the prompts to enable 2-Step Verification
   - You'll need to verify your phone number
   - You can use SMS or Google Authenticator app

#### Step 2: Generate App Password
1. After enabling 2-Step Verification, go back to **Security** page
2. Scroll down to "How you sign in to Google"
3. Click on **App passwords** (or go directly to: https://myaccount.google.com/apppasswords)
4. You may need to sign in again
5. You'll see a page titled "App passwords"

#### Step 3: Create App Password
1. Under "Select app", choose **Mail**
2. Under "Select device", choose **Other (Custom name)**
3. Type: **FarmVeda** (or any name you prefer)
4. Click **Generate**
5. Google will show you a **16-character password** like: `abcd efgh ijkl mnop`
6. **Copy this password immediately** (you won't be able to see it again!)

#### Step 4: Add to .env.local
1. Open your `.env.local` file in the `farmveda` folder
2. Add these lines:
   ```env
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```
3. **Important**: 
   - Remove all spaces from the app password
   - Use the email address that has the app password
   - Don't use quotes around the values

### Example .env.local Entry

```env
# Your Gmail email address
GMAIL_USER=john.doe@gmail.com

# App Password (16 characters, no spaces)
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

## 🔍 Quick Links

- **Security Settings**: https://myaccount.google.com/security
- **2-Step Verification**: https://myaccount.google.com/signinoptions/two-step-verification
- **App Passwords**: https://myaccount.google.com/apppasswords

## ⚠️ Important Notes

1. **App Password Format**: 
   - It's 16 characters
   - Usually shown as: `xxxx xxxx xxxx xxxx` (with spaces)
   - Remove spaces when adding to `.env.local`: `xxxxxxxxxxxxxxxx`

2. **Which Email to Use**:
   - Use the Gmail address where you enabled 2-Step Verification
   - This email will be the "from" address for all emails sent

3. **Security**:
   - Never share your App Password
   - Never commit `.env.local` to git
   - You can revoke App Passwords anytime from the same page

4. **If You Can't See "App Passwords" Option**:
   - Make sure 2-Step Verification is enabled first
   - Try refreshing the page
   - Make sure you're signed in to the correct Google account

## 🧪 Testing

After adding the credentials:

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test email sending**:
   - Mark an order as "Delivered" in admin panel
   - Check the customer's email inbox
   - Check server console for email sending logs

3. **Check for errors**:
   - If emails don't send, check server console
   - Common errors:
     - Wrong App Password format (should be 16 chars, no spaces)
     - 2-Step Verification not enabled
     - Wrong email address

## 📝 Troubleshooting

### Error: "Invalid login"
- Check that App Password is correct (16 characters, no spaces)
- Verify 2-Step Verification is enabled
- Make sure GMAIL_USER matches the account with App Password

### Error: "Less secure app access"
- This shouldn't happen with App Passwords
- Make sure you're using App Password, not regular password

### Can't find "App Passwords" option
- Enable 2-Step Verification first
- Wait a few minutes after enabling
- Try accessing directly: https://myaccount.google.com/apppasswords

## ✅ Verification

Once set up correctly, you should see in server logs:
```
Email sent: <message-id>
Payment link email sent to customer@example.com
```

The email service is ready to use! 🎉

