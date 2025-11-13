# Gmail App Password - Correct Format

## ✅ Your App Password is CORRECT!

If you got a **16-character code with spaces** like: `abcd efgh ijkl mnop`, that's **correct**!

## 🔧 How to Use It in .env.local

### Step 1: Copy the App Password
Google shows: `abcd efgh ijkl mnop`

### Step 2: Remove ALL Spaces
Remove all spaces: `abcdefghijklmnop`

### Step 3: Add to .env.local
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

**Important**: 
- ✅ Remove ALL spaces (should be exactly 16 characters)
- ✅ No quotes needed
- ✅ Use the email address that created the app password

## 📝 About the "App Name" Field

When creating App Password:
- **App Name field**: You can enter anything like "Google", "FarmVeda", "Mail", etc.
- This is just a label for your reference
- It doesn't affect the password itself
- The important part is the **16-character password** you get

## ✅ Verification Checklist

Your `.env.local` should look like this:

```env
GMAIL_USER=yourname@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

Check:
- [ ] GMAIL_USER is your Gmail address
- [ ] GMAIL_APP_PASSWORD is exactly 16 characters (no spaces)
- [ ] No quotes around the values
- [ ] No extra spaces before/after

## 🧪 Test Email Sending

After updating `.env.local`:

1. **Restart your server** (important!)
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

2. **Check console logs** - You should see:
   ```
   📧 [EMAIL] Starting email send process...
   ✅ [EMAIL] Gmail credentials found
   ✅ [EMAIL] SMTP connection verified
   ✅ [EMAIL] Email sent successfully!
   ```

3. **If you see errors**, check:
   - App Password has no spaces
   - 2-Step Verification is enabled
   - Email address matches the account

## 🔍 Common Issues

### Issue: "Authentication failed"
**Solution**: 
- Make sure App Password has NO spaces
- Should be exactly 16 characters
- Verify 2-Step Verification is enabled

### Issue: "Invalid login"
**Solution**:
- Check GMAIL_USER matches the account
- Verify App Password is correct (16 chars, no spaces)
- Make sure you're using App Password, not regular password

### Issue: No console logs
**Solution**:
- Make sure server is restarted after adding .env.local
- Check that .env.local is in the `farmveda` folder (not parent folder)

## 📧 Console Logs Explained

When email is sent, you'll see:
```
📧 [EMAIL] Starting email send process...
📧 [EMAIL] To: customer@example.com
✅ [EMAIL] Gmail credentials found
📧 [EMAIL] App Password length: 16
✅ [EMAIL] SMTP connection verified
✅ [EMAIL] Email sent successfully!
✅ [EMAIL] Message ID: <message-id>
```

If there's an error, you'll see:
```
❌ [EMAIL] Error sending email:
❌ [EMAIL] Error message: [specific error]
❌ [EMAIL] Error code: [error code]
```

This will help you identify the exact problem!

