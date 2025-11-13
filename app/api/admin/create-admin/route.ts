import { NextResponse } from 'next/server';
import { initDefaultAdmin, initDB } from '@/lib/db';

export async function POST() {
  try {
    await initDB();
    await initDefaultAdmin();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created/verified successfully',
      credentials: {
        mobile: '1234567890',
        password: 'admin123'
      }
    });
  } catch (error: any) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create admin user',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

