import mongoose from 'mongoose';

// Get MONGODB_URI and trim any whitespace
const MONGODB_URI = process.env.MONGODB_URI?.trim();

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  console.error('Please check your .env.local file exists and has MONGODB_URI');
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Validate the connection string format
if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
  console.error('❌ Invalid MONGODB_URI format:', MONGODB_URI.substring(0, 20) + '...');
  console.error('Connection string must start with mongodb:// or mongodb+srv://');
  throw new Error('Invalid MongoDB connection string format. Must start with mongodb:// or mongodb+srv://');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined. Please add it to your .env.local file.');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error.message);
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error('❌ Failed to connect to MongoDB:', e.message);
    throw new Error(`Database connection failed: ${e.message}`);
  }

  return cached.conn;
}

export default connectDB;

