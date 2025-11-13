import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByMobile, createUser } from '@/lib/db';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { Address } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { name, mobile, password, address } = await request.json();

    if (!name || !mobile || !password) {
      return NextResponse.json(
        { error: 'Name, mobile, and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await findUserByMobile(mobile);

    if (existingUser) {
      return NextResponse.json(
        { error: 'Mobile number already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser({
      name,
      mobile,
      password: hashedPassword,
      role: 'customer',
      address: address as Address,
    });

    const token = generateToken({ id: newUser.id, role: newUser.role });
    const cookie = setAuthCookie(token);

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        mobile: newUser.mobile,
        role: newUser.role,
      },
      token: token, // Also send token in response for client-side storage
    });

    response.headers.set('Set-Cookie', cookie);
    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

