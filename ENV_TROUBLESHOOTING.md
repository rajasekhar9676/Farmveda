# MongoDB Connection String Troubleshooting

## Common Issues and Fixes

### Issue 1: "Invalid scheme" Error

**Error Message:**
```
Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"
```

**Causes:**
1. ❌ Extra spaces in `.env.local` file
2. ❌ Quotes around the connection string
3. ❌ Missing or incorrect MONGODB_URI variable name
4. ❌ File not in correct location

### ✅ Correct .env.local Format

**Location:** `farmveda/.env.local` (NOT in root folder)

**Content (NO QUOTES, NO SPACES):**
```env
MONGODB_URI=mongodb+srv://farmveda:yourpassword@cluster0.tnlezrq.mongodb.net/farmveda?retryWrites=true&w=majority
JWT_SECRET=farmveda-secret-key
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

### ❌ Common Mistakes:

**WRONG - With Quotes:**
```env
MONGODB_URI="mongodb+srv://..."
```

**WRONG - With Spaces:**
```env
MONGODB_URI = mongodb+srv://...
```

**WRONG - Wrong Location:**
- File in `react/.env.local` instead of `react/farmveda/.env.local`

**WRONG - Wrong Variable Name:**
```env
MONGO_URI=mongodb+srv://...
DATABASE_URL=mongodb+srv://...
```

### ✅ Correct Format Checklist:

- [ ] File is named exactly `.env.local` (with the dot at the start)
- [ ] File is in `farmveda` folder (same folder as `package.json`)
- [ ] Variable name is exactly `MONGODB_URI` (all caps, no typos)
- [ ] No quotes around the value
- [ ] No spaces around the `=` sign
- [ ] Connection string starts with `mongodb+srv://`
- [ ] Password is URL-encoded if it has special characters
- [ ] Database name `/farmveda` is included before the `?`

### Step-by-Step Fix:

1. **Check File Location:**
   ```
   react/
   └── farmveda/
       ├── .env.local  ← Should be HERE
       ├── package.json
       └── ...
   ```

2. **Check File Content:**
   Open `.env.local` and make sure it looks exactly like this (replace with your actual password):
   ```env
   MONGODB_URI=mongodb+srv://farmveda:YOUR_PASSWORD@cluster0.tnlezrq.mongodb.net/farmveda?retryWrites=true&w=majority
   JWT_SECRET=farmveda-secret-key
   NEXT_PUBLIC_BASE_URL=http://localhost:3001
   ```

3. **Restart Server:**
   - Stop server (Ctrl+C)
   - Run `npm run dev` again
   - Environment variables are only loaded on server start

4. **Test Connection:**
   - Visit: `http://localhost:3001/test-db`
   - Check the response

### Password with Special Characters:

If your password has special characters, URL-encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

**Example:**
If password is `MyPass@123#`, use:
```
MONGODB_URI=mongodb+srv://farmveda:MyPass%40123%23@cluster0.tnlezrq.mongodb.net/farmveda?retryWrites=true&w=majority
```

### Verify Environment Variable is Loaded:

1. Check server console on startup
2. Visit `/test-db` page - it will show if MONGODB_URI is found
3. Look for error messages in terminal


