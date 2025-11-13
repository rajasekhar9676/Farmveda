import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  const uri = process.env.MONGODB_URI;
  const uriTrimmed = uri?.trim();
  
  try {
    await connectDB();
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connection successful!',
      hasUri: !!uri,
      uriStartsWith: uriTrimmed?.substring(0, 20) || 'N/A',
      uriLength: uriTrimmed?.length || 0
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      hasUri: !!uri,
      uriExists: !!uriTrimmed,
      uriStartsWith: uriTrimmed?.substring(0, 30) || 'NOT FOUND',
      uriLength: uriTrimmed?.length || 0,
      rawUri: uri ? 'EXISTS' : 'NOT FOUND',
      note: 'Check .env.local file in farmveda folder. Make sure there are no extra spaces or quotes.'
    }, { status: 500 });
  }
}

