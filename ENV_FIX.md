# Fix Your .env.local File

## ❌ Your Current (WRONG):
```env
MONGODB_URI=mongodb+srv://abc:abc123@cluster0.tnlezrq.mongodb.net/farmveda?Cluster0
```

## ✅ Correct Format:
```env
MONGODB_URI=mongodb+srv://abc:abc123@cluster0.tnlezrq.mongodb.net/farmveda?retryWrites=true&w=majority
```

## What to Change:

1. **Remove** `?Cluster0` at the end
2. **Replace with** `?retryWrites=true&w=majority`

## Complete .env.local File:

Create or update your `.env.local` file in the `farmveda` folder with:

```env
MONGODB_URI=mongodb+srv://abc:abc123@cluster0.tnlezrq.mongodb.net/farmveda?retryWrites=true&w=majority
JWT_SECRET=farmveda-secret-key-change-in-production
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

## After Fixing:

1. **Save** the `.env.local` file
2. **Restart** your development server:
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again
3. **Test** the connection at: `http://localhost:3001/test-db`

## Why This Matters:

- `?retryWrites=true&w=majority` ensures:
  - Automatic retry on write failures
  - Majority write concern for data consistency
  - Proper MongoDB connection behavior

- `?Cluster0` is not a valid MongoDB connection parameter and will cause connection errors.


