# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account (no credit card required)
3. Verify your email

## Step 2: Create a Cluster

1. After login, click **"Build a Database"**
2. Choose **FREE** (M0) tier
3. Select your preferred cloud provider and region (choose closest to you)
4. Click **"Create"** (takes 3-5 minutes)

## Step 3: Create Database User

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username and password (save these!)
5. Set user privileges to **"Atlas Admin"** (for free tier)
6. Click **"Add User"**

## Step 4: Whitelist Your IP

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - Or add your specific IP for production
4. Click **"Confirm"**

## Step 5: Get Connection String

1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. Replace `<password>` with your database user password
6. Add database name at the end: `...mongodb.net/farmveda?retryWrites=true&w=majority`

## Step 6: Add to Environment File

1. Create `.env.local` file in the `farmveda` folder (if not exists)
2. Add your connection string:

```env
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/farmveda?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Step 7: Install Dependencies

```bash
cd farmveda
npm install --legacy-peer-deps
```

## Step 8: Run the Application

```bash
npm run dev
```

The application will automatically:
- Connect to MongoDB Atlas
- Create the database collections
- Create default admin user (mobile: 1234567890, password: admin123)

## Troubleshooting

**Connection Error?**
- Check your connection string has correct password
- Verify IP is whitelisted in Network Access
- Make sure database name is added: `/farmveda`

**Can't connect?**
- Wait a few minutes after creating cluster
- Check MongoDB Atlas status page
- Verify username/password are correct

**Default Admin Not Created?**
- Check MongoDB connection is working
- Look at server console for errors
- Manually create admin user through MongoDB Atlas dashboard if needed

## Production Setup

For production:
1. Use a stronger JWT_SECRET
2. Whitelist only your server IP
3. Use environment-specific connection strings
4. Enable MongoDB Atlas monitoring
5. Set up database backups

